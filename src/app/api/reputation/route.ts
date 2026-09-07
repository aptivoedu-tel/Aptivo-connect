import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { projectId, reviewerEmail, targetUserId, category, comment } = body;

    if (!projectId || !reviewerEmail || !targetUserId || !category) {
      return NextResponse.json(
        { error: 'Project ID, reviewer email, target user, and category are required.' },
        { status: 400 }
      );
    }

    const validCategories = [
      'Technical contribution',
      'Collaboration',
      'Reliability',
      'Communication',
      'Leadership',
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid reputation category.' }, { status: 400 });
    }

    const reviewer = await User.findOne({ email: reviewerEmail.trim().toLowerCase() });
    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer account not found.' }, { status: 401 });
    }

    if (reviewer._id.toString() === targetUserId.toString()) {
      return NextResponse.json({ error: 'You cannot provide reputation feedback to yourself.' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Verify both reviewer and target user were legitimate project collaborators
    const isReviewerInProject =
      project.ownerId?.toString() === reviewer._id.toString() ||
      project.members.some((m) => m.userId?.toString() === reviewer._id.toString());

    const isTargetInProject =
      project.ownerId?.toString() === targetUserId.toString() ||
      project.members.some((m) => m.userId?.toString() === targetUserId.toString());

    if (!isReviewerInProject || !isTargetInProject) {
      return NextResponse.json(
        { error: 'Only confirmed project teammates can provide structured peer reputation feedback.' },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    // Check duplicate endorsement for the same category on this project
    const existing = targetUser.reputation?.some(
      (r) =>
        r.fromUserId?.toString() === reviewer._id.toString() &&
        r.projectId?.toString() === project._id.toString() &&
        r.category === category
    );
    if (existing) {
      return NextResponse.json(
        { error: `You have already endorsed ${targetUser.fullName || targetUser.name} for ${category} on this project.` },
        { status: 409 }
      );
    }

    targetUser.reputation.push({
      fromUserId: reviewer._id,
      fromUserName: reviewer.fullName || reviewer.name,
      projectId: project._id,
      projectTitle: project.title,
      category,
      comment: comment?.trim() || '',
      createdAt: new Date(),
    });

    await targetUser.save();

    await Notification.create({
      userId: targetUser._id,
      title: 'Peer Endorsement Received',
      message: `${reviewer.fullName || reviewer.name} endorsed you for ${category} on "${project.title}".`,
      type: 'build',
      link: `/profile/${targetUser._id}`,
    });

    return NextResponse.json({ success: true, message: 'Peer endorsement recorded.' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
