import { prisma } from './prisma';
import crypto from 'crypto';

export interface CapiLeadData {
  leadgenId: string;
  email?: string | null;
  phone?: string | null;
  status: string;
}

/**
 * Helper to get settings dynamically from the Database or fallback to environment variables
 */
async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });
    if (setting?.value) return setting.value;
    return process.env[key]?.trim() || null;
  } catch {
    return process.env[key]?.trim() || null;
  }
}

/**
 * SHA-256 Hashing for standard text (emails, names, etc.)
 * Trims leading/trailing spaces and converts to lowercase before hashing.
 */
function hashValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

/**
 * SHA-256 Hashing specifically for phone numbers
 * Keeps digits only, strips any non-digit formatting characters before hashing.
 */
function hashPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return null;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

/**
 * Sends a Lead lifecycle event back to Meta via Conversions API (CAPI)
 */
export async function sendLeadStatusEvent(lead: CapiLeadData) {
  try {
    // 1. Fetch credentials
    const pixelId = await getSetting('META_PIXEL_ID');
    const accessToken = await getSetting('META_CONVERSIONS_API_ACCESS_TOKEN');
    const testCode = await getSetting('META_TEST_EVENT_CODE');

    if (!pixelId || !accessToken) {
      console.warn('[CAPI] Meta Conversions API is not fully configured (missing Pixel ID or Access Token). Event transmission skipped.');
      return { success: false, error: 'Conversions API not configured' };
    }

    if (!lead.leadgenId) {
      console.warn('[CAPI] Leadgen ID (Meta Lead ID) is missing. Skipping event as it cannot be attributed without lead_id.');
      return { success: false, error: 'Missing leadgenId' };
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const hashedEmail = hashValue(lead.email);
    const hashedPhone = hashPhone(lead.phone);

    // 2. Build user_data (unhashed lead_id, hashed em/ph)
    // Note: lead_id is a specific field in user_data and must NOT be hashed.
    const userData: Record<string, unknown> = {
      lead_id: lead.leadgenId,
    };

    if (hashedEmail) {
      userData.em = hashedEmail;
    }
    if (hashedPhone) {
      userData.ph = hashedPhone;
    }

    // 3. Build custom_data
    // lead_event_source identifies your custom CRM, event_source must be 'crm'
    const customData = {
      lead_event_source: 'LeadSync',
      event_source: 'crm',
    };

    // Format event_name correctly. E.g. Capitalized "Qualified"
    const formattedStatus = lead.status.charAt(0).toUpperCase() + lead.status.slice(1).toLowerCase();

    // 4. Construct complete payload
    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: formattedStatus,
          event_time: eventTime,
          action_source: 'system_generated',
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    // If test code is configured in Events Manager, inject it to see events in 'Test Events' tab
    if (testCode) {
      payload.test_event_code = testCode;
    }

    console.log(`[CAPI] Dispatching Conversions API event to Meta for lead ${lead.leadgenId} (${formattedStatus})...`);

    // 5. Send POST request
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[CAPI] Meta Conversions API event dispatched successfully for lead ${lead.leadgenId}:`, result);
      return { success: true, data: result };
    } else {
      console.error(`[CAPI] Meta Conversions API error response for lead ${lead.leadgenId}:`, result);
      return { success: false, error: result.error?.message || 'API request rejected', details: result };
    }
  } catch (error) {
    console.error(`[CAPI] Exception occurred sending event for lead ${lead.leadgenId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
