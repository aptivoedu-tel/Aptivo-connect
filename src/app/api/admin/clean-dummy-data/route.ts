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
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Known demo/seed email addresses — extend this list as needed
const DEMO_USER_EMAILS = [
  'hamza.raza@aptivo.pk',
  'sara.ambassador@fast.edu.pk',
];

/**
 * POST /api/admin/clean-dummy-data
 *
 * Query params:
 *   ?dry=true   — inspect only, no writes (default: false)
 *
 * Removes seeded demo users and all content records,
 * then re-runs the admin bootstrap.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const isDryRun = searchParams.get('dry') === 'true';

    // ── 1. Identify demo users ──────────────────────────────────────────────
    const demoUsers = await User.find({
      email: { $in: DEMO_USER_EMAILS },
    }).select('_id fullName email role');

    // ── 2. Count content records that would be removed ─────────────────────
    const [
      meetCount,
      projectCount,
      appCount,
      expCount,
      campusCount,
      cohortCount,
      partnerCount,
      ambassadorCount,
      notifCount,
    ] = await Promise.all([
      MeetRequest.countDocuments({}),
      Project.countDocuments({}),
      ProjectApplication.countDocuments({}),
      Experience.countDocuments({}),
      CampusDemand.countDocuments({}),
      CohortSession.countDocuments({}),
      Partner.countDocuments({}),
      AmbassadorApplication.countDocuments({}),
      Notification.countDocuments({}),
    ]);

    const report = {
      demoUsersFound: demoUsers.map((u) => ({ id: u._id, email: u.email, name: u.fullName })),
      contentToRemove: {
        meetRequests: meetCount,
        projects: projectCount,
        projectApplications: appCount,
        experiences: expCount,
        campusDemands: campusCount,
        cohortSessions: cohortCount,
        partners: partnerCount,
        ambassadorApplications: ambassadorCount,
        notifications: notifCount,
      },
    };

    if (isDryRun) {
      return NextResponse.json({
        dryRun: true,
        message: 'DRY RUN — no changes made. Review the report below.',
        ...report,
      });
    }

    // ── 3. Delete demo users ────────────────────────────────────────────────
    await User.deleteMany({ email: { $in: DEMO_USER_EMAILS } });

    // ── 4. Remove all content records ──────────────────────────────────────
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

    // ── 5. Re-bootstrap admin account ──────────────────────────────────────
    const seed = await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'All demo data purged. Database is now clean with Admin preserved.',
      removedDemoUsers: report.demoUsersFound,
      removedContent: report.contentToRemove,
      adminBootstrap: seed,
    });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(
      auth || { error: (error as Error).message },
      { status: auth?.status || 500 }
    );
  }
}
