import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CampusDemand from '@/lib/models/CampusDemand';
import Notification from '@/lib/models/Notification';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const university = searchParams.get('university');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (university && university !== 'all') query.university = new RegExp(university, 'i');

    const [demands, totalCampusCount] = await Promise.all([
      CampusDemand.find(query).sort({ createdAt: -1 }),
      CampusDemand.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      demands,
      totalCount: totalCampusCount,
    });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { demandId, status, actionNotes } = body;

    if (!demandId || !status) {
      return NextResponse.json({ error: 'demandId and status are required' }, { status: 400 });
    }

    const demand = await CampusDemand.findById(demandId);
    if (!demand) {
      return NextResponse.json({ error: 'Campus demand record not found' }, { status: 404 });
    }

    demand.status = status;
    if (actionNotes !== undefined) {
      demand.actionNotes = actionNotes;
    }
    demand.updatedAt = new Date();
    await demand.save();

    // Notify ambassador/creator of update
    if (demand.ambassadorId) {
      await Notification.create({
        userId: demand.ambassadorId,
        title: `Campus Request Updated: ${demand.title}`,
        message: `Status set to "${status}" by ${admin.fullName || admin.name}.${actionNotes ? ` Notes: ${actionNotes}` : ''}`,
        type: 'system',
        link: '/dashboard/ambassador',
      });
    }

    return NextResponse.json({ success: true, demand });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
