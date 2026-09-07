import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

// Admin: get all applications with optional status filter
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'All') query.status = status;

    const applications = await AmbassadorApplication.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ applications });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Admin: update application status (Under Review → Shortlisted → Accepted / Rejected)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { applicationId, status, adminNotes, responsibilities } = body;

    const validStatuses = ['Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await AmbassadorApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.status = status;
    if (adminNotes) application.adminNotes = adminNotes;
    if (status === 'Accepted') {
      application.joinedAt = new Date();
      if (responsibilities) application.responsibilities = responsibilities;
    }
    await application.save();

    // Notify applicant
    const user = await User.findById(application.userId);
    if (user) {
      const messages: Record<string, string> = {
        'Under Review': 'Your Ambassador Program application is now under review by the Aptivo team.',
        Shortlisted: 'Congratulations — you have been shortlisted for the Aptivo Ambassador Program! We will be in touch shortly.',
        Accepted:
          'Welcome to the Aptivo Connect Ambassador Program! Your Campus Pulse portal is now active.',
        Rejected:
          'Thank you for applying to the Aptivo Ambassador Program. We appreciate your interest and encourage you to stay involved through our platform.',
      };

      await Notification.create({
        userId: user._id,
        title: `Ambassador Application: ${status}`,
        message: messages[status] || `Your application status has been updated to ${status}.`,
        type: 'system',
        link: status === 'Accepted' ? '/dashboard/ambassador' : '/dashboard',
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
