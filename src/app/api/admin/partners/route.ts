import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Partner from '@/lib/models/Partner';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// INTERNAL ADMIN-ONLY — Partners are managed by Aptivo team, not self-service
export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (type && type !== 'All') query.type = type;
    if (status && status !== 'All') query.partnershipStatus = status;

    const partners = await Partner.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ partners });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

// Admin creates a partner CRM record (no self-registration)
export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await req.json();

    const partner = await Partner.create({
      organizationName: body.organizationName,
      type: body.type || 'Company',
      contactPerson: body.contactPerson,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      contactWhatsApp: body.contactWhatsApp,
      city: body.city || 'Karachi',
      country: body.country || 'Pakistan',
      websiteUrl: body.websiteUrl,
      logoUrl: body.logoUrl,
      description: body.description,
      whatTheyProvide: body.whatTheyProvide,
      pillarsSupported: body.pillarsSupported || ['EXPERIENCE'],
      partnershipStatus: body.partnershipStatus || 'Active',
      lastContactDate: body.lastContactDate,
      internalNotes: body.internalNotes,
      opportunitiesProvidedCount: Number(body.opportunitiesProvidedCount) || 0,
      studentsReachedCount: Number(body.studentsReachedCount) || 0,
    });

    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}

// Admin updates a partner record
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const body = await req.json();
    const { partnerId, ...updates } = body;

    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      { $set: updates },
      { new: true }
    );
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: unknown) { const auth = authError(error); return NextResponse.json(auth || { error: (error as Error).message }, { status: auth?.status || 500 }); }
}
