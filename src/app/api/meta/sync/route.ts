import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPages, getForms, getFormLeads } from '@/lib/meta';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const pageId = searchParams.get('pageId');

  try {
    if (type === 'pages') {
      const pages = await getPages();
      return NextResponse.json(pages);
    }

    if (type === 'forms' && pageId) {
      const forms = await getForms(pageId);
      return NextResponse.json(forms);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Meta API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { formId, pageId, pageName, formName } = await request.json();

    if (!formId || !pageId) {
      return NextResponse.json({ error: 'formId and pageId are required' }, { status: 400 });
    }

    const leads = await getFormLeads(formId, pageId);
    let savedCount = 0;
    
    for (const leadData of leads) {
      // Ensure we have a valid ID
      const leadgenId = leadData.leadgenId;
      if (!leadgenId) continue;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.lead as any).upsert({
          where: { leadgenId },
          update: {
            pageName: pageName || null,
            formName: formName || null
          },
          create: {
            leadgenId,
            name: leadData.name || null,
            email: leadData.email || null,
            phone: leadData.phone || null,
            adName: leadData.adName || null,
            adId: leadData.adId || null,
            formId: leadData.formId || null,
            formName: formName || null,
            pageId: pageId || null,
            pageName: pageName || null,
            status: 'new'
          }
        });
        savedCount++;
      } catch {
        console.error(`Error saving lead ${leadgenId}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: leads.length,
      saved: savedCount,
      message: `Successfully synced ${savedCount} leads.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
