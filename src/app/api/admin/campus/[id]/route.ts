import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Campus from '@/lib/models/Campus';
import User from '@/lib/models/User';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const clean = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(); await connectToDatabase();
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Campus not found.' }, { status: 404 });
    const campus = await Campus.findById(params.id).lean();
    if (!campus) return NextResponse.json({ error: 'Campus not found.' }, { status: 404 });
    const members = await User.find({ role: { $in: ['student', 'professional'] }, $or: [{ campusId: campus._id }, { university: campus.university, campus: campus.name }] }).select('_id fullName name email profilePhoto avatarUrl degree fieldOfStudy field currentYear graduationYear status').sort({ fullName: 1 }).lean();
    return NextResponse.json({ campus, members });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to load campus.' }, { status: auth?.status || 500 }); }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(); await connectToDatabase();
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Campus not found.' }, { status: 404 });
    const body = await request.json();
    const updates = { name: clean(body.name, 120), university: clean(body.university, 160), shortName: clean(body.shortName, 50), city: clean(body.city, 100), description: clean(body.description, 1000), logoUrl: clean(body.logoUrl, 500), active: Boolean(body.active), visible: Boolean(body.visible) };
    if (!updates.name || !updates.university) return NextResponse.json({ error: 'Campus name and institution are required.' }, { status: 400 });
    const campus = await Campus.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!campus) return NextResponse.json({ error: 'Campus not found.' }, { status: 404 });
    return NextResponse.json({ campus });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to update campus.' }, { status: auth?.status || 500 }); }
}
