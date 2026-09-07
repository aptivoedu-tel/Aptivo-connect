'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  Github,
  ExternalLink,
  Users,
  Hammer,
  Sparkles,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

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
  teamSize: number;
  duration: string;
  mode: string;
  location?: string;
  ownerName: string;
  ownerUniversity?: string;
  members: IMember[];
  isAptivoVerified: boolean;
  coverImage?: string;
  showcase?: {
    demoUrl?: string;
    githubUrl?: string;
    videoUrl?: string;
    outcomes?: string;
    publishedAt?: string;
  };
}

export default function SingleShowcasePage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/build/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) setProject(data.project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="py-20 text-center text-slate-400 text-sm flex-1">Loading showcase...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 w-full">
        {/* Back Link */}
        <div>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Showcase Projects</span>
          </Link>
        </div>

        {/* Hero Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                {project.field}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Built Through Aptivo Connect
              </span>
            </div>

            <div className="flex items-center gap-3">
              {project.showcase?.githubUrl && (
                <a
                  href={project.showcase.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.showcase?.demoUrl && (
                <a
                  href={project.showcase.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live App / Demo</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Initiative led by {project.ownerName} ({project.ownerUniversity}) • {project.duration} sprint
            </p>
          </div>

          {/* Cover Media */}
          {project.coverImage && (
            <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-100">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Impact Outcome Callout */}
          {project.showcase?.outcomes && (
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-slate-50 rounded-2xl border border-emerald-200 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Verified Program Outcome:
              </p>
              <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                {project.showcase.outcomes}
              </p>
            </div>
          )}

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Problem Addressed
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed">{project.problem}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                What Was Built
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed">{project.building}</p>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-extrabold text-slate-900">Project Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Verified Team Attributions */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Verified Student Team</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.members && project.members.length > 0 ? (
                project.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[11px] text-brand-700 font-semibold truncate">{member.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{member.university}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Student Team</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
