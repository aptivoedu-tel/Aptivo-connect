import 'server-only';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import User from '@/lib/models/User';
import connectToDatabase from '@/lib/db';

export const SESSION_COOKIE = 'aptivo_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = { id: string; email: string; role: 'student' | 'professional' | 'admin'; exp: number };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must be configured with at least 32 characters.');
  return value;
}

function signature(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSessionToken(user: { _id: unknown; email: string; role: 'student' | 'professional' | 'admin' }) {
  const payload: SessionPayload = { id: String(user._id), email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signature(encoded)}`;
}

function parseSession(token?: string): SessionPayload | null {
  if (!token) return null;
  const [encoded, received] = token.split('.');
  if (!encoded || !received) return null;
  const expected = signature(encoded);
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

export async function getCurrentUser() {
  const session = parseSession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await connectToDatabase();
  const user = await User.findById(session.id).select('-password -passwordHash');
  if (!user || user.email !== session.email || user.role !== session.role) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}

export function authError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'UNAUTHORIZED') return { error: 'Authentication required.', status: 401 };
  if (message === 'FORBIDDEN') return { error: 'Administrator access required.', status: 403 };
  return null;
}

export const sessionCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: SESSION_MAX_AGE };
