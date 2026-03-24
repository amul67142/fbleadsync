import { prisma } from './prisma';

export interface MetaLeadData {
  field_data: { name: string; values: string[] }[];
  ad_name?: string;
  ad_id?: string;
  form_id?: string;
  created_time?: string;
}

export interface ParsedLeadData {
  name: string | null;
  email: string | null;
  phone: string | null;
  adName: string | null;
  adId: string | null;
  formId: string | null;
  formName?: string | null;
  pageName?: string | null;
  leadgenId?: string | null;
}

/**
 * Helper to get the Meta Page Access Token from the DB or Env
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'META_PAGE_ACCESS_TOKEN' }
    });
    if (setting?.value) return setting.value;
    return process.env.META_PAGE_ACCESS_TOKEN?.trim() || null;
  } catch {
    return process.env.META_PAGE_ACCESS_TOKEN?.trim() || null;
  }
}

/**
 * Fetches token details (permissions, etc.)
 */
export async function getTokenInfo() {
  const token = await getAccessToken();
  if (!token) return { status: 'missing', error: 'No token found' };

  try {
    // 1. Get Me info
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`);
    const meData = await meRes.json();

    if (!meRes.ok) return { status: 'invalid', error: meData.error?.message || 'Invalid token' };

    // 2. Get Permissions
    const permRes = await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${token}`);
    const permData = await permRes.json();

    return {
      status: 'valid',
      name: meData.name,
      id: meData.id,
      permissions: permData.data || [],
      token: token.substring(0, 10) + '...' + token.substring(token.length - 5)
    };
  } catch (err) {
    return { status: 'error', error: err instanceof Error ? err.message : String(err) };
  }
}

export async function fetchLeadData(leadgenId: string, formId?: string): Promise<ParsedLeadData | null> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("META_PAGE_ACCESS_TOKEN is not defined.");
    }

    // 1. Fetch lead details
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${leadgenId}?fields=field_data,ad_name,ad_id,form_id,page_id,created_time&access_token=${accessToken}`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;
    let pageName: string | null = null;
    let formName: string | null = null;

    if (res.ok) {
      data = await res.json();
    } else {
      const errorText = await res.text();
      console.error(`Meta Graph API direct lead fetch error for ${leadgenId}: ${errorText}`);

      if (formId) {
        console.log(`Attempting fallback: fetching leads for form ${formId}...`);
        const fallbackRes = await fetch(
          `https://graph.facebook.com/v19.0/${formId}/leads?access_token=${accessToken}`
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundLead = fallbackData.data.find((l: any) => l.id === leadgenId);
          if (foundLead) {
            console.log(`Fallback successful! Found lead ${leadgenId} in form leads.`);
            data = foundLead;
          }
        }
      }
    }

    if (!data) return null;

    // 2. Fetch Page Name if we have pageId
    const pageId = data.page_id;
    if (pageId) {
      try {
        const pageRes = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}?fields=name&access_token=${accessToken}`
        );
        if (pageRes.ok) {
          const pageData = await pageRes.json();
          pageName = pageData.name;
        }
      } catch {
        console.error(`Error fetching page name for ${pageId}`);
      }
    }

    // 3. Fetch Form Name if we have formId
    const activeFormId = data.form_id || formId;
    if (activeFormId) {
      try {
        const formRes = await fetch(
          `https://graph.facebook.com/v19.0/${activeFormId}?fields=name&access_token=${accessToken}`
        );
        if (formRes.ok) {
          const formData = await formRes.json();
          formName = formData.name;
        }
      } catch {
        console.error(`Error fetching form name for ${activeFormId}`);
      }
    }

    const parsed = parseMetaLead(data);
    return { ...parsed, pageName, formName };
  } catch (error) {
    console.error(`Exception fetching lead ${leadgenId}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Lists pages the current token can access
 */
export async function getPages() {
  const token = await getAccessToken();
  if (!token) throw new Error("No token found");

  const res = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,id,access_token&access_token=${token}`);
  const data = await res.json();
  
  if (!res.ok) {
    // Fallback: If it's a Page Access Token, 'me/accounts' won't exist.
    // Try to get the page info directly.
    if (data.error?.message?.includes('accounts') || data.error?.code === 100) {
      const pageRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=name,id&access_token=${token}`);
      const pageData = await pageRes.json();
      if (pageRes.ok) {
        return [{ name: pageData.name, id: pageData.id }];
      }
    }
    throw new Error(data.error?.message || "Failed to fetch pages");
  }
  
  return data.data || [];
}

/**
 * Lists Lead Forms for a specific page
 */
export async function getForms(pageId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No token found");

  // First, get the Page Access Token
  const pageRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${token}`);
  const pageData = await pageRes.json();
  
  const pageToken = pageData.access_token || token;

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/leadgen_forms?fields=name,id&access_token=${pageToken}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Failed to fetch forms");
  
  return data.data || [];
}

/**
 * Fetches all leads for a specific form
 */
export async function getFormLeads(formId: string, pageId?: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No token found");

  let activeToken = token;

  // If pageId is provided, try to get Page Access Token for better reliability
  if (pageId) {
    try {
      const pageRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${token}`);
      const pageData = await pageRes.json();
      if (pageData.access_token) {
        activeToken = pageData.access_token;
      }
    } catch (e) {
      console.error("Error fetching page access token for form leads:", e);
    }
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${formId}/leads?fields=field_data,ad_name,ad_id,form_id,created_time&limit=100&access_token=${activeToken}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Failed to fetch leads");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data || []).map((lead: any) => parseMetaLead(lead));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseMetaLead(data: any): ParsedLeadData {
  // Parse the field_data
  let name = null;
  let email = null;
  let phone = null;

  if (data.field_data && Array.isArray(data.field_data)) {
    for (const field of data.field_data) {
      const fieldName = field.name.toLowerCase();
      const value = field.values[0] || null;

      if (['full_name', 'name', 'first_name', 'last_name', "what's your name?"].includes(fieldName)) {
        if (!name) name = value; // keep the first matched name
      } else if (['email', 'e-mail'].includes(fieldName)) {
        email = value;
      } else if (['phone_number', 'phone', 'contact'].includes(fieldName)) {
        phone = value;
      }
    }
  }

  return {
    name,
    email,
    phone,
    adName: data.ad_name || null,
    adId: data.ad_id || null,
    formId: data.form_id || null,
    leadgenId: data.id // Add leadgenId if it exists in data
  };
}
