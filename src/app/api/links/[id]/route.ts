import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/lib/models/Link';
import NotificationEngine from '@/lib/services/notificationService';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const link = await Link.findById(id);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (action === 'accept') {
      if (link.recipient.toString() !== actor._id.toString() || link.status !== 'pending') return NextResponse.json({ error: 'Only the recipient can accept this request.' }, { status: 403 });
      link.status = 'accepted';
      await link.save();

      // Find recipient user details to notify requester
      const recipientName = actor.fullName || actor.name || 'Someone';

      // Dispatch LINK_ACCEPTED notification to requester
      await NotificationEngine.dispatch({
        userId: link.requester,
        eventType: 'LINK_ACCEPTED',
        title: 'Link Request Accepted',
        message: `${recipientName} accepted your Link request. You are now connected!`,
        link: `/profile/${link.recipient}`,
        type: 'link',
      });

      return NextResponse.json({
        success: true,
        message: 'Link request accepted!',
        link,
      });
    }

    if (action === 'decline') {
      if (link.recipient.toString() !== actor._id.toString() || link.status !== 'pending') return NextResponse.json({ error: 'Only the recipient can decline this request.' }, { status: 403 });
      link.status = 'declined';
      await link.save();

      return NextResponse.json({
        success: true,
        message: 'Link request declined.',
        link,
      });
    }

    if (action === 'cancel') {
      if (link.requester.toString() !== actor._id.toString() || link.status !== 'pending') return NextResponse.json({ error: 'Only the requester can cancel this request.' }, { status: 403 });
      link.status = 'canceled';
      await link.save();

      return NextResponse.json({
        success: true,
        message: 'Link request canceled.',
        link,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const link = await Link.findOne({ _id: id, status: 'accepted', $or: [{ requester: actor._id }, { recipient: actor._id }] });
    if (!link) return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    await link.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Connection removed.',
    });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
