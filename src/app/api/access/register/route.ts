import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AccessEvent from '@/lib/models/AccessEvent';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { eventId, studentEmail } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await AccessEvent.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Access opportunity not found' }, { status: 404 });
    }

    if (!studentEmail) {
      return NextResponse.json({ error: 'Authentication required. Please sign in to register.' }, { status: 401 });
    }

    const student = await User.findOne({ email: studentEmail.trim().toLowerCase() });
    if (!student) {
      return NextResponse.json({ error: 'Student account not found.' }, { status: 404 });
    }

    const isRegistered = event.registrations.some(
      (r) => r.studentId?.toString() === student._id.toString() || r.studentEmail === student.email
    );

    if (isRegistered) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
    }

    event.registrations.push({
      studentId: student._id,
      studentName: student.fullName || student.name,
      studentEmail: student.email,
      registeredAt: new Date(),
    });

    await event.save();

    student.accessCount = (student.accessCount || 0) + 1;
    await student.save();

    await Notification.create({
      userId: student._id,
      title: `Registration Confirmed: ${event.title}`,
      message: `You are confirmed for "${event.title}" on ${event.date}. Access details: ${event.linkOrVenue}`,
      type: 'access',
      link: '/dashboard/access',
    });

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
