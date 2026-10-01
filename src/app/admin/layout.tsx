import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Aptivo Connect | Admin Operations Hub',
  description: 'Operations, Matching & Facilitation Portal for Aptivo Connect.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login?next=/admin');
  if (user.role !== 'admin') redirect('/dashboard');
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
