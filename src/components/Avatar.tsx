'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserRound } from 'lucide-react';

export function initials(name = '') { const words = name.trim().split(/\s+/).filter(Boolean); return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase() || ''; }
export default function Avatar({ src, name, className = '', size = 40 }: { src?: string | null; name?: string; className?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const valid = !!src && (/^https?:\/\//.test(src) || src.startsWith('/'));
  if (!valid || failed) return <div aria-label={name ? `${name} avatar` : 'Avatar'} className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 ${className}`} style={{ width: size, height: size }}>{initials(name) || <UserRound className="h-1/2 w-1/2"/>}</div>;
  return <div className={`relative shrink-0 overflow-hidden rounded-full bg-slate-100 ${className}`} style={{ width: size, height: size }}><Image src={src} alt={name ? `${name} avatar` : 'Avatar'} fill unoptimized sizes={`${size}px`} className="object-cover" onError={() => setFailed(true)} /></div>;
}
