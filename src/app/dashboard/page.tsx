'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Avatar from '@/components/Avatar';
import MediaImage from '@/components/MediaImage';

type Meetup = {
  _id: string;
  title: string;
  date?: string;
  startTime?: string;
  venueCity?: string;
  venueName?: string;
  coverImage?: string;
  registrations?: unknown[];
  capacity?: number;
  category?: string;
};
type Project = {
  _id: string;
  title: string;
  field?: string;
  building?: string;
  problem?: string;
  requiredSkills?: string[];
  members?: unknown[];
  teamSize?: number;
  coverImage?: string;
};
type Experience = {
  _id: string;
  title: string;
  company?: string;
  category?: string;
  date?: string;
  location?: string;
  image?: string;
  posterUrl?: string;
  capacity?: number;
  enrolledStudents?: unknown[];
};
type Person = {
  _id: string;
  fullName?: string;
  name?: string;
  headline?: string;
  university?: string;
  campus?: string;
  skills?: string[];
  avatarUrl?: string;
  profilePhoto?: string;
};
type Featured = {
  kind: 'meet' | 'build' | 'experience';
  title: string;
  image?: string;
  label: string;
  description?: string;
  meta: string;
  href: string;
};

function SectionHeading({ title, href, label = 'See All' }: { title: string; href: string; label?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-serif font-normal text-[20px] sm:text-[22px] lg:text-[25px] leading-snug text-[#18201C]">
        {title}
      </h2>
      <Link href={href} className="text-[13px] font-semibold text-[#174D3A] hover:text-[#287A5B] font-sans">
        {label}
      </Link>
    </div>
  );
}

function DateBox({ dateStr }: { dateStr?: string }) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[12px] bg-[#E4EEE8] text-center">
      <span className="text-[10px] font-semibold text-[#174D3A] leading-tight font-sans">{month}</span>
      <span className="text-[20px] font-serif font-normal text-[#18201C] leading-tight">{day}</span>
    </div>
  );
}

