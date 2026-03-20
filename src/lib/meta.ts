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

export async function fetchLeadData(leadgenId: string): Promise<ParsedLeadData | null> {
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
      console.error(`Meta Graph API error for lead ${leadgenId}:`, errorText);
      return null;
    }

    const data = (await res.json()) as MetaLeadData;
    
    // Parse the field_data
    let name = null;
    let email = null;
    let phone = null;

    if (data.field_data && Array.isArray(data.field_data)) {
      for (const field of data.field_data) {
        const fieldName = field.name.toLowerCase();
        const value = field.values[0] || null;

        if (['full_name', 'name', 'first_name', 'last_name'].includes(fieldName)) {
          if (!name) name = value; // keep the first matched name
        } else if (['email'].includes(fieldName)) {
          email = value;
        } else if (['phone_number', 'phone'].includes(fieldName)) {
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
  } catch (error) {
    console.error(`Exception fetching lead ${leadgenId}:`, error);
    return null;
  }
}
