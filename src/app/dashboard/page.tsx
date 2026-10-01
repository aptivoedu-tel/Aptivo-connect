'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Search, Sparkles } from 'lucide-react';
import Avatar from '@/components/Avatar';
import DiscoveryCard from '@/components/DiscoveryCard';
import MediaImage from '@/components/MediaImage';

type Meetup = { _id: string; title: string; date?: string; startTime?: string; venueCity?: string; venueName?: string; coverImage?: string; registrations?: unknown[]; capacity?: number; category?: string };
type Project = { _id: string; title: string; field?: string; building?: string; problem?: string; requiredSkills?: string[]; members?: unknown[]; teamSize?: number; coverImage?: string };
type Experience = { _id: string; title: string; company?: string; category?: string; date?: string; location?: string; image?: string; posterUrl?: string; capacity?: number; enrolledStudents?: unknown[] };
type Person = { _id: string; fullName?: string; name?: string; headline?: string; university?: string; campus?: string; skills?: string[]; avatarUrl?: string; profilePhoto?: string };
type Featured = { kind: 'meet' | 'build' | 'experience'; title: string; image?: string; label: string; description?: string; date?: string; place?: string; href: string };

function SectionHeading({ title, href, label = 'See all' }: { title: string; href: string; label?: string }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="aptivo-display text-2xl font-semibold text-[#18201C]">{title}</h2><Link href={href} className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-[#174D3A] hover:text-[#287A5B]">{label}<ArrowRight className="h-4 w-4"/></Link></div>;
}

export default function DashboardOverview() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setError('');
    try {
      const responses = await Promise.all([fetch('/api/meetups'), fetch('/api/build'), fetch('/api/experience'), fetch('/api/people?limit=5')]);
      const data = await Promise.all(responses.map((response) => response.json()));
      if (responses.some((response) => !response.ok)) throw new Error('Your opportunities could not be loaded.');
      setMeetups(data[0].meetups || []); setProjects(data[1].projects || []); setExperiences(data[2].experiences || []); setPeople(data[3].users || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Your opportunities could not be loaded.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const featured = useMemo<Featured | null>(() => {
    if (meetups[0]) { const item = meetups[0]; return { kind: 'meet', title: item.title, image: item.coverImage, label: item.category || 'Meetup', date: [item.date, item.startTime].filter(Boolean).join(' · '), place: item.venueCity || item.venueName, href: '/dashboard/meetup' }; }
    if (projects[0]) { const item = projects[0]; return { kind: 'build', title: item.title, image: item.coverImage, label: item.field || 'Open project', description: item.building || item.problem, place: `${item.members?.length || 0}${item.teamSize ? ` of ${item.teamSize}` : ''} collaborators`, href: '/dashboard/build' }; }
    if (experiences[0]) { const item = experiences[0]; return { kind: 'experience', title: item.title, image: item.posterUrl || item.image, label: item.category || 'Experience', date: item.date, place: item.location || item.company, href: '/dashboard/experience' }; }
    return null;
  }, [meetups, projects, experiences]);

  return <div className="mx-auto max-w-7xl space-y-10 pb-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[#69736D]">Aptivo Connect</p><h1 className="aptivo-display mt-1 text-4xl font-semibold text-[#18201C] sm:text-5xl">Discover what&apos;s next.</h1></div><Link href="/dashboard/campus" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#174D3A] hover:bg-[#E4EEE8] md:hidden"><Search className="h-4 w-4"/>Find people</Link></header>
    {error && <div role="alert" className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}<button onClick={load} className="font-semibold underline">Try again</button></div>}
    {loading ? <div className="h-64 animate-pulse rounded-3xl bg-[#E4EEE8]"/> : featured ? <section aria-label="Featured opportunity" className="grid overflow-hidden rounded-[26px] border border-[#E4E7E2] bg-white md:min-h-[300px] md:grid-cols-[1.1fr_0.9fr]">
      <div className="relative min-h-56 md:order-2"><MediaImage src={featured.image} alt={featured.title} kind={featured.kind} className="absolute inset-0 h-full w-full"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent"/></div>
      <div className="flex flex-col justify-center p-6 sm:p-9 md:order-1 md:p-11"><p className="flex items-center gap-2 text-xs font-semibold text-[#287A5B]"><span className="h-1.5 w-1.5 rounded-full bg-[#287A5B]"/>Featured <span className="text-[#E4E7E2]">·</span> {featured.label}</p><h2 className="aptivo-display mt-3 max-w-xl text-3xl font-semibold leading-tight text-[#18201C] sm:text-4xl">{featured.title}</h2>{featured.description && <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-[#69736D]">{featured.description}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#69736D]">{featured.date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5"/>{featured.date}</span>}{featured.place && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/>{featured.place}</span>}</div><Link href={featured.href} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#174D3A] px-5 text-sm font-semibold text-white transition hover:bg-[#287A5B] active:scale-[0.98]">Explore opportunity<ArrowRight className="h-4 w-4"/></Link></div>
    </section> : <section className="rounded-3xl bg-emerald-50/70 px-6 py-10 text-center sm:py-14"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-800"><Sparkles className="h-5 w-5"/></div><h2 className="mt-4 text-lg font-semibold text-slate-900">Your next opportunity is on its way</h2><p className="mt-2 text-sm text-slate-600">Explore Campus or check back soon for new meetups, projects and experiences.</p><Link href="/dashboard/campus" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-semibold text-white">Explore Campus<ArrowRight className="h-4 w-4"/></Link></section>}

    {!loading && meetups.length > 0 && <section><SectionHeading title="Happening soon" href="/dashboard/meetup"/><div className="flex gap-4 overflow-x-auto pb-2">{meetups.slice(0, 4).map((item) => <DiscoveryCard key={item._id} kind="meet" href="/dashboard/meetup" title={item.title} image={item.coverImage} label={item.category} date={[item.date, item.startTime].filter(Boolean).join(' · ')} place={item.venueCity || item.venueName} people={item.capacity ? `${item.registrations?.length || 0} going` : undefined}/>)}</div></section>}
    {!loading && projects.length > 0 && <section><SectionHeading title="Build something real" href="/dashboard/build"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.slice(0, 3).map((item) => <DiscoveryCard key={item._id} kind="build" href="/dashboard/build" title={item.title} image={item.coverImage} label={item.field} place={item.building || item.problem} people={item.teamSize ? `${item.members?.length || 0} of ${item.teamSize} people` : undefined} chips={item.requiredSkills || []}/>)}</div></section>}
    {!loading && experiences.length > 0 && <section><SectionHeading title="Step into the work" href="/dashboard/experience"/><div className="grid gap-3 md:grid-cols-2">{experiences.slice(0, 4).map((item) => <DiscoveryCard key={item._id} kind="experience" href="/dashboard/experience" title={item.title} image={item.posterUrl || item.image} label={item.company || item.category} date={item.date} place={item.location} people={item.capacity ? `${Math.max(0, item.capacity - (item.enrolledStudents?.length || 0))} seats left` : undefined}/>)}</div></section>}
    {!loading && people.length > 0 && <section><SectionHeading title="People from your campus" href="/dashboard/campus"/><div className="flex gap-3 overflow-x-auto pb-2">{people.map((person) => <Link key={person._id} href={`/profile/${person._id}`} className="flex min-w-60 items-center gap-3 rounded-2xl bg-white p-3 transition hover:bg-emerald-50/60"><Avatar src={person.profilePhoto || person.avatarUrl} name={person.fullName || person.name} size={48}/><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{person.fullName || person.name}</p><p className="truncate text-xs text-slate-500">{person.headline || person.university || person.campus}</p><p className="mt-1 truncate text-[11px] text-emerald-800">{(person.skills || []).slice(0, 2).join(' · ')}</p></div></Link>)}</div></section>}
  </div>;
}
