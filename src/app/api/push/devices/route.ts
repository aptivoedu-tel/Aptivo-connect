import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PushDevice from '@/lib/models/PushDevice';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const isExpoToken = (value: unknown) => typeof value === 'string' && /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(value);
const isInstallationId = (value: unknown) => typeof value === 'string' && value.length >= 16 && value.length <= 128;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { token, platform, installationId } = await request.json();
    if (!isExpoToken(token) || !isInstallationId(installationId) || !['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid push-device registration.' }, { status: 400 });
    }
    await connectToDatabase();
    // A physical installation belongs to one active account only. This safely
    // disassociates a previous account on the same phone without touching it elsewhere.
    await PushDevice.updateMany({ installationId, userId: { $ne: user._id } }, { $set: { enabled: false } });
    await PushDevice.findOneAndUpdate(
      { $or: [{ token }, { userId: user._id, installationId }] },
      { $set: { userId: user._id, token, platform, installationId, enabled: true, lastSeenAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: 'Unable to register device.' }, { status: auth?.status || 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { installationId } = await request.json();
    if (!isInstallationId(installationId)) return NextResponse.json({ error: 'Invalid installation.' }, { status: 400 });
    await connectToDatabase();
    await PushDevice.updateMany({ userId: user._id, installationId }, { $set: { enabled: false, lastSeenAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: 'Unable to disable device.' }, { status: auth?.status || 500 });
  }
}
