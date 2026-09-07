import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ProjectApplication from '@/lib/models/ProjectApplication';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { applicationId, senderEmail, message } = body;

    if (!applicationId || !message) {
      return NextResponse.json({ error: 'Application ID and message text are required.' }, { status: 400 });
    }

    const application = await ProjectApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!senderEmail) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const sender = await User.findOne({ email: senderEmail.trim().toLowerCase() });
    if (!sender) {
      return NextResponse.json({ error: 'Sender user account not found.' }, { status: 404 });
    }

    application.messages.push({
      senderId: sender._id,
      senderName: sender.fullName || sender.name,
      message,
      sentAt: new Date(),
    });

    await application.save();

    // Determine recipient (if sender is owner, recipient is applicant; if sender is applicant, recipient is owner)
    const isOwnerSender = sender._id.toString() === project.ownerId?.toString();
    const recipientId = isOwnerSender ? application.applicantId : project.ownerId;

    if (recipientId) {
      await Notification.create({
        userId: recipientId,
        title: `New message on ${application.projectTitle}`,
        message: `${sender.fullName || sender.name}: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
        type: 'build',
        link: `/dashboard/build/${params.id}`,
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
