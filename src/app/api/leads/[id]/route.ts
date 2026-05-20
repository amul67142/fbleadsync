import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLeadStatusEvent } from '@/lib/facebook-capi';

// UPDATE LEAD STATUS
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { status } = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    // Send to Meta Conversions API if status is qualified and lead has a Meta leadgenId
    if (status?.toLowerCase() === 'qualified') {
      if (updatedLead.leadgenId) {
        // Fire-and-forget or await in a safe try-catch so it does not block the UI
        try {
          await sendLeadStatusEvent({
            leadgenId: updatedLead.leadgenId,
            email: updatedLead.email,
            phone: updatedLead.phone,
            status: updatedLead.status,
          });
        } catch (capiError) {
          console.error('[CAPI] Failed to send conversion event to Facebook:', capiError);
        }
      } else {
        console.warn(`[CAPI] Lead ${updatedLead.id} status updated to qualified but has no leadgenId (Meta Lead ID). Event was not sent.`);
      }
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE LEAD
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
