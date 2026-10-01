import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ProjectApplication from '@/lib/models/ProjectApplication';
import Project from '@/lib/models/Project';
import Notification from '@/lib/models/Notification';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const applicant = await requireUser(); await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { applicantId: applicant._id };
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ applications: [] });
      query.projectId = project._id;
      if (project.ownerId?.toString() === applicant._id.toString() || applicant.role === 'admin') {
        delete query.applicantId;
      }
    }

    const applications = await ProjectApplication.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ applications });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const applicant = await requireUser(); await connectToDatabase();
    const body = await req.json();

    if (!body.projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await Project.findById(body.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }


    // Check duplicate application
    const existing = await ProjectApplication.findOne({
      projectId: project._id,
      applicantId: applicant._id,
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already applied to join this project team.' }, { status: 400 });
    }

    const application = await ProjectApplication.create({
      projectId: project._id,
      projectTitle: project.title,
      applicantId: applicant._id,
      applicantName: applicant.fullName || applicant.name,
      applicantEmail: applicant.email,
      applicantUniversity: applicant.university || 'University',
      applicantAvatar: applicant.profilePhoto || applicant.avatarUrl,
      whyJoin: body.whyJoin || 'Excited to contribute to this problem.',
      contribution: body.contribution || 'Full-stack & UI development.',
      skills: Array.isArray(body.skills) ? body.skills : typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()) : applicant.skills || [],
      portfolioUrl: body.portfolioUrl || applicant.portfolio || applicant.github || '',
      availability: body.availability || '10-15 hrs/week',
      status: 'Applied',
    });

    // Notify project owner
    if (project.ownerId) {
      await Notification.create({
        userId: project.ownerId,
        title: `New Applicant for ${project.title}`,
        message: `${applicant.fullName || applicant.name} applied to join your project team.`,
        type: 'build',
        link: `/dashboard/build/${project._id}`,
      });
    }

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { applicationId, status } = body;

    const application = await ProjectApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const projectForDecision = await Project.findById(application.projectId);
    if (!projectForDecision || (projectForDecision.ownerId.toString() !== actor._id.toString() && actor.role !== 'admin')) return NextResponse.json({ error: 'Only the project owner can review applications.' }, { status: 403 });
    application.status = status;
    await application.save();

    if (status === 'Accepted') {
      // Add member to project
      const project = projectForDecision;
      if (project) {
        const isAlreadyMember = project.members.some(
          (m) => m.userId?.toString() === application.applicantId?.toString()
        );
        if (!isAlreadyMember) {
          project.members.push({
            userId: application.applicantId,
            name: application.applicantName,
            role: 'Team Member',
            avatarUrl: application.applicantAvatar,
            university: application.applicantUniversity,
          });
          await project.save();
        }
      }
    }

    // Notify applicant
    if (application.applicantId) {
      await Notification.create({
        userId: application.applicantId,
        title: `Application ${status}: ${application.projectTitle}`,
        message: `Your application to join "${application.projectTitle}" has been ${status.toLowerCase()}.`,
        type: 'build',
        link: `/dashboard/build/${application.projectId}`,
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
