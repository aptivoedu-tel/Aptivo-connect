import { NextResponse } from 'next/server';

/** Retired legacy Campus Demand feature. Campus management lives at /api/admin/campus. */
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ error: 'This legacy feature has been retired.' }, { status: 404 }); }
export async function PATCH() { return NextResponse.json({ error: 'This legacy feature has been retired.' }, { status: 404 }); }
