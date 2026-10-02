'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Ably from 'ably';
import {
  Award, Bell, Building2, ChevronDown, Compass, Hammer, Home,
  LogOut, Menu, MessageCircle, Radio, Search, Settings,
  User, Users, X,
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import MobileNav from '@/components/MobileNav';
import NotificationDropdown from '@/components/NotificationDropdown';
import { rememberInternalNavigation } from '@/components/BackButton';
import { clsx } from 'clsx';

type UserProfile = { id?: string; name: string; email: string; avatarUrl: string; university: string; field: string; role: string };

/* ── DRAWER NAV GROUPS (Requirement 47) ── */
const drawerPrimary = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Meet', href: '/dashboard/meetup', icon: Users },
  { name: 'Build', href: '/dashboard/build', icon: Hammer },
  { name: 'Experience', href: '/dashboard/experience', icon: Building2 },
];
const drawerNetwork = [
  { name: 'Campus', href: '/dashboard/campus', icon: Building2 },
  { name: 'Connections', href: '/dashboard/people', icon: Users },
  { name: 'Showcase', href: '/showcase', icon: Award },
];
const drawerPrograms = [
  { name: 'Ambassador', href: '/dashboard/ambassador', icon: Radio },
];
const drawerAccount = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: UserProfile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [pendingCount, setPendingCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (networkRef.current && !networkRef.current.contains(event.target as Node)) {
        setNetworkOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setNetworkOpen(false);
    setProfileOpen(false);
  }, [pathname]);

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

  const fetchPendingCount = async () => {
    if (!user.email) return;
    try {
      const res = await fetch(`/api/links?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (typeof data.pendingIncomingCount === 'number') {
        setPendingCount(data.pendingIncomingCount);
      } else if (Array.isArray(data.pendingIncoming)) {
        setPendingCount(data.pendingIncoming.length);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPendingCount();
  }, [user.email]);

  // Realtime User Channel Subscription
  useEffect(() => {
    if (!user.id) return;
    let realtime: Ably.Realtime | null = null;
    try {
      realtime = new Ably.Realtime({ authUrl: '/api/realtime/token', authMethod: 'GET' });
      const channel = realtime.channels.get(`user:${user.id}`);

      const handleUserEvent = (message: { name: string; data: any }) => {
        window.dispatchEvent(new CustomEvent('aptivo:realtime-event', { detail: message }));
        if (message.name === 'connection.request.created') {
          setPendingCount((prev) => prev + 1);
        } else if (message.name === 'connection.request.accepted' || message.name === 'connection.request.declined' || message.name === 'connection.request.canceled') {
          setPendingCount((prev) => Math.max(0, prev - 1));
          fetchPendingCount();
        }
      };

      channel.subscribe(handleUserEvent);

      return () => {
        channel.unsubscribe(handleUserEvent);
        realtime?.close();
      };
    } catch (e) {
      console.error('Ably user channel error:', e);
    }
  }, [user.id]);

  const signOut = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    try { localStorage.removeItem('aptivo_user'); } catch {}
    window.location.replace('/auth/login');
  };

  const isHomeActive = pathname === '/dashboard';
  const isMeetActive = pathname?.startsWith('/dashboard/meetup');
  const isBuildActive = pathname?.startsWith('/dashboard/build');
  const isExpActive = pathname?.startsWith('/dashboard/experience');
  const isNetworkActive = pathname?.startsWith('/dashboard/campus') || pathname?.startsWith('/dashboard/people');
  const isShowcaseActive = pathname?.startsWith('/showcase');
  const isChatsActive = pathname?.startsWith('/dashboard/messages');

  const active = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname?.startsWith(href);
  };

  const rememberAnchorNavigation = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    const target = new URL(anchor.href, window.location.origin);
    if (target.origin === window.location.origin && target.pathname !== pathname) rememberInternalNavigation(`${target.pathname}${target.search}`);
  };

  return (
    <div onClickCapture={rememberAnchorNavigation} className="min-h-screen bg-[#F7F6F1] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-[#18201C] lg:pb-0">
      {/* ═══ FLOATING DESKTOP & MOBILE NAVBAR WRAPPER (REQUIREMENTS 1–3, 25-27) ═══ */}
      <header className="sticky top-3.5 lg:top-4 z-40 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none mb-3 lg:mb-5">
        {/* MOBILE FLOATING HEADER (< lg) */}
        <div className="flex lg:hidden items-center justify-between h-[54px] px-4 rounded-[20px] border border-[#E4E7E2] bg-white shadow-[0_4px_18px_rgba(24,32,28,0.05)] pointer-events-auto">
          <button onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#18201C] hover:bg-[#E4EEE8] transition-colors">
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex flex-col leading-none text-center" aria-label="Aptivo Connect home">
            <span className="font-serif font-normal text-[20px] text-[#174D3A] tracking-tight">Aptivo</span>
            <span className="font-sans text-[11px] font-semibold text-[#287A5B] -mt-0.5 tracking-wide">Connect</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/dashboard/campus"
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#69736D] hover:text-[#174D3A] hover:bg-[#E4EEE8] transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/dashboard/messages"
              aria-label="Chats and Messages"
              className={clsx('grid h-9 w-9 place-items-center rounded-xl transition-colors', isChatsActive ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A] hover:bg-[#E4EEE8]')}
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={isChatsActive ? 2.2 : 1.8} />
            </Link>
            <NotificationDropdown />
            <Link href="/profile" className="ml-1 flex items-center shrink-0" aria-label="My Profile">
              <Avatar src={avatarUrl} name={user.name} size={32} />
            </Link>
          </div>
        </div>

        {/* DESKTOP 3-ISLAND FLOATING NAV (lg+) */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center w-full pointer-events-auto">
          {/* LEFT ISLAND — BRAND (REQUIREMENT 5) */}
          <div className="justify-self-start flex items-center h-[52px] px-5 rounded-[18px] border border-[#E4E7E2] bg-white shadow-[0_4px_18px_rgba(24,32,28,0.05)]">
            <Link href="/dashboard" className="flex flex-col leading-none" aria-label="Aptivo Connect home">
              <span className="font-serif font-normal text-[21px] text-[#174D3A] tracking-tight">Aptivo</span>
              <span className="font-sans text-[11px] font-semibold text-[#287A5B] -mt-0.5 tracking-wide">Connect</span>
            </Link>
          </div>

          {/* CENTER ISLAND — PRIMARY NAVIGATION (REQUIREMENTS 6–11, 13–15) */}
          <div className="justify-self-center flex items-center h-[52px] px-6 rounded-[18px] border border-[#E4E7E2] bg-white shadow-[0_4px_18px_rgba(24,32,28,0.05)]">
            <nav aria-label="Main desktop navigation" className="flex items-center gap-5 xl:gap-7 h-full">
              {/* Home */}
              <Link
                href="/dashboard"
                aria-current={isHomeActive ? 'page' : undefined}
                className={clsx('relative inline-flex h-full items-center text-[13.5px] font-medium font-sans transition-colors', isHomeActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]')}
              >
                Home
                {isHomeActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
              </Link>

              {/* Meet */}
              <Link
                href="/dashboard/meetup"
                aria-current={isMeetActive ? 'page' : undefined}
                className={clsx('relative inline-flex h-full items-center text-[13.5px] font-medium font-sans transition-colors', isMeetActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]')}
              >
                Meet
                {isMeetActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
              </Link>

              {/* Build */}
              <Link
                href="/dashboard/build"
                aria-current={isBuildActive ? 'page' : undefined}
                className={clsx('relative inline-flex h-full items-center text-[13.5px] font-medium font-sans transition-colors', isBuildActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]')}
              >
                Build
                {isBuildActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
              </Link>

              {/* Experience */}
              <Link
                href="/dashboard/experience"
                aria-current={isExpActive ? 'page' : undefined}
                className={clsx('relative inline-flex h-full items-center text-[13.5px] font-medium font-sans transition-colors', isExpActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]')}
              >
                Experience
                {isExpActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
              </Link>

              {/* Network ▾ Dropdown (REQUIREMENTS 7-10) */}
              <div
                ref={networkRef}
                className="relative h-full flex items-center"
              >
                <button
                  onClick={() => setNetworkOpen(!networkOpen)}
                  aria-expanded={networkOpen}
                  className={clsx(
                    'relative inline-flex h-full items-center gap-1 text-[13.5px] font-medium font-sans transition-colors focus:outline-none',
                    isNetworkActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]'
                  )}
                >
                  Network
                  <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform duration-200', networkOpen && 'rotate-180')} />
                  {isNetworkActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
                </button>

                {networkOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-[250px] rounded-[16px] border border-[#E4E7E2] bg-white p-2 shadow-[0_8px_24px_rgba(24,32,28,0.08)] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/dashboard/campus"
                      onClick={() => setNetworkOpen(false)}
                      className={clsx(
                        'flex items-start gap-3 p-2.5 rounded-xl transition-colors',
                        pathname?.startsWith('/dashboard/campus') ? 'bg-[#E4EEE8]' : 'hover:bg-[#E4EEE8]'
                      )}
                    >
                      <div className="p-2 rounded-lg bg-white border border-[#E4E7E2] text-[#174D3A] shrink-0 shadow-xs">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#174D3A] font-sans">Campus</p>
                        <p className="text-[11px] text-[#69736D] font-sans leading-tight mt-0.5">Discover people across campuses</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/people"
                      onClick={() => setNetworkOpen(false)}
                      className={clsx(
                        'flex items-start gap-3 p-2.5 rounded-xl transition-colors mt-1',
                        pathname?.startsWith('/dashboard/people') ? 'bg-[#E4EEE8]' : 'hover:bg-[#E4EEE8]'
                      )}
                    >
                      <div className="p-2 rounded-lg bg-white border border-[#E4E7E2] text-[#174D3A] shrink-0 shadow-xs">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-[#174D3A] font-sans">Connections</p>
                          {pendingCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#E05A47] text-white">
                              {pendingCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#69736D] font-sans leading-tight mt-0.5">Your network and requests</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Showcase (REQUIREMENT 11) */}
              <Link
                href="/showcase"
                aria-current={isShowcaseActive ? 'page' : undefined}
                className={clsx('relative inline-flex h-full items-center text-[13.5px] font-medium font-sans transition-colors', isShowcaseActive ? 'text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A]')}
              >
                Showcase
                {isShowcaseActive && <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-[#174D3A]" />}
              </Link>
            </nav>
          </div>

          {/* RIGHT ISLAND — ACTIONS (REQUIREMENTS 16–24) */}
          <div className="justify-self-end flex items-center gap-1.5 h-[52px] px-3 rounded-[18px] border border-[#E4E7E2] bg-white shadow-[0_4px_18px_rgba(24,32,28,0.05)]">
            {/* Search */}
            <Link
              href="/dashboard/campus"
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#69736D] hover:text-[#174D3A] hover:bg-[#E4EEE8] transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>

            {/* Chat */}
            <Link
              href="/dashboard/messages"
              aria-label="Chats and Messages"
              className={clsx('grid h-9 w-9 place-items-center rounded-xl transition-colors', isChatsActive ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#69736D] hover:text-[#174D3A] hover:bg-[#E4EEE8]')}
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={isChatsActive ? 2.2 : 1.8} />
            </Link>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Avatar Dropdown Trigger */}
            <div ref={profileRef} className="relative flex items-center">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="ml-1 flex items-center shrink-0 rounded-full transition-transform hover:scale-105 focus:outline-none"
                aria-label="User profile menu"
                aria-expanded={profileOpen}
              >
                <Avatar src={avatarUrl} name={user.name} size={34} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[240px] rounded-[18px] border border-[#E4E7E2] bg-white p-2 shadow-[0_8px_24px_rgba(24,32,28,0.08)] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2.5 border-b border-[#E4E7E2] mb-1">
                    <p className="text-[13px] font-semibold text-[#18201C] font-sans truncate">{user.name}</p>
                    <p className="text-[11px] text-[#69736D] font-sans truncate mt-0.5">{user.email || user.university || 'Student'}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#18201C] hover:bg-[#E4EEE8] hover:text-[#174D3A] transition-colors font-sans"
                  >
                    <User className="h-4 w-4 text-[#69736D]" />
                    My Profile
                  </Link>

                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#18201C] hover:bg-[#E4EEE8] hover:text-[#174D3A] transition-colors font-sans"
                  >
                    <Bell className="h-4 w-4 text-[#69736D]" />
                    Notifications
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#18201C] hover:bg-[#E4EEE8] hover:text-[#174D3A] transition-colors font-sans"
                  >
                    <Settings className="h-4 w-4 text-[#69736D]" />
                    Settings
                  </Link>

                  <div className="my-1 border-t border-[#E4E7E2]" />

                  <button
                    onClick={() => { setProfileOpen(false); signOut(); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#E05A47] hover:bg-[#FCE9E3] transition-colors font-sans text-left"
                  >
                    <LogOut className="h-4 w-4 text-[#E05A47]" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE DRAWER (REQUIREMENTS 47–48) ═══ */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="absolute inset-0 bg-[#18201C]/35 backdrop-blur-xs" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />

          <aside className="safe-top safe-bottom relative flex h-[100dvh] w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white shadow-[12px_0_32px_rgba(24,32,28,.16)] animate-in slide-in-from-left duration-200">
            {/* User Info Header */}
            <div className="flex items-center gap-3 border-b border-[#E4E7E2] px-5 py-5">
              <Avatar src={avatarUrl} name={user.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-[#18201C] font-sans">{user.name}</p>
                <p className="truncate text-[12px] text-[#69736D] font-sans">{user.field || 'Student'}</p>
                <p className="truncate text-[11px] text-[#69736D] font-sans">{user.university}</p>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl hover:bg-[#F7F6F1]">
                <X className="h-5 w-5 text-[#69736D]" />
              </button>
            </div>

            {/* Categorized Drawer Links */}
            <nav className="flex-1 px-3 py-4 space-y-4">
              {/* PRIMARY */}
              <div>
                <p className="px-3 pb-1 text-[11px] font-bold tracking-wider text-[#69736D] uppercase font-sans">Primary</p>
                <div className="space-y-0.5">
                  {drawerPrimary.map(({ name, href, icon: Icon }) => (
                    <Link key={href} href={href}
                      className={clsx('flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium font-sans transition-colors',
                        active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]'
                      )}
                    >
                      <Icon className={clsx('h-[18px] w-[18px]', active(href) ? 'text-[#174D3A]' : 'text-[#69736D]')} strokeWidth={active(href) ? 2.2 : 1.8} />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* NETWORK & DISCOVERY */}
              <div className="pt-2 border-t border-[#E4E7E2]">
                <p className="px-3 pb-1 text-[11px] font-bold tracking-wider text-[#69736D] uppercase font-sans">Network & Discovery</p>
                <div className="space-y-0.5">
                  {drawerNetwork.map(({ name, href, icon: Icon }) => (
                    <Link key={href} href={href}
                      className={clsx('flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium font-sans transition-colors',
                        active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]'
                      )}
                    >
                      <Icon className={clsx('h-[18px] w-[18px]', active(href) ? 'text-[#174D3A]' : 'text-[#69736D]')} strokeWidth={active(href) ? 2.2 : 1.8} />
                      <span className="flex-1">{name}</span>
                      {name === 'Connections' && pendingCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E05A47] text-white">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* PROGRAMS */}
              <div className="pt-2 border-t border-[#E4E7E2]">
                <p className="px-3 pb-1 text-[11px] font-bold tracking-wider text-[#69736D] uppercase font-sans">Programs</p>
                <div className="space-y-0.5">
                  {drawerPrograms.map(({ name, href, icon: Icon }) => (
                    <Link key={href} href={href}
                      className={clsx('flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium font-sans transition-colors',
                        active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]'
                      )}
                    >
                      <Icon className={clsx('h-[18px] w-[18px]', active(href) ? 'text-[#174D3A]' : 'text-[#69736D]')} strokeWidth={active(href) ? 2.2 : 1.8} />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* ACCOUNT */}
              <div className="pt-2 border-t border-[#E4E7E2]">
                <p className="px-3 pb-1 text-[11px] font-bold tracking-wider text-[#69736D] uppercase font-sans">Account</p>
                <div className="space-y-0.5">
                  {drawerAccount.map(({ name, href, icon: Icon }) => (
                    <Link key={href} href={href}
                      className={clsx('flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium font-sans transition-colors',
                        active(href) ? 'bg-[#E4EEE8] text-[#174D3A]' : 'text-[#18201C] hover:bg-[#F7F6F1]'
                      )}
                    >
                      <Icon className={clsx('h-[18px] w-[18px]', active(href) ? 'text-[#174D3A]' : 'text-[#69736D]')} strokeWidth={active(href) ? 2.2 : 1.8} />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Sign Out */}
            <div className="border-t border-[#E4E7E2] px-3 py-3">
              <button onClick={signOut} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-[#69736D] hover:bg-[#F7F6F1] font-sans transition-colors">
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Page Content */}
      <main className="mx-auto min-h-[calc(100dvh-90px)] w-full max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
