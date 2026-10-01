import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const admin = await User.findOne({ email: 'admin@connect.aptivo' });
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    const stored = admin.passwordHash || admin.password;
    const isValid = stored?.startsWith('$2') ? await bcrypt.compare(currentPassword, stored) : false;
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    // Use updateOne to bypass Mongoose enum validation on `status` field
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);
    await User.updateOne(
      { email: 'admin@connect.aptivo' },
      { $set: { passwordHash: hash, password: hash } }
    );

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
