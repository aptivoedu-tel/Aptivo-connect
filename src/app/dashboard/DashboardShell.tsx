'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Building2, ChevronDown, Compass, Hammer, LogOut, Menu, MessageCircle, Radio, Search, Sparkles, Users, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import MobileNav from '@/components/MobileNav';
import NotificationDropdown from '@/components/NotificationDropdown';
import { rememberInternalNavigation } from '@/components/BackButton';
import { clsx } from 'clsx';

type UserProfile = { name: string; email: string; avatarUrl: string; university: string; field: string; role: string };
const primary = [
  { name: 'Home', href: '/dashboard', icon: Sparkles },
  { name: 'Meet', href: '/dashboard/meetup', icon: Users },
  { name: 'Build', href: '/dashboard/build', icon: Hammer },
  { name: 'Experience', href: '/dashboard/experience', icon: Building2 },
  { name: 'Campus', href: '/dashboard/campus', icon: Compass },
];
const secondary = [
  { name: 'Chats', href: '/dashboard/messages', icon: MessageCircle },
  { name: 'Connections', href: '/dashboard/people', icon: Users },
  { name: 'Showcase', href: '/showcase', icon: Award },
  { name: 'Ambassador', href: '/dashboard/ambassador', icon: Radio },
];

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: UserProfile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  useEffect(() => { setMenuOpen(false); setAccountOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string }>).detail;
      if (detail?.avatarUrl) setAvatarUrl(detail.avatarUrl);
    };
    window.addEventListener('aptivo:profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('aptivo:profile-updated', handleProfileUpdate);
  }, []);
  const signOut = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    try { localStorage.removeItem('aptivo_user'); } catch {}
    window.location.replace('/auth/login');
  };
  const active = (href: string) => pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
  const rememberAnchorNavigation = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const target = new URL(anchor.href, window.location.origin);
    if (target.origin === window.location.origin && target.pathname !== pathname) rememberInternalNavigation(`${target.pathname}${target.search}`);
  };

  return <div onClickCapture={rememberAnchorNavigation} className="min-h-screen bg-[#F7F6F1] pb-[calc(5.6rem+env(safe-area-inset-bottom))] text-[#18201C] lg:pb-0">
    <header className="safe-top sticky top-0 z-40 border-b border-[#E4E7E2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#18201C] hover:bg-[#E4EEE8] lg:hidden"><Menu className="h-5 w-5"/></button>
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Aptivo Connect home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#174D3A] text-white"><Sparkles className="h-4 w-4"/></span>
          <span className="font-serif font-normal text-[18px] text-[#18201C]">Aptivo <span className="font-sans font-semibold text-[#287A5B]">Connect</span></span>
        </Link>
        <nav aria-label="Main navigation" className="ml-6 hidden h-full items-center gap-1 lg:flex">
          {primary.map(({ name, href }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={clsx('relative inline-flex h-full items-center px-3 text-[13px] font-medium transition-colors', active(href) ? 'text-emerald-900' : 'text-slate-600 hover:text-slate-950')}>
            {name}{active(href) && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#287A5B]"/>}
          </Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/dashboard/campus" aria-label="Search people and opportunities" className="hidden h-10 items-center gap-2 rounded-full bg-slate-100 px-3 text-xs text-slate-500 transition hover:bg-slate-200 md:flex lg:w-48"><Search className="h-4 w-4"/><span className="flex-1">Search Connect</span><kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400">/</kbd></Link>
          <Link href="/dashboard/messages" aria-label="Chats" className={clsx('grid h-10 w-10 place-items-center rounded-full transition-colors', active('/dashboard/messages') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-100')}><MessageCircle className="h-[19px] w-[19px]"/></Link>
          <NotificationDropdown />
          <div className="relative ml-1">
            <button onClick={() => setAccountOpen((open) => !open)} aria-label="Account menu" aria-expanded={accountOpen} className="flex h-10 items-center gap-1.5 rounded-full p-1 transition hover:bg-slate-100"><Avatar src={avatarUrl} name={user.name} size={32}/><ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block"/></button>
            {accountOpen && <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.university || user.email}</p></div>
              <Link href="/dashboard/profile" className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Profile &amp; settings</Link>
              {secondary.map(({ name, href }) => <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{name}</Link>)}
              {user.role === 'admin' && <Link href="/admin" className="block rounded-xl px-3 py-2.5 text-sm text-emerald-800 hover:bg-emerald-50">Admin</Link>}
              <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-700 hover:bg-rose-50"><LogOut className="h-4 w-4"/>Sign out</button>
            </div>}
          </div>
        </div>
      </div>
    </header>

    {menuOpen && <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button className="absolute inset-0 bg-slate-950/35" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}/>
      <aside className="safe-top safe-bottom relative flex h-[100dvh] w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[12px_0_32px_rgba(24,32,28,.16)] animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between border-b border-[#E4E7E2] pb-4"><Link href="/dashboard" className="flex items-center gap-3"><Avatar src={avatarUrl} name={user.name} size={40}/><span className="min-w-0"><b className="block truncate text-sm text-[#18201C]">{user.name}</b><span className="block truncate text-xs text-[#69736D]">{user.field || user.university || 'Aptivo Connect'}</span><span className="block truncate text-[11px] text-[#69736D]">{user.university}</span></span></Link><button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#E4EEE8]"><X className="h-5 w-5"/></button></div>
        <nav className="flex-1 space-y-1 py-4">{primary.map(({ name, href, icon: Icon }) => <Link key={href} href={href} className={clsx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium', active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]')}><Icon className="h-[18px] w-[18px]"/>{name}</Link>)}<div className="my-3 border-t border-[#E4E7E2]"/>{secondary.map(({ name, href, icon: Icon }) => <Link key={href} href={href} className={clsx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium', active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]')}><Icon className="h-[18px] w-[18px]"/>{name}</Link>)}<Link href="/dashboard/profile" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#18201C] hover:bg-[#F7F6F1]"><Users className="h-[18px] w-[18px]"/>Settings &amp; account</Link></nav>
        <button onClick={signOut} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-rose-700 hover:bg-rose-50"><LogOut className="h-[18px] w-[18px]"/>Sign out</button>
      </aside>
    </div>}

    <main className="mx-auto min-h-[calc(100dvh-68px)] w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    <MobileNav />
  </div>;
}
