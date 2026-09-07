import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { uploadToGridFS } from '@/lib/gridfs';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const email = formData.get('email') as string | null;
    const userId = formData.get('userId') as string | null;

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

    // Resolve user
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `avatar-${user._id}-${Date.now()}.${file.type.split('/')[1] || 'jpg'}`;

    const fileId = await uploadToGridFS(buffer, filename, file.type, 'avatars');
    const avatarUrl = `/api/avatar/${fileId}`;

    // Update user profile in MongoDB
    user.profilePhoto = avatarUrl;
    user.avatarUrl = avatarUrl;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully!',
      avatarUrl,
      fileId,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
