'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, Users, ArrowRight } from 'lucide-react';
import Avatar from '@/components/Avatar';

type Person = {
  _id: string;
  fullName?: string;
  name?: string;
  headline?: string;
  university?: string;
  campus?: string;
  degree?: string;
  fieldOfStudy?: string;
  skills?: string[];
  avatarUrl?: string;
  profilePhoto?: string;
};

type Directory = {
  _id: { university: string; campus: string };
  count: number;
};

export default function CampusPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [selected, setSelected] = useState<Directory | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (directory = selected, query = search) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (directory) {
        params.set('university', directory._id.university);
        params.set('campus', directory._id.campus);
      }
      if (query) params.set('q', query);
      const res = await fetch(`/api/campus?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load Campus.');
      setPeople(data.people || []);
      setDirectories(data.directories || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load Campus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(null, '');
  }, []);

  return (
    <section className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-200 font-sans">
      <header>
        <p className="text-[13px] font-semibold text-[#174D3A]">Campus</p>
        <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
          Find your people.
        </h1>
        <p className="mt-1.5 text-[14px] text-[#69736D]">
          Students, skills and ideas from your university community.
        </p>
      </header>

      {/* Campus Directory Pills */}
      {directories.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelected(null);
              load(null, search);
            }}
            className={`min-w-[120px] shrink-0 rounded-[14px] px-4 py-2.5 text-left text-[13px] font-semibold transition border ${
              !selected
                ? 'bg-[#174D3A] text-white border-[#174D3A]'
                : 'bg-white text-[#69736D] border-[#E4E7E2] hover:bg-[#F7F6F1]'
            }`}
          >
            All Campuses
          </button>
          {directories.map((directory) => {
            const isSelected =
              selected?._id.university === directory._id.university &&
              selected?._id.campus === directory._id.campus;
            return (
              <button
                key={`${directory._id.university}-${directory._id.campus}`}
                onClick={() => {
                  setSelected(directory);
                  load(directory, search);
                }}
                className={`min-w-[180px] shrink-0 rounded-[14px] px-4 py-2.5 text-left text-[13px] transition border ${
                  isSelected
                    ? 'bg-[#174D3A] text-white border-[#174D3A]'
                    : 'bg-white text-[#18201C] border-[#E4E7E2] hover:bg-[#F7F6F1]'
                }`}
              >
                <b className="block font-semibold truncate">{directory._id.university}</b>
                <span className={isSelected ? 'text-white/80 text-[11px]' : 'text-[#69736D] text-[11px]'}>
                  {directory._id.campus} · {directory.count} builders
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="flex gap-2">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 border border-[#E4E7E2] focus-within:ring-2 focus-within:ring-[#174D3A]/20">
          <Search className="h-4 w-4 text-[#69736D] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="w-full bg-transparent text-[13px] text-[#18201C] outline-none placeholder:text-[#69736D]"
            placeholder="Search people, universities, or skills..."
          />
        </label>
        <button
          onClick={() => load()}
          className="min-h-11 rounded-full bg-[#174D3A] px-6 text-[13px] font-semibold text-white hover:bg-[#287A5B] transition-colors"
        >
          Search
        </button>
      </div>

      {error ? (
        <div className="rounded-[16px] bg-rose-50 border border-rose-200 p-4 text-[13px] text-rose-700">
          {error} <button onClick={() => load()} className="font-semibold underline ml-1">Retry</button>
        </div>
      ) : loading ? (
        <p className="py-12 text-center text-[14px] text-[#69736D]">Loading Campus directory...</p>
      ) : people.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <article
              key={person._id}
              className="flex items-start gap-3.5 rounded-[16px] border border-[#E4E7E2] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <Avatar
                src={person.profilePhoto || person.avatarUrl}
                name={person.fullName || person.name}
                size={52}
                className="ring-2 ring-white shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="truncate font-semibold text-[15px] text-[#18201C]">
                  {person.fullName || person.name}
                </h3>
                <p className="truncate text-[12px] text-[#69736D]">
                  {person.headline || person.degree || person.fieldOfStudy || 'Aptivo member'}
                </p>
                <p className="truncate text-[11px] text-[#69736D]">
                  {[person.university, person.campus].filter(Boolean).join(' · ')}
                </p>
                {person.skills && person.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {person.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#E4EEE8] px-2.5 py-0.5 text-[11px] font-medium text-[#174D3A]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    href={`/profile/${person._id}`}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#174D3A] hover:text-[#287A5B]"
                  >
                    <span>View profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[16px] bg-white border border-dashed border-[#E4E7E2] p-8 text-center space-y-2">
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">
            We’re still building this campus community
          </h3>
          <p className="text-[13px] text-[#69736D]">
            Try another campus or make your profile discoverable when you’re ready.
          </p>
        </div>
      )}
    </section>
  );
}
