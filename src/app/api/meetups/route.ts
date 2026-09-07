import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Meetup from '@/lib/models/Meetup';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await connectToDatabase();
  const status = new URL(req.url).searchParams.get('status');
  const query = status ? { status } : { status: { $in: ['published', 'registration-closed'] } };
  return NextResponse.json({ meetups: await Meetup.find(query).sort({ date: 1, startTime: 1 }) });
}

export async function POST(req: Request) {
  try { await connectToDatabase(); const body = await req.json();
    if (!body.title || !body.shortDescription || !body.description || !body.speakerName || !body.date || !body.startTime || !body.endTime || !body.format || !body.capacity) return NextResponse.json({ error: 'Complete the required meetup details.' }, { status: 400 });
    if (body.endTime <= body.startTime) return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    return NextResponse.json({ success: true, meetup: await Meetup.create({ ...body, status: body.status || 'draft' }) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try { await connectToDatabase(); const { id, ...updates } = await req.json(); const meetup = await Meetup.findByIdAndUpdate(id, { $set: updates }, { new: true }); return meetup ? NextResponse.json({ success: true, meetup }) : NextResponse.json({ error: 'Meetup not found.' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}

export async function DELETE(req: Request) { await connectToDatabase(); const id = new URL(req.url).searchParams.get('id'); if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 }); await Meetup.findByIdAndDelete(id); return NextResponse.json({ success: true }); }

export async function PUT(req: Request) {
  try { await connectToDatabase(); const { meetupId, studentEmail, answers } = await req.json(); const meetup = await Meetup.findById(meetupId); const student = await User.findOne({ email: studentEmail?.trim().toLowerCase() });
    if (!meetup || !student) return NextResponse.json({ error: 'Meetup or student not found.' }, { status: 404 });
    if (meetup.status !== 'published') return NextResponse.json({ error: 'Registration is closed.' }, { status: 400 });
    if (meetup.registrationDeadline && new Date(meetup.registrationDeadline) < new Date()) return NextResponse.json({ error: 'The registration deadline has passed.' }, { status: 400 });
    if (meetup.registrations.some(r => r.studentId.toString() === student._id.toString())) return NextResponse.json({ error: "You're already registered for this event." }, { status: 409 });
    if (meetup.registrations.length >= meetup.capacity) return NextResponse.json({ error: 'Registration Full.' }, { status: 409 });
    meetup.registrations.push({ studentId: student._id, studentName: student.fullName || student.name, studentEmail: student.email, answers, registeredAt: new Date(), attendance: 'registered' }); await meetup.save();
    await Notification.create({ userId: student._id, title: `You're registered: ${meetup.title}`, message: `${meetup.date} · ${meetup.startTime} (${meetup.timezone})`, type: 'meetup', link: '/dashboard/meetup' });
    return NextResponse.json({ success: true, meetup });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}
