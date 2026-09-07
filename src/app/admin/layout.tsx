import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aptivo Connect | Admin Operations Hub',
  description: 'Operations, Matching & Facilitation Portal for Aptivo Connect.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
