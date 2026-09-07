import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import MeetRequest from '@/lib/models/MeetRequest';
import Project from '@/lib/models/Project';
import ProjectApplication from '@/lib/models/ProjectApplication';
import Experience from '@/lib/models/Experience';
import CampusDemand from '@/lib/models/CampusDemand';
import CohortSession from '@/lib/models/CohortSession';
import Partner from '@/lib/models/Partner';
import AmbassadorApplication from '@/lib/models/AmbassadorApplication';
import Notification from '@/lib/models/Notification';
import { seedDatabase } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

// Purges dummy seed data and ensures clean empty states with real admin intact
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // 1. Remove seeded fake users (keep real users & admin)
    await User.deleteMany({
      email: { $in: ['hamza.raza@aptivo.pk', 'sara.ambassador@fast.edu.pk'] },
    });

    // 2. Remove seeded fake projects, meets, experiences, cohorts, partners, campus demands
    await Promise.all([
      MeetRequest.deleteMany({}),
      Project.deleteMany({}),
      ProjectApplication.deleteMany({}),
      Experience.deleteMany({}),
      CampusDemand.deleteMany({}),
      CohortSession.deleteMany({}),
      Partner.deleteMany({}),
      AmbassadorApplication.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 3. Ensure Admin account is present
    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'All dummy and seed data purged. Database is now in clean state with Admin preserved.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
