import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/lib/models/Link';
import User from '@/lib/models/User';
import NotificationEngine from '@/lib/services/notificationService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { action, userEmail, userId } = body; // action: 'accept' | 'decline' | 'cancel'

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const link = await Link.findById(id);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Resolve current responding user
    let currentUserId = userId;
    if (!currentUserId && userEmail) {
      const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (u) currentUserId = u._id.toString();
    }

    if (action === 'accept') {
      link.status = 'accepted';
      await link.save();

      // Find recipient user details to notify requester
      const recipientUser = await User.findById(link.recipient);
      const recipientName = recipientUser?.fullName || recipientUser?.name || 'Someone';

      // Dispatch LINK_ACCEPTED notification to requester
      await NotificationEngine.dispatch({
        userId: link.requester,
        eventType: 'LINK_ACCEPTED',
        title: 'Link Request Accepted',
        message: `${recipientName} accepted your Link request. You are now connected!`,
        link: `/dashboard/profile?id=${link.recipient}`,
        type: 'link',
      });

      return NextResponse.json({
        success: true,
        message: 'Link request accepted!',
        link,
      });
    }

    if (action === 'decline') {
      link.status = 'declined';
      await link.save();

      return NextResponse.json({
        success: true,
        message: 'Link request declined.',
        link,
      });
    }

    if (action === 'cancel') {
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
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    await Link.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Connection removed.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
