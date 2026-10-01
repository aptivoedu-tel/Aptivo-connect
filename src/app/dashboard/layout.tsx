import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login?next=/dashboard');
  return <DashboardShell user={{ name: user.fullName || user.name, email: user.email, avatarUrl: user.profilePhoto || user.avatarUrl || '', university: user.university || user.organization || '', field: user.field || user.fieldOfStudy || user.degree || user.jobTitle || '', role: user.role || 'student' }}>{children}</DashboardShell>;
}
