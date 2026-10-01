import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ProfileRecord from '@/lib/models/ProfileRecord';
import { authError, requireUser } from '@/lib/auth';

const isUrl = (value: unknown) => { try { const url = new URL(String(value)); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } };

export async function GET() {
  try { const user = await requireUser(); await connectToDatabase(); return NextResponse.json({ records: await ProfileRecord.find({ userId: user._id }).sort({ endDate: -1, createdAt: -1 }) }); }
  catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
export async function POST(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase(); const body = await req.json();
    if (!['project', 'experience', 'leadership', 'achievement'].includes(body.section) || !String(body.title || '').trim()) return NextResponse.json({ error: 'A section and title are required.' }, { status: 400 });
    const artifacts = Array.isArray(body.artifacts) ? body.artifacts.filter((item: { url?: string }) => isUrl(item.url)).map((item: { label?: string; url: string }) => ({ label: String(item.label || '').slice(0, 100), url: item.url })) : [];
    if (Array.isArray(body.artifacts) && artifacts.length !== body.artifacts.length) return NextResponse.json({ error: 'All artifact links must be valid HTTP or HTTPS URLs.' }, { status: 400 });
    const record = await ProfileRecord.create({ userId: user._id, origin: 'SELF_ADDED', section: body.section, title: String(body.title).trim(), role: body.role, organization: body.organization, description: body.description, skills: Array.isArray(body.skills) ? body.skills : [], artifacts, startDate: body.startDate, endDate: body.endDate, status: body.status === 'active' ? 'active' : 'completed', visibility: body.visibility === 'private' ? 'private' : 'public', verification: 'SELF_REPORTED' });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
