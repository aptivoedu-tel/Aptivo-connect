import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ notifications: [] });
    }
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ notifications: [] });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { notificationId, markAllRead, email } = body;

    if (markAllRead) {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (user) {
        await Notification.updateMany({ userId: user._id }, { $set: { isRead: true } });
      }
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { $set: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
