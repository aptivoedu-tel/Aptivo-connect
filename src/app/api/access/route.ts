import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AccessEvent from '@/lib/models/AccessEvent';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const format = searchParams.get('format');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category && category !== 'All') query.category = category;
    if (format && format !== 'All') query.format = format;

    const events = await AccessEvent.find(query).sort({ date: 1 });
    return NextResponse.json({ events });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newEvent = await AccessEvent.create({
      title: body.title,
      category: body.category || 'Meetup',
      description: body.description,
      date: body.date,
      time: body.time,
      format: body.format || 'Online',
      linkOrVenue: body.linkOrVenue,
      partnerName: body.partnerName || 'Aptivo Connect',
      perks: Array.isArray(body.perks) ? body.perks : typeof body.perks === 'string' ? body.perks.split(',').map((p: string) => p.trim()) : [],
      image:
        body.image ||
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      status: body.status || 'Upcoming',
      registrations: [],
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    const event = await AccessEvent.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!event) {
      return NextResponse.json({ error: 'Access opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await AccessEvent.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
