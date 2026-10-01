import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Meetup from '@/lib/models/Meetup';
import Notification from '@/lib/models/Notification';
import { authError, requireAdmin, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const status = new URL(req.url).searchParams.get('status');
    if (status?.toLowerCase() === 'all') await requireAdmin();
    const query = status?.toLowerCase() === 'all' ? {} : status ? { status } : { status: { $in: ['published', 'registration-closed'] } };
    return NextResponse.json({ meetups: await Meetup.find(query).sort({ date: 1, startTime: 1 }) });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function POST(req: Request) {
  try { await requireAdmin(); await connectToDatabase(); const body = await req.json();
    if (!body.title || !body.shortDescription || !body.description || !body.speakerName || !body.date || !body.startTime || !body.endTime || !body.format || !body.capacity) return NextResponse.json({ error: 'Complete the required meetup details.' }, { status: 400 });
    if (body.endTime <= body.startTime) return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    return NextResponse.json({ success: true, meetup: await Meetup.create({ ...body, status: body.status || 'draft' }) }, { status: 201 });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function PATCH(req: Request) {
  try { await requireAdmin(); await connectToDatabase(); const { id, ...updates } = await req.json(); const meetup = await Meetup.findByIdAndUpdate(id, { $set: updates }, { new: true }); return meetup ? NextResponse.json({ success: true, meetup }) : NextResponse.json({ error: 'Meetup not found.' }, { status: 404 }); }
  catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function DELETE(req: Request) { try { await requireAdmin(); await connectToDatabase(); const id = new URL(req.url).searchParams.get('id'); if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 }); await Meetup.findByIdAndDelete(id); return NextResponse.json({ success: true }); } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); } }

export async function PUT(req: Request) {
  try { const student = await requireUser(); await connectToDatabase(); const { meetupId, answers } = await req.json(); const meetup = await Meetup.findById(meetupId);
    if (!meetup) return NextResponse.json({ error: 'Meetup not found.' }, { status: 404 });
    if (meetup.status !== 'published') return NextResponse.json({ error: 'Registration is closed.' }, { status: 400 });
    if (meetup.registrationDeadline && new Date(meetup.registrationDeadline) < new Date()) return NextResponse.json({ error: 'The registration deadline has passed.' }, { status: 400 });
    const registration = { studentId: student._id, studentName: student.fullName || student.name, studentEmail: student.email, answers, registeredAt: new Date(), attendance: 'registered' as const };
    const updated = await Meetup.findOneAndUpdate({ _id: meetupId, status: 'published', $expr: { $lt: [{ $size: '$registrations' }, '$capacity'] }, 'registrations.studentId': { $ne: student._id } }, { $push: { registrations: registration } }, { new: true });
    if (!updated) return NextResponse.json({ error: meetup.registrations.some(r => r.studentId.toString() === student._id.toString()) ? "You're already registered for this event." : 'Registration Full or closed.' }, { status: 409 });
    await Notification.create({ userId: student._id, title: `You're registered: ${meetup.title}`, message: `${meetup.date} · ${meetup.startTime} (${meetup.timezone})`, type: 'meetup', link: '/dashboard/meetup' });
    return NextResponse.json({ success: true, meetup: updated });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
