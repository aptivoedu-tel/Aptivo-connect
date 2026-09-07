import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const USER_FIELDS = '_id fullName name email role avatarUrl profilePhoto university jobTitle organization';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    let currentUid = userId;
    if (!currentUid && email) {
      const u = await User.findOne({ email: email.toLowerCase().trim() });
      if (u) currentUid = u._id.toString();
    }

    if (!currentUid) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(currentUid),
    })
      .populate('participants', USER_FIELDS)
      .populate('lastSenderId', USER_FIELDS)
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { senderEmail, senderId, recipientId } = body;

    let sId = senderId;
    if (!sId && senderEmail) {
      const u = await User.findOne({ email: senderEmail.toLowerCase().trim() });
      if (u) sId = u._id.toString();
    }

    if (!sId || !recipientId) {
      return NextResponse.json({ error: 'Sender and Recipient IDs are required' }, { status: 400 });
    }

    if (sId.toString() === recipientId.toString()) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 });
    }

    const sObjId = new mongoose.Types.ObjectId(sId);
    const rObjId = new mongoose.Types.ObjectId(recipientId);

    // Check if conversation already exists
    let conv = await Conversation.findOne({
      participants: { $all: [sObjId, rObjId], $size: 2 },
    })
      .populate('participants', USER_FIELDS)
      .populate('lastSenderId', USER_FIELDS);

    if (!conv) {
      conv = await Conversation.create({
        participants: [sObjId, rObjId],
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
        lastSenderId: sObjId,
        unreadCount: {},
      });

      conv = await Conversation.findById(conv._id)
        .populate('participants', USER_FIELDS)
        .populate('lastSenderId', USER_FIELDS);
    }

    return NextResponse.json({ success: true, conversation: conv });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
