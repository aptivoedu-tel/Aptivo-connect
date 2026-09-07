import React from 'react';
import { clsx } from 'clsx';

interface StatusPillProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusPill({ status, className, size = 'md' }: StatusPillProps) {
  const getStyle = (st: string) => {
    const s = st.toLowerCase();
    if (s.includes('scheduled') || s.includes('active') || s.includes('confirmed') || s.includes('accepted')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (s.includes('finding') || s.includes('review') || s.includes('applied') || s.includes('pending')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
    if (s.includes('completed') || s.includes('showcase')) {
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    }
    if (s.includes('submitted')) {
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    }
    if (s.includes('declined') || s.includes('cancelled')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs',
        getStyle(status),
        className
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          status.toLowerCase().includes('scheduled') || status.toLowerCase().includes('active')
            ? 'bg-emerald-500 animate-pulse'
            : 'bg-current opacity-70'
        )}
      />
      {status}
    </span>
  );
}
