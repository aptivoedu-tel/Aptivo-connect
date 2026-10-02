import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Campus from '@/lib/models/Campus';
import User from '@/lib/models/User';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const clean = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET() {
  try {
    await requireAdmin(); await connectToDatabase();
    const campuses = await Campus.find().sort({ university: 1, name: 1 }).lean();
    const withCounts = await Promise.all(campuses.map(async (campus) => ({
      ...campus,
      studentCount: await User.countDocuments({ role: { $in: ['student', 'professional'] }, $or: [{ campusId: campus._id }, { university: campus.university, campus: campus.name }] }),
    })));
    return NextResponse.json({ campuses: withCounts });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to load campuses.' }, { status: auth?.status || 500 }); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(); await connectToDatabase();
    const body = await request.json();
    const name = clean(body.name, 120); const university = clean(body.university, 160);
    if (!name || !university) return NextResponse.json({ error: 'Campus name and institution are required.' }, { status: 400 });
    const campus = await Campus.create({ name, university, shortName: clean(body.shortName, 50), city: clean(body.city, 100), description: clean(body.description, 1000), logoUrl: clean(body.logoUrl, 500), active: body.active !== false, visible: body.visible !== false });
    return NextResponse.json({ campus }, { status: 201 });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to create campus.' }, { status: auth?.status || 500 }); }
}
