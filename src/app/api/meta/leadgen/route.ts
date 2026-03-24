import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchLeadData } from '@/lib/meta';

// Next.js App Router Webhook Verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN?.trim();

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully.');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// Next.js App Router Webhook Receival (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST Received body:', JSON.stringify(body));

    // Verify it's a leadgen event based on typical Meta payload shape
    if (body.object === 'page' && body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen') {
              const leadgenId = change.value.leadgen_id;
              const pageId = change.value.page_id;
              console.log(`Processing leadgen_id: ${leadgenId} for page: ${pageId}`);

              if (!leadgenId) {
                console.log('No leadgenId found, skipping.');
                continue;
              }

              // Extract actual lead info from Graph API
              console.log('Fetching lead data from Meta...');
              const leadData = await fetchLeadData(leadgenId, change.value.form_id);
              
              if (leadData) {
                console.log('Lead data ready for upsert:', JSON.stringify(leadData));
                // Upsert to bypass duplicate events securely
                const result = await prisma.lead.upsert({
                  where: { leadgenId },
                  update: {
                    pageName: leadData.pageName,
                    formName: leadData.formName,
                  }, // update names even if it exists
                  create: {
                    leadgenId,
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    adName: leadData.adName,
                    adId: leadData.adId,
                    formId: leadData.formId || change.value.form_id,
                    formName: leadData.formName,
                    pageId: pageId,
                    pageName: leadData.pageName,
                  },
                });
                console.log('Lead saved/upserted successfully. ID:', result.id);
              } else {
                console.log('Lead data fetch failed (returned null).');
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook POST Error:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
