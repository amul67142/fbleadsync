/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { leads } = await request.json();

    if (!Array.isArray(leads)) {
      return NextResponse.json({ error: 'Invalid leads data' }, { status: 400 });
    }

    let savedCount = 0;
    
    // Using a simple loop for safety. 
    // For very large imports, we could use createMany, but upsert is safer to avoid duplicates.
    for (const item of leads) {
      const lead = item as any;
      if (!lead.leadgenId) continue;

      // @ts-expect-error - Bypassing stale prisma client types
      await prisma.lead.upsert({
        where: { leadgenId: lead.leadgenId },
        update: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          pageName: lead.pageName,
          formName: lead.formName || 'Manual Import',
          adName: lead.adName || 'CSV Upload',
        },
        create: {
          leadgenId: lead.leadgenId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          pageName: lead.pageName,
          formName: lead.formName || 'Manual Import',
          adName: lead.adName || 'CSV Upload',
          status: 'new',
        },
      });
      savedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${savedCount} leads.`,
      saved: savedCount 
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 });
  }
}
