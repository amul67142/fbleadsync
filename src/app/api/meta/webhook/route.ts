import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchLeadData } from '@/lib/meta';

// Next.js App Router Webhook Verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully.');
    // Must return challenge exactly as provided, plain text
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// Next.js App Router Webhook Receival (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify it's a leadgen event based on typical Meta payload shape
    if (body.object === 'page' && body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen') {
              const leadgenId = change.value.leadgen_id;
              const pageId = change.value.page_id;

              if (!leadgenId) continue;

              // Extract actual lead info from Graph API
              const leadData = await fetchLeadData(leadgenId);
              
              if (leadData) {
                // Upsert to bypass duplicate events securely
                await prisma.lead.upsert({
                  where: { leadgenId },
                  update: {}, // do nothing if it already exists
                  create: {
                    leadgenId,
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    adName: leadData.adName,
                    adId: leadData.adId,
                    formId: leadData.formId,
                    pageId: pageId,
                  },
                });
              }
            }
          }
        }
      }
    }

    // Always yield 200 OK so Meta stops retrying
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook POST Error:', error);
    // Important: Still return 200 to Meta, or they will disable the webhook after enough failures
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
