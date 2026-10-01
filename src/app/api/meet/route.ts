import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MeetRequest from '@/lib/models/MeetRequest';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { authError, requireAdmin, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const actor = await requireUser();
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentEmail = searchParams.get('studentEmail');
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (actor.role === 'admin') {
      if (studentEmail) query.studentEmail = studentEmail.toLowerCase().trim();
    } else {
      query.studentId = actor._id;
    }
    if (status && status !== 'all' && status !== 'All') query.status = status;

    const meets = await MeetRequest.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ meets });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function POST(req: Request) {
  try {
    const student = await requireUser();
    await connectToDatabase();
    const body = await req.json();

    if (!body.field || !body.discussionTopic) {
      return NextResponse.json({ error: 'Field and Discussion Topic are required.' }, { status: 400 });
    }

    const newRequest = await MeetRequest.create({
      studentId: student._id,
      studentName: student.fullName || student.name,
      studentEmail: student.email,
      studentUniversity: student.university || 'University',
      studentAvatar: student.profilePhoto || student.avatarUrl,
      field: body.field,
      targetRole: body.targetRole || 'Professional',
      discussionTopic: body.discussionTopic,
      format: body.format || 'Online',
      preference: body.preference || 'Individual',
      status: 'Submitted',
    });

    student.meetingsCount = (student.meetingsCount || 0) + 1;
    await student.save();

    await Notification.create({
      userId: student._id,
      title: 'Meet Request Submitted',
      message: `Your request to meet a ${body.targetRole || body.field} professional is being matched by the Aptivo Ops team.`,
      type: 'meet',
      link: '/dashboard/meet',
    });

    return NextResponse.json({ success: true, meet: newRequest }, { status: 201 });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await req.json();
    const { id, status, scheduledDetails, mentorAssigned, scheduledDate, meetingLink, feedback } = body;

    const meet = await MeetRequest.findById(id);
    if (!meet) {
      return NextResponse.json({ error: 'Meet request not found' }, { status: 404 });
    }

    if (status) meet.status = status;

    if (mentorAssigned || scheduledDetails) {
      meet.scheduledDetails = {
        ...meet.scheduledDetails,
        mentorName: mentorAssigned?.name || scheduledDetails?.mentorName || 'Assigned Mentor',
        mentorRole: mentorAssigned?.role || scheduledDetails?.mentorRole || 'Industry Professional',
        mentorOrganization: mentorAssigned?.company || scheduledDetails?.mentorOrganization || 'Partner Organization',
        date: scheduledDate || scheduledDetails?.date || 'Upcoming',
        time: scheduledDetails?.time || '05:00 PM (PKT)',
        meetingLink: meetingLink || scheduledDetails?.meetingLink || 'https://meet.google.com/apt-session',
        durationMinutes: scheduledDetails?.durationMinutes || 45,
      };
      meet.status = 'Scheduled';

      // Send notification to student
      if (meet.studentId) {
        await Notification.create({
          userId: meet.studentId,
          title: `Meeting Scheduled with ${meet.scheduledDetails.mentorName}`,
          message: `Your session is set for ${meet.scheduledDetails.date} at ${meet.scheduledDetails.time}. Join link added.`,
          type: 'meet',
          link: '/dashboard/meet',
        });
      }
    }

    if (feedback) {
      meet.feedback = {
        rating: feedback.rating || 5,
        takeaway: feedback.takeaway || '',
        submittedAt: new Date(),
      };
      meet.status = 'Completed';
    }

    await meet.save();
    return NextResponse.json({ success: true, meet });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
