'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Hammer, Building2, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetup', href: '/dashboard/meetup', icon: Users },
    { name: 'Build', href: '/dashboard/build', icon: Hammer },
    { name: 'Experience', href: '/dashboard/experience', icon: Building2 },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
      <nav className="flex items-center justify-around bg-[#13231c]/95 backdrop-blur-lg border border-emerald-800/60 rounded-3xl p-2 shadow-2xl shadow-emerald-950/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all',
                isActive
                  ? 'bg-brand-500 text-darkpine-950 font-bold scale-105 shadow-md shadow-brand-500/20'
                  : 'text-emerald-300/80 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