export default function DashboardOverview() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  const load = async () => {
    setError('');
    try {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        setUserName(stored.fullName?.split(' ')[0] || stored.name?.split(' ')[0] || '');
      } catch {}
      const responses = await Promise.all([
        fetch('/api/meetups'),
        fetch('/api/build'),
        fetch('/api/experience'),
        fetch('/api/people?limit=6'),
      ]);
      const data = await Promise.all(responses.map((r) => r.json()));
      if (responses.some((r) => !r.ok)) throw new Error('Could not load opportunities.');
      setMeetups(data[0].meetups || []);
      setProjects(data[1].projects || []);
      setExperiences(data[2].experiences || []);
      setPeople(data[3].users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load opportunities.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const featured = useMemo<Featured | null>(() => {
    if (projects[0]) {
      const p = projects[0];
      return {
        kind: 'build',
        title: p.title,
        image: p.coverImage,
        label: 'Featured Project',
        description: p.building || p.problem,
        meta: `Build · ${p.members?.length || 0} members${p.teamSize && (p.members?.length || 0) < p.teamSize ? ' · Recruiting' : ''}`,
        href: `/dashboard/build/${p._id}`,
      };
    }
    if (meetups[0]) {
      const m = meetups[0];
      return {
        kind: 'meet',
        title: m.title,
        image: m.coverImage,
        label: 'Featured Meetup',
        meta: [m.category, m.venueCity || m.venueName].filter(Boolean).join(' · '),
        href: '/dashboard/meetup',
      };
    }
    if (experiences[0]) {
      const x = experiences[0];
      return {
        kind: 'experience',
        title: x.title,
        image: x.posterUrl || x.image,
        label: 'Featured Experience',
        meta: [x.company || x.category, x.location].filter(Boolean).join(' · '),
        href: '/dashboard/experience',
      };
    }
    return null;
  }, [meetups, projects, experiences]);

  return (
    <div className="mx-auto max-w-6xl xl:max-w-7xl space-y-8 pb-8 font-sans animate-in fade-in duration-200">
      {/* ─── GREETING ─── */}
      <header className="space-y-1.5">
        <h1 className="font-serif font-normal text-[32px] sm:text-[38px] lg:text-[44px] xl:text-[48px] leading-tight text-[#18201C]">
          Hi, {userName || 'there'} 👋
        </h1>
        <p className="text-[15px] sm:text-[16px] lg:text-[18px] text-[#69736D]">
          Discover people, projects and experiences to grow your journey.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-[14px] bg-[#FCE9E3] px-4 py-3 text-[13px] text-[#A94431]">
          {error}
          <button onClick={load} className="font-semibold underline">Try again</button>
        </div>
      )}

      {/* ─── FEATURED HERO CARD (Desktop Substantial Anchor) ─── */}
      {loading ? (
        <div className="h-64 sm:h-72 lg:h-[400px] xl:h-[440px] animate-pulse rounded-[24px] bg-[#E4EEE8]" />
      ) : featured ? (
        <Link href={featured.href} className="group relative block overflow-hidden rounded-[24px] shadow-sm">
          <MediaImage src={featured.image} alt={featured.title} kind={featured.kind} className="h-64 sm:h-72 lg:h-[400px] xl:h-[440px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18201C]/85 via-[#18201C]/30 to-transparent" />
          <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-[#174D3A] px-4 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-white" /> {featured.label}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
            <h2 className="font-serif font-normal text-[26px] sm:text-[32px] lg:text-[38px] xl:text-[42px] leading-tight text-white max-w-4xl">
              {featured.title}
            </h2>
            {featured.description && (
              <p className="mt-2 text-[14px] lg:text-[16px] text-white/90 line-clamp-2 max-w-3xl font-sans leading-relaxed">
                {featured.description}
              </p>
            )}
            <p className="mt-2.5 text-[13px] lg:text-[14px] text-white/80 font-sans font-medium">{featured.meta}</p>
          </div>
          <div className="absolute bottom-8 right-8 grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur-sm text-white transition group-hover:bg-white/30">
            <ChevronRight className="h-6 w-6" />
          </div>
        </Link>
      ) : (
        <section className="rounded-[24px] bg-[#E4EEE8]/60 px-6 py-12 text-center border border-[#E4E7E2]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#174D3A] shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-serif font-normal text-[24px] leading-tight text-[#18201C] mt-4">Your next opportunity is on its way</h2>
          <p className="mt-2 text-[14px] text-[#69736D]">Explore Campus or check back soon.</p>
          <Link href="/dashboard/campus" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#174D3A] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#287A5B]">
            Explore Campus <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* ─── DESKTOP 2-COLUMN GRID (Main vs Supporting) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 gap-8">
        {/* LEFT / MAIN COLUMN (Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* UPCOMING MEETUPS */}
          {!loading && meetups.length > 0 && (
            <section>
              <SectionHeading title="Upcoming Meetups" href="/dashboard/meetup" />
              <div className="space-y-3">
                {meetups.slice(0, 3).map((item) => (
                  <Link
                    key={item._id}
                    href="/dashboard/meetup"
                    className="group flex items-center gap-4 rounded-[16px] bg-white p-4 transition hover:bg-[#F7F6F1] border border-[#E4E7E2] shadow-sm"
                  >
                    <DateBox dateStr={item.date} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-[#18201C]">{item.title}</p>
                      <p className="truncate text-[12px] text-[#69736D] mt-1">
                        {[item.venueName || item.venueCity, item.startTime].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E4E7E2] text-[#69736D] group-hover:bg-[#E4EEE8] group-hover:text-[#174D3A] transition">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ACTIVE BUILD PROJECTS */}
          {!loading && projects.length > 0 && (
            <section>
              <SectionHeading title="Active Projects to Join" href="/dashboard/build" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.slice(0, 2).map((item) => (
                  <Link
                    key={item._id}
                    href={`/dashboard/build/${item._id}`}
                    className="group flex flex-col justify-between rounded-[16px] bg-white p-5 border border-[#E4E7E2] shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-2">
                      <span className="rounded-full bg-[#E4EEE8] px-2.5 py-0.5 text-[11px] font-medium text-[#174D3A]">
                        {item.field || 'Build'}
                      </span>
                      <h3 className="font-semibold text-[15px] text-[#18201C] group-hover:text-[#174D3A] transition">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-[#69736D] line-clamp-2">
                        {item.building || item.problem}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E4E7E2] flex items-center justify-between text-[12px] font-medium text-[#174D3A]">
                      <span>{item.members?.length || 1} team members</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT / SUPPORTING COLUMN (Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          {/* OPPORTUNITIES FOR YOU */}
          {!loading && experiences.length > 0 && (
            <section>
              <SectionHeading title="Opportunities for You" href="/dashboard/experience" />
              <div className="space-y-3">
                {experiences.slice(0, 3).map((item) => (
                  <Link
                    key={item._id}
                    href="/dashboard/experience"
                    className="group flex items-center gap-3.5 rounded-[16px] bg-white p-3.5 transition hover:bg-[#F7F6F1] border border-[#E4E7E2] shadow-sm"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px]">
                      <MediaImage src={item.posterUrl || item.image} alt={item.title} kind="experience" className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-[#18201C]">{item.title}</p>
                      <p className="truncate text-[12px] text-[#69736D] mt-0.5">
                        {[item.company || item.category, item.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#E4E7E2] text-[#69736D] group-hover:bg-[#E4EEE8] group-hover:text-[#174D3A] transition">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PEOPLE FROM YOUR CAMPUS */}
          {!loading && people.length > 0 && (
            <section>
              <SectionHeading title="People from Your Campus" href="/dashboard/campus" />
              {/* Mobile: Horizontal scroller */}
              <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
                {people.map((person) => (
                  <Link
                    key={person._id}
                    href={`/profile/${person._id}`}
                    className="flex min-w-[220px] items-center gap-3 rounded-[16px] bg-white p-3 border border-[#E4E7E2]"
                  >
                    <Avatar src={person.profilePhoto || person.avatarUrl} name={person.fullName || person.name} size={44} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#18201C]">{person.fullName || person.name}</p>
                      <p className="truncate text-[11px] text-[#69736D]">{person.headline || person.university || person.campus}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: 2-Column Responsive Grid (NO horizontal scrollbar) */}
              <div className="hidden lg:grid lg:grid-cols-1 lg:gap-3">
                {people.slice(0, 4).map((person) => (
                  <Link
                    key={person._id}
                    href={`/profile/${person._id}`}
                    className="flex items-center gap-3.5 rounded-[16px] bg-white p-3.5 border border-[#E4E7E2] transition hover:border-[#174D3A]/30 shadow-sm"
                  >
                    <Avatar src={person.profilePhoto || person.avatarUrl} name={person.fullName || person.name} size={44} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-[#18201C]">{person.fullName || person.name}</p>
                      <p className="truncate text-[12px] text-[#69736D]">{person.headline || person.university || person.campus}</p>
                      {person.skills && person.skills.length > 0 && (
                        <p className="mt-0.5 truncate text-[11px] font-medium text-[#174D3A]">{person.skills.slice(0, 3).join(' · ')}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
