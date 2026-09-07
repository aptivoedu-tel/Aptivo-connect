'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import NotificationDropdown from '@/components/NotificationDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface IUserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  university: string;
  field: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<IUserProfile | null>(null);

  useEffect(() => {
    let email = '';
    try {
      const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
      if (stored && (stored.name || stored.email)) {
        setUser({
          name: stored.fullName || stored.name || 'Builder',
          email: stored.email || '',
          avatarUrl: stored.profilePhoto || stored.avatarUrl || '',
          university: stored.university || '',
          field: stored.field || stored.fieldOfStudy || stored.degree || '',
        });
        email = stored.email || '';
      }
    } catch {}

    if (email) {
      fetch(`/api/auth/me?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            const u = data.user;
            setUser({
              name: u.fullName || u.name || 'Builder',
              email: u.email,
              avatarUrl: u.profilePhoto || u.avatarUrl || '',
              university: u.university || u.organization || '',
              field: u.field || u.fieldOfStudy || u.degree || u.jobTitle || '',
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col lg:flex-row pb-24 lg:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 min-w-0 max-w-full">
        {/* Top Floating App Bar */}
        <header className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:px-6 mb-5 border border-slate-200/80 shadow-soft flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-9 h-9 rounded-2xl bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome to Aptivo Connect'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {user?.university ? `${user.university} • ${user.field}` : 'Opportunity & Network Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Pill */}
            <Link
              href="/dashboard/meetup"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200/80 transition-colors"
            >
              <span>Explore Meetups</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Avatar */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-500">
                <Image
                  src={
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'Student Profile'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 rounded-3xl bg-white p-4 sm:p-6 lg:p-8 border border-slate-200/80 shadow-soft overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
