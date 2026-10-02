import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Campus from '@/lib/models/Campus';
import { authError, requireUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const viewer = await requireUser(); await connectToDatabase();
    const { searchParams } = new URL(req.url); const university = searchParams.get('university'); const campus = searchParams.get('campus'); const q = searchParams.get('q')?.trim();
    const query: Record<string, unknown> = { _id: { $ne: viewer._id }, role: { $in: ['student', 'professional'] }, 'privacy.isPublic': { $ne: false }, 'privacy.appearInDiscovery': { $ne: false }, 'privacy.appearInCampus': { $ne: false } };
    const managed = await Campus.find({ active: true, visible: true }).select('_id university name').lean();
    if (university && campus) {
      const selected = managed.find((item) => item.university === university && item.name === campus);
      query.$or = selected ? [{ campusId: selected._id }, { university, campus }] : [{ university, campus }];
    } else if (managed.length) {
      query.$or = managed.flatMap((item) => [{ campusId: item._id }, { university: item.university, campus: item.name }]);
    }
    if (q) { const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); query.$and = [{ $or: query.$or || [{}] }, { $or: [{ fullName: regex }, { name: regex }, { skills: regex }, { fieldOfStudy: regex }, { degree: regex }] }]; delete query.$or; }
    const people = await User.find(query).select('_id fullName name headline avatarUrl profilePhoto university campus degree fieldOfStudy field graduationYear skills privacy').sort({ fullName: 1 }).limit(60);
    const directories = await Promise.all(managed.map(async (item) => ({ _id: { university: item.university, campus: item.name }, count: await User.countDocuments({ role: { $in: ['student', 'professional'] }, 'privacy.isPublic': { $ne: false }, 'privacy.appearInDiscovery': { $ne: false }, 'privacy.appearInCampus': { $ne: false }, $or: [{ campusId: item._id }, { university: item.university, campus: item.name }] }) })));
    return NextResponse.json({ people, directories });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
