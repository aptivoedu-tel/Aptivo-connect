'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const NAVIGATION_KEY = 'aptivo:last-internal-navigation';
const MAX_AGE_MS = 15 * 60 * 1000;

type NavigationRecord = { to: string; at: number };

export function rememberInternalNavigation(to: string) {
  try {
    sessionStorage.setItem(NAVIGATION_KEY, JSON.stringify({ to, at: Date.now() } satisfies NavigationRecord));
  } catch {}
}

function hasMeaningfulInternalHistory(pathname: string) {
  try {
    const raw = sessionStorage.getItem(NAVIGATION_KEY);
    if (!raw) return false;
    const record = JSON.parse(raw) as NavigationRecord;
    return record.to === pathname && Date.now() - record.at < MAX_AGE_MS && window.history.length > 1;
  } catch { return false; }
}

export function useHistoryBack(fallback: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.size ? `${pathname}?${searchParams.toString()}` : pathname;
  return () => {
    if (hasMeaningfulInternalHistory(currentUrl)) router.back();
    else router.replace(fallback);
  };
}

export default function BackButton({ fallback, children = 'Back', className = '' }: { fallback: string; children?: React.ReactNode; className?: string }) {
  const goBack = useHistoryBack(fallback);
  return <button type="button" onClick={goBack} className={`inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950 ${className}`} aria-label={typeof children === 'string' ? children : 'Go back'}><ArrowLeft className="h-4 w-4"/>{children}</button>;
}
