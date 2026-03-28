import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array of lead IDs is required' }, { status: 400 });
    }

    const result = await prisma.lead.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully deleted ${result.count} leads.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bulk delete failed' },
      { status: 500 }
    );
  }
}
