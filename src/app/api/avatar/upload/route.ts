import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { uploadToGridFS } from '@/lib/gridfs';
import { authError, requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const user = await requireUser(); await connectToDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum image size is 5MB.' },
        { status: 400 }
      );
    }

    const uploadType = (formData.get('type') as string | null) || 'avatar';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${uploadType === 'cover' ? 'cover' : 'avatar'}-${user._id}-${Date.now()}.${file.type.split('/')[1] || 'jpg'}`;

    const fileId = await uploadToGridFS(buffer, filename, file.type, 'avatars');
    const mediaUrl = `/api/avatar/${fileId}`;

    // Update user profile in MongoDB for the authenticated user
    if (uploadType === 'cover') {
      user.coverImage = mediaUrl;
    } else {
      user.profilePhoto = mediaUrl;
      user.avatarUrl = mediaUrl;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      message: uploadType === 'cover' ? 'Cover uploaded successfully!' : 'Avatar uploaded successfully!',
      avatarUrl: mediaUrl,
      coverUrl: mediaUrl,
      fileId,
    });
  } catch (error: unknown) {
    const auth = authError(error); return NextResponse.json(auth || { error: 'Unable to upload your profile photo. Please try again.' }, { status: auth?.status || 500 });
  }
}
