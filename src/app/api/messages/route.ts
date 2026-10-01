import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import NotificationEngine from '@/lib/services/notificationService';
import { authError, requireUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { publishConversationMessage } from '@/lib/realtime';

export const dynamic = 'force-dynamic';
const findParticipantConversation = (id: string, userId: unknown) => mongoose.isValidObjectId(id) ? Conversation.findOne({ _id: id, participants: userId }) : null;

export async function GET(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const conversationId = new URL(req.url).searchParams.get('conversationId');
    if (!conversationId) return NextResponse.json({ error: 'Conversation ID required.' }, { status: 400 });
    const conversation = await findParticipantConversation(conversationId, actor._id);
    if (!conversation) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(100);
    await Message.updateMany({ conversationId: conversation._id, recipientId: actor._id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    return NextResponse.json({ messages });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { conversationId, recipientId, content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    let conversation = conversationId ? await findParticipantConversation(conversationId, actor._id) : null;
    if (conversationId && !conversation) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    if (!conversation) {
      if (!recipientId || !mongoose.isValidObjectId(recipientId) || String(recipientId) === String(actor._id)) return NextResponse.json({ error: 'A valid recipient is required.' }, { status: 400 });
      const ids = [new mongoose.Types.ObjectId(String(actor._id)), new mongoose.Types.ObjectId(recipientId)];
      conversation = await Conversation.findOne({ participants: { $all: ids, $size: 2 } }) || await Conversation.create({ participants: ids, lastMessage: '', lastSenderId: actor._id, unreadCount: {} });
    }
    const recipient = conversation.participants.find((id: mongoose.Types.ObjectId) => String(id) !== String(actor._id));
    if (!recipient) return NextResponse.json({ error: 'Recipient could not be resolved.' }, { status: 400 });
    const message = await Message.create({ conversationId: conversation._id, senderId: actor._id, recipientId: recipient, content: content.trim(), isRead: false });
    await Conversation.findByIdAndUpdate(conversation._id, { $set: { lastMessage: content.trim().slice(0, 100), lastMessageAt: new Date(), lastSenderId: actor._id } });
    const plainMessage = JSON.parse(JSON.stringify(message.toObject()));
    await publishConversationMessage(String(conversation._id), plainMessage);
    try {
      const { publishUserEvent } = await import('@/lib/realtime');
      await publishUserEvent(recipient, 'message.created', plainMessage);
    } catch {}
    await NotificationEngine.dispatch({ userId: recipient, eventType: 'EVENT_REMINDER', title: `Message from ${actor.fullName || actor.name || 'Aptivo member'}`, message: content.trim().slice(0, 60), link: `/dashboard/messages?conv=${conversation._id}`, type: 'system' });
    return NextResponse.json({ success: true, message: plainMessage, conversationId: conversation._id }, { status: 201 });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
