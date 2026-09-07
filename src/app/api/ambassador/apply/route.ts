import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

// Submit a new ambassador application
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userEmail, ...rest } = body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Check a specific user's application status
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ application: null });
    }

    const application = await AmbassadorApplication.findOne({ userId: user._id });
    return NextResponse.json({ application });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
