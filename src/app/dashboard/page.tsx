'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Hammer,
  Building2,
  ArrowRight,
  Calendar,
  Video,
  ChevronRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

interface IMeet {
  _id: string;
  title?: string;
  field?: string;
  date?: string;
  startTime?: string;
  format?: string;
  status: string;
  scheduledDetails?: {
    mentorName: string;
    mentorRole: string;
    date: string;
    time: string;
    meetingLink: string;
    durationMinutes: number;
  };
}

interface IProjectItem {
  _id: string;
  title: string;
  field: string;
  status: string;
  teamSize: number;
  members: Array<{ name: string; role: string }>;
  duration: string;
}

interface IExperienceItem {
  _id: string;
  title: string;
  company: string;
  date: string;
  location: string;
  status: string;
}

export default function DashboardOverview() {
  const [meets, setMeets] = useState<IMeet[]>([]);
  const [projects, setProjects] = useState<IProjectItem[]>([]);
  const [experiences, setExperiences] = useState<IExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, pRes, eRes] = await Promise.all([
          fetch('/api/meetups'),
          fetch('/api/build'),
          fetch('/api/experience'),
        ]);

        const mData = await mRes.json();
        const pData = await pRes.json();
        const eData = await eRes.json();

        if (mData.meetups) setMeets(mData.meetups);
        if (pData.projects) setProjects(pData.projects);
        if (eData.experiences) setExperiences(eData.experiences);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const scheduledMeeting = meets.find((m) => m.status === 'published');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-darkpine-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Aptivo Student Opportunity Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            What are you looking to discover today?
          </h2>
          <p className="mt-2 text-sm text-emerald-100/80 leading-relaxed">
            Aptivo Connect facilitates direct access to industry leaders, collaborative student projects,
            and immersive workplace visits beyond standard coursework.
          </p>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Link
              href="/dashboard/meetup"
              className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all text-xs font-medium"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Explore Meetups</span>
            </Link>
            <Link
              href="/dashboard/build"
              className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all text-xs font-medium"
            >
              <Hammer className="w-4 h-4 text-amber-300" />
              <span>Build a Project</span>
            </Link>
            <Link
              href="/dashboard/experience"
              className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all text-xs font-medium"
            >
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>Explore Visits</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Scheduled Meetings & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Confirmed / Upcoming Meeting Highlight Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Upcoming Meetup</h3>
              </div>
              <Link
                href="/dashboard/meetup"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
              >
                View all meetups <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {scheduledMeeting ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusPill status="Published" />
                    <span className="text-xs font-medium text-slate-500">
                      {scheduledMeeting.field}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {scheduledMeeting.title || 'Aptivo Meetup'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Curated Aptivo session
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {scheduledMeeting.date} • {scheduledMeeting.startTime}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                      {scheduledMeeting.format}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <Link
                    href="/dashboard/meetup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>View Meetup</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
                <p className="text-xs text-slate-500">No upcoming meetups yet.</p>
                <Link
                  href="/dashboard/meetup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                >
                  <span>Explore Meetups</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Active Projects (BUILD) Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Hammer className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Active Projects (BUILD)</h3>
              </div>
              <Link
                href="/dashboard/build"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
              >
                Browse directory <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 2).map((proj) => (
                <div
                  key={proj._id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusPill status={proj.status} />
                      <span className="text-xs font-semibold text-slate-600">{proj.field}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{proj.title}</h4>
                    <p className="text-xs text-slate-500">
                      Team: {proj.members?.length || 1}/{proj.teamSize} members • {proj.duration}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/build`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shrink-0"
                  >
                    <span>View Team</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Activity Summary & Experiences */}
        <div className="space-y-6">
          {/* Activity Snapshot Card */}
          <div className="bg-[#13231c] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-950/40">
            <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-400 mb-4">
              Your Activity Tracker
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <p className="text-2xl font-extrabold text-white">{meets.length}</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">Meetups</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <p className="text-2xl font-extrabold text-white">{projects.length}</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">Active Projects</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <p className="text-2xl font-extrabold text-white">{experiences.length}</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">Experiences</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <p className="text-2xl font-extrabold text-brand-400">Verified</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">Aptivo ID</p>
              </div>
            </div>
          </div>

          {/* Upcoming Workplace Experience Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Featured Experience</h3>
              <Link
                href="/dashboard/experience"
                className="text-xs text-brand-700 font-semibold hover:underline"
              >
                All Visits
              </Link>
            </div>

            {experiences[0] ? (
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {experiences[0].company}
                </span>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {experiences[0].title}
                </h4>
                <p className="text-xs text-slate-500">
                  {experiences[0].date} • {experiences[0].location}
                </p>
                <Link
                  href="/dashboard/experience"
                  className="mt-2 w-full inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
                >
                  <span>View Experience</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
