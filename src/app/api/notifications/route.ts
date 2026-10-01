import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany({ userId: user._id }, { $set: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await Notification.findOneAndUpdate({ _id: notificationId, userId: user._id }, { $set: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
