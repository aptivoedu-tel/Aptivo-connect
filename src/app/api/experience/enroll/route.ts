import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Experience from '@/lib/models/Experience';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const student = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { experienceId, whyAttend, questionResponses = [] } = body;

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const exp = await Experience.findById(experienceId);
    if (!exp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    if (exp.status === 'Completed') return NextResponse.json({ error: 'Registration is closed for this experience.' }, { status: 400 });

    // Check capacity limit
    const confirmedCount = exp.enrolledStudents.filter((s) => s.status !== 'Completed').length;
    if (exp.capacity && confirmedCount >= exp.capacity) {
      return NextResponse.json(
        { error: `This experience has reached its maximum capacity of ${exp.capacity} students.` },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const isEnrolled = exp.enrolledStudents.some(
      (s) => s.studentId?.toString() === student._id.toString() || s.studentEmail === student.email
    );

    if (isEnrolled) {
      return NextResponse.json({ error: "You're already registered for this experience." }, { status: 409 });
    }

    exp.enrolledStudents.push({
      studentId: student._id,
      studentName: student.fullName || student.name,
      studentEmail: student.email,
      university: student.university || 'University',
      whyAttend: whyAttend || 'Interested in workplace exposure and industry interactions.',
      questionResponses: Array.isArray(questionResponses) ? questionResponses : [],
      status: 'Confirmed',
      enrolledAt: new Date(),
    });

    exp.enrolledCount = exp.enrolledStudents.length;
    await exp.save();

    student.experiencesCount = (student.experiencesCount || 0) + 1;
    await student.save();

    await Notification.create({
      userId: student._id,
      title: `You're registered: ${exp.title}`,
      message: `${exp.date} · ${exp.time}. Your Experience registration is confirmed.`,
      type: 'experience',
      link: '/dashboard/experience',
    });

    return NextResponse.json({ success: true, experience: exp });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
