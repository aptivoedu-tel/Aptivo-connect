'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Hammer,
  Building2,
  Sparkles,
  User,
  ShieldAlert,
  Award,
  Radio,
  LogOut,
  Link2,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
      setIsAdmin(stored.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meet', href: '/dashboard/meetup', icon: Users, badge: 'Events' },
    { name: 'Build', href: '/dashboard/build', icon: Hammer, badge: 'Teams' },
    { name: 'Experience', href: '/dashboard/experience', icon: Building2, badge: 'Visits' },
    { name: 'Campus', href: '/dashboard/campus', icon: Building2, badge: 'Discover' },
    { name: 'Connections', href: '/dashboard/people', icon: Compass, badge: 'Discover' },
    { name: 'Chats', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Showcase', href: '/showcase', icon: Award, badge: 'Builds' },
    { name: 'Ambassador', href: '/dashboard/ambassador', icon: Radio, badge: 'Apply' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#13231c] text-white p-5 rounded-3xl shrink-0 my-4 ml-4 shadow-xl border border-emerald-950/40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-emerald-900/60">
        <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-darkpine-950 font-bold shadow-md shadow-brand-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-normal text-xl tracking-tight text-white flex items-center gap-1">
            Aptivo <span className="font-sans font-medium text-sm text-brand-400">Connect</span>
          </h2>
          <p className="text-[11px] text-emerald-300 font-medium font-sans">
            Student Opportunity Hub
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 flex-1 overflow-y-auto pr-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Platform Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500 text-darkpine-950 font-bold shadow-md shadow-brand-500/30 translate-x-1'
                  : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-darkpine-950' : 'text-emerald-400'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-800 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom section — Admin link only visible to admin role */}
      <div className="pt-3 border-t border-emerald-900/60 space-y-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-xs font-medium text-emerald-300 hover:text-white transition-all border border-emerald-800/40"
          >
            <ShieldAlert className="w-4 h-4 text-brand-400" />
            <span>Admin Operations Hub</span>
          </Link>
        )}
        <button
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            try {
              localStorage.removeItem('aptivo_user');
            } catch {}
            window.location.replace('/auth/login');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-emerald-400/80 hover:text-white transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
