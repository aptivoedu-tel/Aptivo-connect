import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import Notification from '@/lib/models/Notification';
import NotificationEngine from '@/lib/services/notificationService';
import { authError, requireUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { publishConversationMessage, publishUserEvent } from '@/lib/realtime';

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
    await Conversation.updateOne({ _id: conversation._id }, { $set: { [`unreadCount.${String(actor._id)}`]: 0 } });
    await Notification.updateMany({ userId: actor._id, isRead: false, $or: [{ conversationId: conversation._id }, { link: `/dashboard/messages?conv=${conversation._id}` }] }, { $set: { isRead: true } });
    const totalUnread = await Conversation.aggregate([{ $match: { participants: actor._id } }, { $project: { count: { $ifNull: [`$unreadCount.${String(actor._id)}`, 0] } } }, { $group: { _id: null, total: { $sum: '$count' } } }]);
    void publishUserEvent(actor._id, 'conversation.read', { conversationId: String(conversation._id), totalUnreadMessages: totalUnread[0]?.total || 0 });
    return NextResponse.json({ messages, unreadMessages: 0, totalUnreadMessages: totalUnread[0]?.total || 0 });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { conversationId, recipientId, content, clientTempId } = await req.json();
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
    const updatedConversation = await Conversation.findByIdAndUpdate(conversation._id, { $set: { lastMessage: content.trim().slice(0, 100), lastMessageAt: new Date(), lastSenderId: actor._id }, $inc: { [`unreadCount.${String(recipient)}`]: 1 } }, { new: true });
    const unreadMap: any = updatedConversation?.unreadCount;
    const recipientUnread = Number(unreadMap?.get ? unreadMap.get(String(recipient)) : unreadMap?.[String(recipient)] || 0);
    const recipientTotals = await Conversation.aggregate([{ $match: { participants: recipient } }, { $project: { count: { $ifNull: [`$unreadCount.${String(recipient)}`, 0] } } }, { $group: { _id: null, total: { $sum: '$count' } } }]);
    const recipientTotalUnread = recipientTotals[0]?.total || 0;
    const plainMessage = { ...JSON.parse(JSON.stringify(message.toObject())), clientTempId: typeof clientTempId === 'string' ? clientTempId : undefined };
    await publishConversationMessage(String(conversation._id), plainMessage);
    // Conversation delivery is awaited above. User-list and notification fan-out must not delay
    // the sender response after the authoritative write has succeeded.
    void (async () => {
      try {
        const { publishUserEvent } = await import('@/lib/realtime');
        await publishUserEvent(recipient, 'message.created', { ...plainMessage, unreadMessages: recipientUnread, totalUnreadMessages: recipientTotalUnread });
        const stillUnread = await Conversation.findById(conversation._id).select(`unreadCount.${String(recipient)}`).lean();
        const notificationRead = Number((stillUnread as any)?.unreadCount?.[String(recipient)] || 0) === 0;
        await NotificationEngine.dispatch({ userId: recipient, eventType: 'EVENT_REMINDER', title: `Message from ${actor.fullName || actor.name || 'Aptivo member'}`, message: content.trim().slice(0, 60), link: `/dashboard/messages?conv=${conversation._id}`, conversationId: conversation._id, isRead: notificationRead, type: 'system' });
      } catch (secondaryError) {
        console.error('Message secondary delivery failed:', secondaryError);
      }
    })();
    return NextResponse.json({ success: true, message: plainMessage, conversationId: conversation._id }, { status: 201 });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { conversationId } = await req.json();
    const conversation = conversationId ? await findParticipantConversation(conversationId, actor._id) : null;
    if (!conversation) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    await Message.updateMany({ conversationId: conversation._id, recipientId: actor._id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    await Conversation.updateOne({ _id: conversation._id }, { $set: { [`unreadCount.${String(actor._id)}`]: 0 } });
    await Notification.updateMany({ userId: actor._id, isRead: false, $or: [{ conversationId: conversation._id }, { link: `/dashboard/messages?conv=${conversation._id}` }] }, { $set: { isRead: true } });
    const totals = await Conversation.aggregate([{ $match: { participants: actor._id } }, { $project: { count: { $ifNull: [`$unreadCount.${String(actor._id)}`, 0] } } }, { $group: { _id: null, total: { $sum: '$count' } } }]);
    const totalUnreadMessages = totals[0]?.total || 0;
    await publishUserEvent(actor._id, 'conversation.read', { conversationId: String(conversation._id), totalUnreadMessages });
    return NextResponse.json({ success: true, unreadMessages: 0, totalUnreadMessages });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
