import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seedData';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await requireAdmin();
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const auth = authError(error);
    console.error('Seed error:', error);
    return NextResponse.json(auth || { success: false, error: (error as Error).message }, { status: auth?.status || 500 });
  }
}
