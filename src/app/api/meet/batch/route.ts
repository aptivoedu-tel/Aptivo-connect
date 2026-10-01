import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MeetRequest from '@/lib/models/MeetRequest';
import CohortSession from '@/lib/models/CohortSession';
import Notification from '@/lib/models/Notification';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const cohorts = await CohortSession.find().sort({ createdAt: -1 });
    return NextResponse.json({ cohorts });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await req.json();
    const {
      field,
      title,
      mentorName,
      mentorRole,
      mentorOrganization,
      date,
      time,
      meetingLink,
      durationMinutes,
      maxCapacity,
      notes,
    } = body;

    // Find all matching pending student requests in this field
    const pendingMeets = await MeetRequest.find({
      field: new RegExp(field, 'i'),
      status: { $in: ['Submitted', 'Finding Connection'] },
    }).limit(Number(maxCapacity) || 20);

    const students = pendingMeets.map((m) => ({
      studentId: m.studentId,
      name: m.studentName,
      email: m.studentEmail,
      university: m.studentUniversity,
      joinedAt: new Date(),
    }));

    const cohort = await CohortSession.create({
      title: title || `Aptivo Connect: ${field} Curated Cohort Session`,
      field,
      mentorName,
      mentorRole,
      mentorOrganization,
      date,
      time,
      meetingLink,
      durationMinutes: Number(durationMinutes) || 45,
      maxCapacity: Number(maxCapacity) || 20,
      students,
      notes,
      status: 'Scheduled',
    });

    // Update individual meet requests to Scheduled and notify students
    for (const m of pendingMeets) {
      m.status = 'Scheduled';
      m.scheduledDetails = {
        mentorName,
        mentorRole,
        mentorOrganization,
        date,
        time,
        meetingLink,
        durationMinutes: Number(durationMinutes) || 45,
        notes: `Group Cohort Session: ${cohort.title}`,
      };
      await m.save();

      await Notification.create({
        userId: m.studentId,
        title: `Curated Cohort Session Scheduled with ${mentorName}`,
        message: `You and ${students.length - 1} peers are confirmed for the ${field} cohort session on ${date} at ${time}.`,
        type: 'meet',
        link: '/dashboard/meet',
      });
    }

    return NextResponse.json({
      success: true,
      cohort,
      batchedStudentsCount: students.length,
    });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
