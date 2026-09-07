import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/lib/models/Link';
import User from '@/lib/models/User';
import NotificationEngine from '@/lib/services/notificationService';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const USER_POPULATE_FIELDS = '_id fullName name email role accountType status avatarUrl profilePhoto university campus degree fieldOfStudy field jobTitle organization bio skills';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('email');
    const targetUserId = searchParams.get('targetUserId'); // to check link status with specific user
    const status = searchParams.get('status'); // 'accepted' | 'pending' | 'all'

    // If searching status between two users
    if ((userId || userEmail) && targetUserId) {
      let currentUserId = userId;
      if (!currentUserId && userEmail) {
        const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
        if (u) currentUserId = u._id.toString();
      }

      if (!currentUserId) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

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
    let uid = userId;
    if (!uid && userEmail) {
      const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (u) uid = u._id.toString();
    }

    if (!uid) {
      return NextResponse.json({ error: 'userId or email parameter required' }, { status: 400 });
    }

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
      totalConnected: accepted.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { requesterId, requesterEmail, recipientId, note } = body;

    // Resolve requester
    let reqId = requesterId;
    let requesterUser = null;
    if (!reqId && requesterEmail) {
      requesterUser = await User.findOne({ email: requesterEmail.toLowerCase().trim() });
      if (requesterUser) reqId = requesterUser._id.toString();
    } else if (reqId) {
      requesterUser = await User.findById(reqId);
    }

    if (!reqId || !requesterUser) {
      return NextResponse.json({ error: 'Requester user not found' }, { status: 401 });
    }

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
            link: `/dashboard/profile?id=${reqId}`,
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
      link: `/dashboard/profile?id=${reqId}`,
      type: 'link',
    });

    return NextResponse.json({
      success: true,
      message: 'Link request sent successfully!',
      link: existingLink,
    }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
