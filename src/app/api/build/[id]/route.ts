import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';
import ProjectApplication from '@/lib/models/ProjectApplication';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { id } = params;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isOwner = project.ownerId.toString() === actor._id.toString() || actor.role === 'admin';
    if (!isOwner) return NextResponse.json({ project, applications: [] });
    const applications = await ProjectApplication.find({ projectId: project._id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ project, applications });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await requireUser(); await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const existing = await Project.findById(id);
    if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (existing.ownerId.toString() !== actor._id.toString() && actor.role !== 'admin') return NextResponse.json({ error: 'Only the project owner can update this project.' }, { status: 403 });
    const allowed = ['title', 'problem', 'building', 'description', 'field', 'requiredSkills', 'teamSize', 'duration', 'mode', 'location', 'milestones', 'coverImage'];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    const project = await Project.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
