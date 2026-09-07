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
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aptivo_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
