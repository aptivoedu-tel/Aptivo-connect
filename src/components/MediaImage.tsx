'use client';
import { useState } from 'react';
import Image from 'next/image';
import { BriefcaseBusiness, CalendarDays, Hammer } from 'lucide-react';

type Kind = 'meet' | 'build' | 'experience';
const fallback = { meet: CalendarDays, build: Hammer, experience: BriefcaseBusiness };
export default function MediaImage({ src, alt, kind, className = '' }: { src?: string | null; alt: string; kind: Kind; className?: string }) {
  const [failed, setFailed] = useState(false); const Icon = fallback[kind]; const usable = !!src && (/^https?:\/\//.test(src) || src.startsWith('/'));
  return <div className={`relative overflow-hidden bg-[#E4EEE8] ${className}`}>{usable && !failed ? <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 768px) 85vw, 360px" className="object-cover" onError={() => setFailed(true)} /> : <div className="absolute inset-0 grid place-items-center"><span className="grid h-16 w-16 place-items-center rounded-full border border-[#287A5B]/15 bg-white/55 text-[#174D3A]"><Icon className="h-7 w-7" aria-hidden="true"/></span></div>}<div className="pointer-events-none absolute inset-0 bg-[#174D3A]/[.045]"/></div>;
}
