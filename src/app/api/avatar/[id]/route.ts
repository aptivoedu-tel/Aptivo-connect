import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getBufferFromGridFS } from '@/lib/gridfs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const fileData = await getBufferFromGridFS(id, 'avatars');
    if (!fileData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return new Response(new Uint8Array(fileData.buffer), {
      status: 200,
      headers: {
        'Content-Type': fileData.contentType || 'image/jpeg',
        'Content-Length': fileData.buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
