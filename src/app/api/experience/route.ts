import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Experience from '@/lib/models/Experience';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category && category.toLowerCase() !== 'all') query.category = category;
    if (city && city.toLowerCase() !== 'all') query.city = city;

    const experiences = await Experience.find(query).sort({ date: 1 });
    return NextResponse.json({ experiences });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(); await connectToDatabase();
    const body = await req.json();

    const newExperience = await Experience.create({
      title: body.title,
      company: body.company,
      description: body.description,
      category: body.category || 'Software House',
      date: body.date,
      time: body.time,
      location: body.location,
      city: body.city || 'Karachi',
      capacity: Number(body.capacity) || 20,
      enrolledCount: 0,
      eligibility: body.eligibility || 'Open to all university students',
      deadline: body.deadline,
      image:
        body.posterUrl ||
        body.image ||
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      posterUrl: body.posterUrl || body.image,
      questionnaire: Array.isArray(body.questionnaire) ? body.questionnaire : [],
      status: body.status || 'Upcoming',
      enrolledStudents: [],
    });

    return NextResponse.json({ success: true, experience: newExperience }, { status: 201 });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin(); await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    const exp = await Experience.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!exp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, experience: exp });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin(); await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await Experience.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
