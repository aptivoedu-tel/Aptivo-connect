import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/lib/models/Link';
import User from '@/lib/models/User';
import NotificationEngine from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const USER_POPULATE_FIELDS = '_id fullName name email role accountType status avatarUrl profilePhoto university campus degree fieldOfStudy field jobTitle organization bio skills';

export async function GET(req: Request) {
  try {
    const currentUser = await requireUser(); await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId'); // to check link status with specific user
    const status = searchParams.get('status'); // 'accepted' | 'pending' | 'all'

    // If searching status between two users
    if (targetUserId) {
      const currentUserId = currentUser._id.toString();

      const existingLink = await Link.findOne({
        $or: [
          { requester: currentUserId, recipient: targetUserId },
          { requester: targetUserId, recipient: currentUserId },
        ],
      });

      if (!existingLink) {
        return NextResponse.json({ connectionState: 'none', link: null });
      }

      let state = 'none';
      if (existingLink.status === 'accepted') {
        state = 'accepted';
      } else if (existingLink.status === 'pending') {
        state = existingLink.requester.toString() === currentUserId.toString()
          ? 'pending_outgoing'
          : 'pending_incoming';
      } else {
        state = existingLink.status;
      }

      return NextResponse.json({
        connectionState: state,
        link: existingLink,
      });
    }

    // Resolve target user
    const uid = currentUser._id.toString();

    const query: Record<string, unknown> = {
      $or: [{ requester: uid }, { recipient: uid }],
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const links = await Link.find(query)
      .populate('requester', USER_POPULATE_FIELDS)
      .populate('recipient', USER_POPULATE_FIELDS)
      .sort({ updatedAt: -1 });

    // Separate into accepted, incoming pending, outgoing pending
    const accepted: unknown[] = [];
    const pendingIncoming: unknown[] = [];
    const pendingOutgoing: unknown[] = [];

    links.forEach((l) => {
      const isRequester = (l.requester as { _id?: mongoose.Types.ObjectId })?._id?.toString() === uid?.toString();
      if (l.status === 'accepted') {
        accepted.push(l);
      } else if (l.status === 'pending') {
        if (isRequester) {
          pendingOutgoing.push(l);
        } else {
          pendingIncoming.push(l);
        }
      }
    });

    return NextResponse.json({
      links,
      accepted,
      pendingIncoming,
      pendingOutgoing,
      pendingIncomingCount: pendingIncoming.length,
      totalConnected: accepted.length,
    });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const requesterUser = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { recipientId, note } = body;
    const reqId = requesterUser._id.toString();

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (reqId.toString() === recipientId.toString()) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }
    if (recipientUser.privacy?.allowConnectionRequests === false) return NextResponse.json({ error: 'This member is not accepting connection requests.' }, { status: 403 });

    // Check existing relationship
    let existingLink = await Link.findOne({
      $or: [
        { requester: reqId, recipient: recipientId },
        { requester: recipientId, recipient: reqId },
      ],
    });

    if (existingLink) {
      if (existingLink.status === 'accepted') {
        return NextResponse.json({ error: 'You are already linked with this user' }, { status: 400 });
      }

      if (existingLink.status === 'pending') {
        if (existingLink.requester.toString() === reqId.toString()) {
          return NextResponse.json({ error: 'Link request already pending' }, { status: 400 });
        } else {
          // The other user already requested -> auto accept!
          existingLink.status = 'accepted';
          await existingLink.save();

          await NotificationEngine.dispatch({
            userId: existingLink.requester,
            eventType: 'LINK_ACCEPTED',
            title: 'Link Request Accepted',
            message: `${requesterUser.fullName || requesterUser.name} accepted your Link request. You are now connected!`,
            link: `/profile/${reqId}`,
            type: 'link',
          });

          return NextResponse.json({
            success: true,
            message: 'Mutually linked successfully!',
            link: existingLink,
          });
        }
      }

      // If declined or canceled, reactivate as pending request from current user
      existingLink.requester = new mongoose.Types.ObjectId(reqId);
      existingLink.recipient = new mongoose.Types.ObjectId(recipientId);
      existingLink.status = 'pending';
      existingLink.note = note || '';
      await existingLink.save();
    } else {
      existingLink = await Link.create({
        requester: reqId,
        recipient: recipientId,
        status: 'pending',
        note: note || '',
      });
    }

    // Dispatch notification to recipient
    await NotificationEngine.dispatch({
      userId: recipientId,
      eventType: 'LINK_REQUEST',
      title: 'New Link Request',
      message: `${requesterUser.fullName || requesterUser.name} sent you a Link request.${note ? ` Note: "${note}"` : ''}`,
      link: `/profile/${reqId}`,
      type: 'link',
    });

    try {
      const { publishUserEvent } = await import('@/lib/realtime');
      await publishUserEvent(recipientId, 'connection.request.created', {
        link: existingLink.toObject(),
        requester: {
          _id: requesterUser._id,
          fullName: requesterUser.fullName || requesterUser.name,
          avatarUrl: requesterUser.profilePhoto || requesterUser.avatarUrl,
          university: requesterUser.university || requesterUser.organization,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Link request sent successfully!',
      link: existingLink,
    }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
