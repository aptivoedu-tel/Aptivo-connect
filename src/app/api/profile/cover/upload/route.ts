import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { uploadToGridFS } from '@/lib/gridfs';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await connectToDatabase();
    const file = (await req.formData()).get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No cover image provided.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Use a JPEG, PNG, or WEBP image.' }, { status: 400 });
    if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: 'Cover image must be 5MB or smaller.' }, { status: 400 });
    const fileId = await uploadToGridFS(Buffer.from(await file.arrayBuffer()), `cover-${user._id}-${Date.now()}.${file.type.split('/')[1]}`, file.type, 'avatars');
    const coverImage = `/api/avatar/${fileId}`;
    user.coverImage = coverImage;
    await user.save();
    return NextResponse.json({ success: true, coverImage });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json(auth || { error: 'Unable to upload cover image.' }, { status: auth?.status || 500 });
  }
}
