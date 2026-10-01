import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Submit a new ambassador application
export async function POST(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { userEmail: _ignoredUserEmail, ...rest } = body;

    // One application per user
    const existing = await AmbassadorApplication.findOne({ userId: user._id });
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an application on file.', application: existing },
        { status: 409 }
      );
    }

    const application = await AmbassadorApplication.create({
      userId: user._id,
      fullName: user.name,
      email: user.email,
      university: user.university || rest.university,
      degree: user.degree || rest.degree,
      field: user.field || rest.field,
      city: user.city || rest.city,
      ...rest,
      status: 'Submitted',
    });

    // Notify admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        title: `New Ambassador Application: ${user.name}`,
        message: `${user.name} (${user.university}) applied for the Ambassador Program. Review in Admin → Ambassador Applications.`,
        type: 'system',
        link: '/admin',
      });
    }

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

// Check a specific user's application status
export async function GET(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase();

    const application = await AmbassadorApplication.findOne({ userId: user._id });
    return NextResponse.json({ application });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
