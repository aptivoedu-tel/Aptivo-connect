import { NextResponse } from 'next/server';
import { NotificationEngine, NotificationPayload } from '@/lib/services/notificationService';
import User from '@/lib/models/User';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = NotificationEngine.getRecentDispatches();
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userEmail, eventType, title, message, details, link, type } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payload: NotificationPayload = {
      userId: user._id,
      eventType: eventType || 'MEETING_SCHEDULED',
      title: title || 'Aptivo Connect Notification',
      message: message || 'Your meeting has been scheduled.',
      details,
      link,
      type: type || 'meet',
    };

    const log = await NotificationEngine.dispatch(payload);
    return NextResponse.json({ success: true, log });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
