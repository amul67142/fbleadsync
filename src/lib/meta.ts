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
}

export async function fetchLeadData(leadgenId: string, formId?: string): Promise<ParsedLeadData | null> {
  try {
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      throw new Error("META_PAGE_ACCESS_TOKEN is not defined in env variables.");
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${leadgenId}?fields=field_data,ad_name,ad_id,form_id,created_time&access_token=${accessToken}`
    );

    if (!res.ok) {
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
            return parseMetaLead(foundLead);
          }
        }
      }
      return null;
    }

    const data = (await res.json()) as MetaLeadData;
    return parseMetaLead(data);
  } catch (error) {
    console.error(`Exception fetching lead ${leadgenId}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMetaLead(data: any): ParsedLeadData {
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
  };
}
