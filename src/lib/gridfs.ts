import mongoose from 'mongoose';
import connectToDatabase from './db';
import { Readable } from 'stream';

export async function getGridFSBucket(bucketName = 'avatars'): Promise<mongoose.mongo.GridFSBucket | null> {
  const conn = await connectToDatabase();
  if (!conn || !conn.connection.db) {
    return null;
  }
  return new mongoose.mongo.GridFSBucket(conn.connection.db, {
    bucketName,
  });
}

export async function uploadToGridFS(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  bucketName = 'avatars'
): Promise<string> {
  const bucket = await getGridFSBucket(bucketName);
  if (!bucket) {
    throw new Error('Database connection or GridFS bucket unavailable');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: { uploadedAt: new Date() },
    });

    const readable = Readable.from(fileBuffer);
    readable
      .pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve(uploadStream.id.toString()));
  });
}

export async function getBufferFromGridFS(
  fileId: string,
  bucketName = 'avatars'
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const bucket = await getGridFSBucket(bucketName);
  if (!bucket) return null;

  try {
    const _id = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return null;
    }

    const file = files[0];
    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(_id);

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: file.contentType || 'image/jpeg',
        });
      });
    });
  } catch {
    return null;
  }
}
