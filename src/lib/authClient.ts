export interface CurrentUser {
  _id: string;
  fullName: string;
  name: string;
  email: string;
  accountType: 'student' | 'professional';
  role: 'student' | 'professional' | 'admin';
  university?: string;
  degree?: string;
  organization?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export function getCurrentUser(): CurrentUser | null {
  // Compatibility-only UI cache. Never use this value for access control;
  // protected APIs resolve identity from the signed HttpOnly session cookie.
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aptivo_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<CurrentUser | null> {
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user || null;
  } catch { return null; }
}

export function setCurrentUser(user: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aptivo_user', JSON.stringify(user));
  } catch {}
}

export function clearCurrentUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('aptivo_user');
  } catch {}
}
