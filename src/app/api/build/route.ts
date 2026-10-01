import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { authError, requireAdmin, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const field = searchParams.get('field');
    const status = searchParams.get('status');
    const showcaseOnly = searchParams.get('showcase') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (field && field !== 'All') query.field = new RegExp(field, 'i');
    if (status?.toLowerCase() === 'all') {
      await requireAdmin();
    } else if (status) {
      if (!['Approved', 'Active', 'Showcase'].includes(status)) await requireAdmin();
      query.status = status;
    } else {
      query.status = { $in: ['Approved', 'Active', 'Showcase'] };
    }
    if (showcaseOnly) query.status = 'Showcase';

    const projects = await Project.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const student = await requireUser(); await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.problem || !body.building) {
      return NextResponse.json(
        { error: 'Project Title, Problem statement, and What you are building are required.' },
        { status: 400 }
      );
    }


    const newProject = await Project.create({
      title: body.title,
      problem: body.problem,
      building: body.building,
      description: body.description || body.problem,
      field: body.field || 'Software',
      requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : [],
      teamSize: Number(body.teamSize) || 4,
      duration: body.duration || '6 weeks',
      mode: body.mode || 'Remote',
      location: body.location || student.city || 'Remote',
      ownerId: student._id,
      ownerName: student.fullName || student.name,
      ownerAvatar: student.profilePhoto || student.avatarUrl,
      ownerUniversity: student.university || 'University',
      members: [
        {
          userId: student._id,
          name: student.fullName || student.name,
          role: 'Project Lead',
          avatarUrl: student.profilePhoto || student.avatarUrl,
          university: student.university,
        },
      ],
      milestones: [
        {
          title: 'Week 1-2: Architecture & Setup',
          description: 'Repo initialization, tech stack alignment, and schema design.',
          status: 'in-progress',
          weekNumber: 1,
        },
        {
          title: 'Week 3-4: Core Feature Build',
          description: 'Implementing MVP modules and API endpoints.',
          status: 'pending',
          weekNumber: 3,
        },
        {
          title: 'Week 5-6: Testing & Showcase Submission',
          description: 'End-to-end testing, live deployment, and showcase review.',
          status: 'pending',
          weekNumber: 5,
        },
      ],
      status: 'Pending',
      isAptivoVerified: false,
      coverImage:
        body.coverImage ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    });

    await Notification.create({
      userId: student._id,
      title: 'Project Proposal Submitted for Review',
      message: `"${body.title}" is under Aptivo curation. We will validate scope and open for applications.`,
      type: 'build',
      link: '/dashboard/build',
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const { id, status, isAptivoVerified, showcase, milestones } = body;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (status) {
      if (actor.role !== 'admin') return NextResponse.json({ error: 'Only an administrator can change project publication status.' }, { status: 403 });
      project.status = status;
    }
    if (isAptivoVerified !== undefined) { if (actor.role !== 'admin') return NextResponse.json({ error: 'Only an administrator can verify a project.' }, { status: 403 }); project.isAptivoVerified = isAptivoVerified; }
    if (milestones) { if (project.ownerId.toString() !== actor._id.toString() && actor.role !== 'admin') return NextResponse.json({ error: 'Only the project owner can update milestones.' }, { status: 403 }); project.milestones = milestones; }
    if (showcase) {
      if (project.ownerId.toString() !== actor._id.toString() && actor.role !== 'admin') return NextResponse.json({ error: 'Only the project owner can submit a showcase.' }, { status: 403 });
      project.showcase = {
        ...project.showcase,
        ...showcase,
        publishedAt: new Date(),
      };
      project.status = 'Showcase';
      project.isAptivoVerified = true;
    }

    await project.save();

    // Notify project owner
    if (project.ownerId) {
      await Notification.create({
        userId: project.ownerId,
        title: `Project Status Updated: ${project.title}`,
        message: `Your project is now marked as "${project.status}".`,
        type: 'build',
        link: '/dashboard/build',
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
