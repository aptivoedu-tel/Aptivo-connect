import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CampusDemand from '@/lib/models/CampusDemand';
import User from '@/lib/models/User';
import MeetRequest from '@/lib/models/MeetRequest';
import Project from '@/lib/models/Project';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const campus = searchParams.get('campus');
    const university = searchParams.get('university');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (campus && campus !== 'All') query.campus = new RegExp(campus, 'i');
    if (university && university !== 'All') query.university = new RegExp(university, 'i');

    const [demands, campusStudentsCount, campusMeetsCount, activeCampusProjects] = await Promise.all([
      CampusDemand.find(query).sort({ createdAt: -1 }),
      User.countDocuments(university ? { university: new RegExp(university, 'i') } : {}),
      MeetRequest.countDocuments(university ? { studentUniversity: new RegExp(university, 'i') } : {}),
      Project.countDocuments(university ? { ownerUniversity: new RegExp(university, 'i'), status: { $in: ['Approved', 'Active'] } } : { status: { $in: ['Approved', 'Active'] } }),
    ]);

    return NextResponse.json({
      demands,
      stats: {
        campusStudentsCount,
        campusMeetsCount,
        activeCampusProjects,
        resolvedDemands: demands.filter((d) => d.status === 'Resolved' || d.status === 'Action Scheduled').length,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
