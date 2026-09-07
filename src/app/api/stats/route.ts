import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import MeetRequest from '@/lib/models/MeetRequest';
import Project from '@/lib/models/Project';
import Experience from '@/lib/models/Experience';
import AccessEvent from '@/lib/models/AccessEvent';
import ProjectApplication from '@/lib/models/ProjectApplication';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        stats: {
          studentsCount: 0,
          professionalsCount: 0,
          meetRequestsCount: 0,
          pendingMeetsCount: 0,
          activeProjectsCount: 0,
          pendingProjectsCount: 0,
          experiencesCount: 0,
          accessEventsCount: 0,
          pendingApplicationsCount: 0,
          pendingAmbassadorsCount: 0,
        },
      });
    }

    const [
      studentsCount,
      professionalsCount,
      meetRequestsCount,
      pendingMeetsCount,
      activeProjectsCount,
      pendingProjectsCount,
      experiencesCount,
      accessEventsCount,
      pendingApplicationsCount,
      pendingAmbassadorsCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'professional' }),
      MeetRequest.countDocuments(),
      MeetRequest.countDocuments({ status: { $in: ['Submitted', 'Finding Connection'] } }),
      Project.countDocuments({ status: { $in: ['Approved', 'Active', 'Showcase'] } }),
      Project.countDocuments({ status: 'Pending' }),
      Experience.countDocuments(),
      AccessEvent.countDocuments(),
      ProjectApplication.countDocuments({ status: 'Applied' }),
      AmbassadorApplication.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    ]);

    return NextResponse.json({
      stats: {
        studentsCount,
        professionalsCount,
        meetRequestsCount,
        pendingMeetsCount,
        activeProjectsCount,
        pendingProjectsCount,
        experiencesCount,
        accessEventsCount,
        pendingApplicationsCount,
        pendingAmbassadorsCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
