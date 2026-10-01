'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MediaImage from '@/components/MediaImage';
import {
  Sparkles,
  Award,
  ExternalLink,
  Github,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';

interface IMember {
  name: string;
  role: string;
  avatarUrl?: string;
  university?: string;
}

interface IProject {
  _id: string;
  title: string;
  field: string;
  problem: string;
  building: string;
  description: string;
  requiredSkills: string[];
  members: IMember[];
  isAptivoVerified: boolean;
  coverImage?: string;
  showcase?: {
    demoUrl?: string;
    githubUrl?: string;
    outcomes?: string;
    publishedAt?: string;
  };
}

export default function ShowcasePage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/build?status=Showcase')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) {
          setProjects(data.projects);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Software & Maps', 'AI & Healthcare', 'Fintech & Software', 'Robotics & Hardware'];

  const filtered = projects.filter((p) => {
    const matchesField = selectedField === 'All' || p.field.toLowerCase().includes(selectedField.toLowerCase());
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesField && matchesSearch;
  });

  return (
    <div className="w-full bg-[#F7F6F1] font-sans animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="border-b border-[#E4E7E2] bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-3 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E4EEE8] text-[#174D3A] text-[12px] font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Built Through Aptivo Connect</span>
          </div>
          <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C]">
            Built by Connect teams
          </h1>
          <p className="max-w-2xl text-[14px] leading-relaxed text-[#69736D]">
            A look at the work students have brought to life together.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedField(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                  selectedField === cat
                    ? 'bg-[#174D3A] text-white shadow-sm'
                    : 'bg-white border border-[#E4E7E2] text-[#69736D] hover:bg-[#F7F6F1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search showcase..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E4E7E2] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
            />
          </div>
        </div>

        {/* Showcase Grid */}
        {loading ? (
          <div className="py-12 text-center text-[#69736D] text-[14px]">Loading showcase projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 bg-white rounded-[16px] border border-dashed border-[#E4E7E2] text-center space-y-2">
            <Award className="w-8 h-8 text-[#69736D] mx-auto" />
            <h3 className="font-serif font-normal text-[18px] text-[#18201C]">No Showcase Projects Found</h3>
            <p className="text-[13px] text-[#69736D]">
              Try changing filters or explore active projects inside the BUILD directory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((proj) => (
              <div
                key={proj._id}
                className="bg-white rounded-[16px] p-5 border border-[#E4E7E2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="relative w-full h-44 rounded-[12px] overflow-hidden mb-3">
                    <MediaImage src={proj.coverImage} alt={proj.title} kind="build" className="h-full w-full group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#287A5B]" />
                      Verified Outcome
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#174D3A] uppercase tracking-wide">
                      {proj.field}
                    </span>
                    <h3 className="font-semibold text-[#18201C] text-[16px] mt-1 leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-[13px] text-[#69736D] mt-1.5 line-clamp-2">
                      {proj.building || proj.description}
                    </p>
                  </div>

                  {proj.showcase?.outcomes && (
                    <div className="p-3 bg-[#E4EEE8] rounded-[12px] text-[12px] text-[#174D3A]">
                      <p className="font-semibold text-[11px] uppercase">Impact Outcome:</p>
                      <p className="mt-0.5">{proj.showcase.outcomes}</p>
                    </div>
                  )}

                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] uppercase font-semibold text-[#69736D]">
                      Verified Team:
                    </p>
                    <div className="flex items-center gap-1.5">
                      {proj.members && proj.members.length > 0 ? (
                        proj.members.map((m, idx) => (
                          <div
                            key={idx}
                            title={`${m.name} (${m.role})`}
                            className="w-7 h-7 rounded-full bg-[#174D3A] text-white font-semibold text-[11px] flex items-center justify-center border-2 border-white shadow-xs"
                          >
                            {m.name.charAt(0)}
                          </div>
                        ))
                      ) : (
                        <span className="text-[12px] text-[#69736D]">Student Team</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E4E7E2] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[12px] text-[#69736D]">
                    {proj.showcase?.githubUrl && (
                      <a
                        href={proj.showcase.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#18201C] flex items-center gap-1 font-medium"
                      >
                        <Github className="w-3.5 h-3.5" /> Code
                      </a>
                    )}
                    {proj.showcase?.demoUrl && (
                      <a
                        href={proj.showcase.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#174D3A] hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/showcase/${proj._id}`}
                    className="px-4 py-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[12px] font-semibold transition-colors"
                  >
                    View Project &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
