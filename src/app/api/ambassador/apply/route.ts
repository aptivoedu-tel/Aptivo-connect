import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ error: 'Ambassador is not part of this release.' }, { status: 404 }); }
export async function POST() { return NextResponse.json({ error: 'Ambassador is not part of this release.' }, { status: 404 }); }
