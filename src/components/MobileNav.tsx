'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Hammer, Home, UserRound, Users } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Meet', href: '/dashboard/meetup', icon: Users },
  { name: 'Build', href: '/dashboard/build', icon: Hammer },
  { name: 'Experience', href: '/dashboard/experience', icon: Building2 },
  { name: 'Profile', href: '/profile', icon: UserRound },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E7E2] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden shadow-[0_-4px_16px_rgba(24,32,28,0.06)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
        {items.map(({ name, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'flex min-h-[52px] min-w-[3.65rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 transition-colors active:scale-[0.97] font-sans',
                active ? 'text-[#174D3A] font-semibold' : 'text-[#69736D] hover:bg-[#F7F6F1] font-medium'
              )}
            >
              <Icon className={clsx('h-[19px] w-[19px]', active && 'text-[#174D3A]')} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] tracking-tight">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
