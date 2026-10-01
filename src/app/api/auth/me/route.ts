import { NextResponse } from 'next/server';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json({ user: user.toObject() });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const allowed = ['fullName', 'name', 'phone', 'whatsapp', 'city', 'university', 'campus', 'degree', 'fieldOfStudy', 'field', 'currentYear', 'graduationYear', 'expectedGraduation', 'organization', 'jobTitle', 'professionalRole', 'industry', 'experienceYears', 'bio', 'skills', 'interests', 'linkedin', 'linkedinUrl', 'github', 'githubUrl', 'portfolio', 'portfolioUrl', 'otherLinks', 'privacy'];
    for (const key of allowed) if (key in body) (user as any)[key] = body[key];
    await user.save();
    return NextResponse.json({ success: true, user: user.toObject() });
  } catch (error: unknown) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
