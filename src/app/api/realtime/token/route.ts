import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import { authError, requireUser } from '@/lib/auth';
import { conversationChannel, createRealtimeToken } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();
    const conversations = await Conversation.find({ participants: user._id }).select('_id');
    const conversationChannels = conversations.map((c) => conversationChannel(String(c._id)));
    const tokenRequest = await createRealtimeToken(String(user._id), conversationChannels);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    const auth = authError(error);
    const message = error instanceof Error && error.message.includes('ABLY_API_KEY')
      ? 'Realtime is not configured yet.'
      : 'Unable to authorize realtime connection.';
    return NextResponse.json(auth || { error: message }, { status: auth?.status || 503 });
  }
}
