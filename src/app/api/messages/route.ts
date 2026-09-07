import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import NotificationEngine from '@/lib/services/notificationService';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userEmail = searchParams.get('email');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const convObjId = new mongoose.Types.ObjectId(conversationId);

    // Fetch messages
    const messages = await Message.find({ conversationId: convObjId })
      .sort({ createdAt: 1 })
      .limit(limit);

    // Resolve viewer ID to mark incoming messages as read
    let currentUid = userId;
    if (!currentUid && userEmail) {
      const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (u) currentUid = u._id.toString();
    }

    if (currentUid) {
      // Mark messages where viewer is recipient as read
      await Message.updateMany(
        {
          conversationId: convObjId,
          recipientId: new mongoose.Types.ObjectId(currentUid),
          isRead: false,
        },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { conversationId, senderEmail, senderId, recipientId, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // Resolve sender
    let sId = senderId;
    let senderUser = null;
    if (!sId && senderEmail) {
      senderUser = await User.findOne({ email: senderEmail.toLowerCase().trim() });
      if (senderUser) sId = senderUser._id.toString();
    } else if (sId) {
      senderUser = await User.findById(sId);
    }

    if (!sId || !senderUser) {
      return NextResponse.json({ error: 'Sender not authenticated' }, { status: 401 });
    }

    let convId = conversationId;
    let rId = recipientId;

    // If conversationId is given, resolve recipient from conversation participants
    if (convId) {
      const conv = await Conversation.findById(convId);
      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      if (!rId) {
        const otherParticipant = conv.participants.find(
          (p: mongoose.Types.ObjectId) => p.toString() !== sId.toString()
        );
        if (otherParticipant) rId = otherParticipant.toString();
      }
    } else if (rId) {
      // Find or create conversation
      const sObjId = new mongoose.Types.ObjectId(sId);
      const rObjId = new mongoose.Types.ObjectId(rId);

      let conv = await Conversation.findOne({
        participants: { $all: [sObjId, rObjId], $size: 2 },
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [sObjId, rObjId],
          lastMessage: content.trim(),
          lastMessageAt: new Date(),
          lastSenderId: sObjId,
        });
      }
      convId = conv._id.toString();
    }

    if (!convId || !rId) {
      return NextResponse.json({ error: 'Recipient and conversation could not be resolved' }, { status: 400 });
    }

    const sObjId = new mongoose.Types.ObjectId(sId);
    const rObjId = new mongoose.Types.ObjectId(rId);
    const convObjId = new mongoose.Types.ObjectId(convId);

    // 1. Create message
    const message = await Message.create({
      conversationId: convObjId,
      senderId: sObjId,
      recipientId: rObjId,
      content: content.trim(),
      isRead: false,
    });

    // 2. Update conversation last message
    await Conversation.findByIdAndUpdate(convObjId, {
      $set: {
        lastMessage: content.trim().substring(0, 100),
        lastMessageAt: new Date(),
        lastSenderId: sObjId,
      },
    });

    // 3. Dispatch Notification
    const senderName = senderUser.fullName || senderUser.name || 'Builder';
    await NotificationEngine.dispatch({
      userId: rObjId,
      eventType: 'EVENT_REMINDER', // Used for notification badge
      title: `Message from ${senderName}`,
      message: content.trim().length > 60 ? `${content.trim().substring(0, 60)}...` : content.trim(),
      link: `/dashboard/messages?conv=${convId}`,
      type: 'system',
    });

    return NextResponse.json({
      success: true,
      message,
      conversationId: convId,
    }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
