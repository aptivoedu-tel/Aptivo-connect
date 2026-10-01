import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CampusDemand from '@/lib/models/CampusDemand';
import User from '@/lib/models/User';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';
import Notification from '@/lib/models/Notification';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase();
    const body = await req.json();
    const {
      campus,
      university,
      category,
      title,
      studentCountEstimate,
      description,
    } = body;


    // Verify user is an approved ambassador
    const app = await AmbassadorApplication.findOne({
      userId: user._id,
      status: 'Accepted',
    });

    if (!app && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: Only accepted ambassadors can report campus demands.' },
        { status: 403 }
      );
    }

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    const targetUniversity = university || app?.university || user.university || 'University Campus';
    const targetCampus = campus || app?.campusOrCommunity || user.campus || targetUniversity;

    const demand = await CampusDemand.create({
      ambassadorId: user._id,
      ambassadorName: user.fullName || user.name,
      campus: targetCampus,
      university: targetUniversity,
      category: category || 'MEET',
      title,
      studentCountEstimate: Number(studentCountEstimate) || 10,
      description,
      status: 'Reported',
    });

    // Notify admins of new campus demand
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: `Campus Demand: ${targetUniversity}`,
        message: `${user.fullName || user.name} reported demand: "${title}" (${studentCountEstimate} students).`,
        type: 'system',
        link: '/admin',
      });
    }

    return NextResponse.json({ success: true, demand }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
