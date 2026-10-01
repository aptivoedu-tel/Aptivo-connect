import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { uploadToGridFS } from '@/lib/gridfs';
import { authError, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    await requireAdmin(); await connectToDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum poster/image size is 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = file.type.split('/')[1] || 'jpg';
    const filename = `${category}-${Date.now()}.${extension}`;

    const fileId = await uploadToGridFS(buffer, filename, file.type, 'avatars');
    const url = `/api/avatar/${fileId}`;

    return NextResponse.json({
      success: true,
      url,
      fileId,
      filename,
    });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to upload the image. Please try again.' }, { status: auth?.status || 500 });
  }
}
