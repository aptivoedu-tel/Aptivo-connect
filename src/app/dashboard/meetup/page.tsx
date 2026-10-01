'use client';

import { useEffect, useState } from 'react';
import MediaImage from '@/components/MediaImage';
import { Calendar, Clock, Globe2, MapPin, Users, CheckCircle2, Video, Search, X } from 'lucide-react';

type Meetup = {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  coverImage?: string;
  speakerName: string;
  speakerRole?: string;
  speakerOrganization?: string;
  format: 'online' | 'in-person' | 'hybrid';
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venueName?: string;
  venueCity?: string;
  platform?: string;
  capacity: number;
  registrations: unknown[];
  status: string;
};

export default function MeetupPage() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [selected, setSelected] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = () =>
    fetch('/api/meetups')
      .then((r) => r.json())
      .then((d) => setMeetups(d.meetups || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function register() {
    if (!selected) return;
    const user = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
    if (!user.email) return setResult('Please sign in to register.');
    const res = await fetch('/api/meetups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetupId: selected._id, studentEmail: user.email }),
    });
    const data = await res.json();
    setResult(data.success ? "You're registered ✓" : data.error || 'Unable to register.');
    if (data.success) load();
  }

  const visibleMeetups = meetups.filter((m) =>
    [m.title, m.category, m.venueName, m.venueCity, m.speakerName].some((val) =>
      val?.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-200 font-sans">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#174D3A]">Meet</p>
          <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
            Meet people worth meeting.
          </h1>
          <p className="mt-1.5 text-[14px] text-[#69736D]">
            Talks, workshops and conversations curated for students.
          </p>
        </div>
        <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-full bg-white px-4 text-[#69736D] border border-[#E4E7E2] focus-within:ring-2 focus-within:ring-[#174D3A]/20">
          <Search className="h-4 w-4 shrink-0 text-[#69736D]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetups..."
            className="w-full bg-transparent text-[13px] text-[#18201C] outline-none placeholder:text-[#69736D]"
          />
        </label>
      </section>

      {loading ? (
        <p className="py-12 text-center text-[14px] text-[#69736D]">Loading meetups...</p>
      ) : visibleMeetups.length === 0 ? (
        <div className="rounded-[16px] bg-white border border-[#E4E7E2] px-6 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-[#69736D]" />
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">
            {query ? 'No meetups match your search.' : 'No upcoming meetups yet.'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMeetups.map((m) => (
            <article
              key={m._id}
              className="group overflow-hidden rounded-[16px] border border-[#E4E7E2] bg-white transition hover:-translate-y-0.5 shadow-sm"
            >
              <div className="relative">
                <MediaImage src={m.coverImage} alt={m.title} kind="meet" className="h-44" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-[#174D3A] backdrop-blur-sm">
                  {m.category}
                </span>
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-semibold text-[15px] leading-snug text-[#18201C]">{m.title}</h3>
                <div className="space-y-1.5 text-[13px] text-[#69736D]">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#174D3A]" />
                    {m.date}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#174D3A]" />
                    {m.startTime} · {m.format === 'online' ? m.platform || 'Online' : m.venueCity || m.venueName || 'In-person'}
                  </p>
                  <p className="flex items-center gap-2 font-medium text-[#18201C]">
                    <Users className="h-4 w-4 text-[#174D3A]" />
                    {m.registrations.length} attending{m.capacity ? ` · ${m.capacity} places` : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelected(m);
                    setResult(null);
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-full bg-[#174D3A] text-[13px] font-semibold text-white transition hover:bg-[#287A5B]"
                >
                  View meetup
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
            {result?.includes('✓') ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#174D3A]" />
                <h3 className="font-serif font-normal text-[26px] text-[#18201C] mt-3">{result}</h3>
                <p className="mt-1 text-[13px] text-[#69736D]">
                  {selected.title}
                  <br />
                  {selected.date} · {selected.startTime}
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-6 rounded-full bg-[#174D3A] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#287A5B]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E4E7E2] pb-3 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#174D3A]">
                    {selected.category}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-[#69736D] hover:text-[#18201C]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="font-serif font-normal text-[24px] sm:text-[28px] leading-tight text-[#18201C]">
                  {selected.title}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#69736D]">{selected.description}</p>
                <div className="mt-5 rounded-[14px] bg-[#F7F6F1] p-4 text-[13px] text-[#69736D]">
                  <p className="font-semibold text-[#18201C]">{selected.speakerName}</p>
                  <p>
                    {selected.speakerRole}
                    {selected.speakerOrganization ? ` · ${selected.speakerOrganization}` : ''}
                  </p>
                  <p className="mt-3 flex items-center gap-2">
                    <Video className="h-3.5 w-3.5 text-[#174D3A]" />
                    {selected.format === 'online' ? selected.platform || 'Online' : selected.venueName || selected.venueCity}
                  </p>
                  <p className="mt-1">
                    {selected.date} · {selected.startTime} – {selected.endTime} · {selected.timezone}
                  </p>
                </div>
                {result && <p className="mt-3 text-[13px] font-semibold text-rose-600">{result}</p>}
                <button
                  onClick={register}
                  className="mt-5 w-full rounded-full bg-[#174D3A] py-3 text-[13px] font-semibold text-white transition hover:bg-[#287A5B]"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
