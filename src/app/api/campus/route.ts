import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { authError, requireUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const viewer = await requireUser(); await connectToDatabase();
    const { searchParams } = new URL(req.url); const university = searchParams.get('university'); const campus = searchParams.get('campus'); const q = searchParams.get('q')?.trim();
    const query: Record<string, unknown> = { _id: { $ne: viewer._id }, role: { $in: ['student', 'professional'] }, 'privacy.isPublic': { $ne: false }, 'privacy.appearInDiscovery': { $ne: false }, 'privacy.appearInCampus': { $ne: false }, university: { $exists: true, $ne: '' }, campus: { $exists: true, $ne: '' } };
    if (university) query.university = university;
    if (campus) query.campus = campus;
    if (q) { const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); query.$or = [{ fullName: regex }, { name: regex }, { skills: regex }, { fieldOfStudy: regex }, { degree: regex }]; }
    const people = await User.find(query).select('_id fullName name headline avatarUrl profilePhoto university campus degree fieldOfStudy field graduationYear skills privacy').sort({ fullName: 1 }).limit(60);
    const directories = await User.aggregate([{ $match: { role: { $in: ['student', 'professional'] }, 'privacy.isPublic': { $ne: false }, 'privacy.appearInDiscovery': { $ne: false }, 'privacy.appearInCampus': { $ne: false }, university: { $exists: true, $ne: '' }, campus: { $exists: true, $ne: '' } } }, { $group: { _id: { university: '$university', campus: '$campus' }, count: { $sum: 1 } } }, { $sort: { '_id.university': 1, '_id.campus': 1 } }]);
    return NextResponse.json({ people, directories });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
