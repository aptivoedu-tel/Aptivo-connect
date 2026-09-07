'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-12 pb-16 bg-gradient-to-b from-emerald-50/60 to-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-200">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>Built Through Aptivo Connect</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Verified Student Project Showcase
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Real products, research pipelines, and systems built by collaborative student teams with verified Aptivo badges.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 w-full">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedField(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedField === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search showcase..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Showcase Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading showcase projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Showcase Projects Found</h3>
            <p className="text-xs text-slate-500">
              Try changing filters or explore active projects inside the BUILD directory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((proj) => (
              <div
                key={proj._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src={
                        proj.coverImage ||
                        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={proj.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Verified Outcome
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {proj.field}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-1 leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {proj.building || proj.description}
                    </p>
                  </div>

                  {/* Outcomes highlight */}
                  {proj.showcase?.outcomes && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                      <p className="font-bold text-[10px] uppercase text-emerald-800">Impact Outcome:</p>
                      <p className="text-emerald-950 mt-0.5">{proj.showcase.outcomes}</p>
                    </div>
                  )}

                  {/* Team Members snapshot */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Verified Team:
                    </p>
                    <div className="flex items-center gap-2">
                      {proj.members && proj.members.length > 0 ? (
                        proj.members.map((m, idx) => (
                          <div
                            key={idx}
                            title={`${m.name} (${m.role})`}
                            className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white ring-1 ring-slate-200"
                          >
                            {m.name.charAt(0)}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Student Team</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    {proj.showcase?.githubUrl && (
                      <a
                        href={proj.showcase.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-slate-900 flex items-center gap-1 font-semibold"
                      >
                        <Github className="w-3.5 h-3.5" /> Code
                      </a>
                    )}
                    {proj.showcase?.demoUrl && (
                      <a
                        href={proj.showcase.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-700 hover:text-brand-800 flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/showcase/${proj._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                  >
                    View Project &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
