import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import { authError, requireUser } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
const USER_FIELDS = '_id fullName name email role avatarUrl profilePhoto university jobTitle organization';

export async function GET() {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const conversations = await Conversation.find({ participants: actor._id }).populate('participants', USER_FIELDS).populate('lastSenderId', USER_FIELDS).sort({ lastMessageAt: -1 }).lean();
    const actorId = String(actor._id);
    const mapped = conversations.map((conversation: any) => ({ ...conversation, unreadMessages: Number(conversation.unreadCount?.[actorId] || 0) }));
    return NextResponse.json({ conversations: mapped, totalUnreadMessages: mapped.reduce((sum: number, conversation: any) => sum + conversation.unreadMessages, 0) });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { recipientId } = await req.json();
    if (!recipientId || !mongoose.isValidObjectId(recipientId)) return NextResponse.json({ error: 'A valid recipient is required.' }, { status: 400 });
    if (String(actor._id) === String(recipientId)) return NextResponse.json({ error: 'Cannot start a conversation with yourself.' }, { status: 400 });
    if (!await User.findById(recipientId).select('_id')) return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
    const ids = [new mongoose.Types.ObjectId(String(actor._id)), new mongoose.Types.ObjectId(recipientId)];
    let conversation = await Conversation.findOne({ participants: { $all: ids, $size: 2 } });
    if (!conversation) conversation = await Conversation.create({ participants: ids, lastMessage: '', lastMessageAt: new Date(), lastSenderId: actor._id, unreadCount: {} });
    conversation = await Conversation.findById(conversation._id).populate('participants', USER_FIELDS).populate('lastSenderId', USER_FIELDS);
    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
