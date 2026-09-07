'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Hammer,
  ArrowLeft,
  CheckCircle2,
  Users,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

interface IMember {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  university?: string;
}

interface IMilestone {
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  weekNumber: number;
}

interface IMessage {
  senderName: string;
  message: string;
  sentAt: string;
}

interface IApplication {
  _id: string;
  applicantName: string;
  applicantUniversity?: string;
  whyJoin: string;
  contribution: string;
  skills: string[];
  portfolioUrl?: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Declined';
  messages: IMessage[];
}

interface IProject {
  _id: string;
  title: string;
  problem: string;
  building: string;
  description: string;
  field: string;
  requiredSkills: string[];
  teamSize: number;
  duration: string;
  mode: string;
  ownerName: string;
  ownerUniversity?: string;
  members: IMember[];
  milestones: IMilestone[];
  status: string;
  isAptivoVerified: boolean;
  coverImage?: string;
  showcase?: {
    demoUrl?: string;
    githubUrl?: string;
    outcomes?: string;
  };
}

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<IProject | null>(null);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Showcase form
  const [showcaseModal, setShowcaseModal] = useState(false);
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/build/${params.id}`);
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setApplications(data.applications || []);
        if (data.applications?.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [params.id]);

  const handleUpdateMilestone = async (index: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (!project) return;
    const updatedMilestones = [...project.milestones];
    updatedMilestones[index].status = newStatus;

    try {
      const res = await fetch(`/api/build/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplicationDecision = async (applicationId: string, status: 'Accepted' | 'Declined') => {
    try {
      const res = await fetch('/api/build/apply', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newMessage.trim()) return;

    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/build/${params.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          senderEmail: email,
          message: newMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        setSelectedApp(data.application);
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handlePublishShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const res = await fetch(`/api/build`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          status: 'Showcase',
          isAptivoVerified: true,
          showcase: {
            demoUrl,
            githubUrl,
            outcomes,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowcaseModal(false);
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !project) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading project workspace...</div>;
  }

  const completedMilestones = project.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 6;
  const progressPercent = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/build"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Directory</span>
        </Link>

        {project.status === 'Showcase' ? (
          <Link
            href={`/showcase/${project._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Public Showcase Page &rarr;</span>
          </Link>
        ) : (
          <button
            onClick={() => setShowcaseModal(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Publish to Public Showcase</span>
          </button>
        )}
      </div>

      {/* Project Overview Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                {project.field}
              </span>
              <StatusPill status={project.status} />
              {project.isAptivoVerified && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified by Aptivo
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Project Lead: {project.ownerName} ({project.ownerUniversity}) • {project.mode} • {project.duration}
            </p>
          </div>

          {/* Progress Bar Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 sm:w-60 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Sprint Progress</span>
              <span className="text-brand-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
          </div>
        </div>

        {/* Problem & Building Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-xs space-y-1">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Problem Being Solved:</p>
            <p className="text-slate-600 leading-relaxed">{project.problem}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-xs space-y-1">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">What is Being Built:</p>
            <p className="text-slate-600 leading-relaxed">{project.building}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sprint Milestones Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Header */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Hammer className="w-4 h-4 text-amber-600" />
                <span>Sprint Milestones & Delivery Schedule</span>
              </h3>
              <span className="text-xs text-slate-500">6-Week Structured Cycle</span>
            </div>

            <div className="space-y-3">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          Week {ms.weekNumber || idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{ms.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{ms.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={ms.status}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            idx,
                            e.target.value as 'pending' | 'in-progress' | 'completed'
                          )
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-bold border focus:outline-none ${
                          ms.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ms.status === 'in-progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed ✓</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">No milestones assigned yet.</div>
              )}
            </div>
          </div>

          {/* Project Applications & Messaging Thread */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Team Applications & Discussions</span>
              </h3>
              <span className="text-xs text-slate-500">{applications.length} Applicants</span>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                No students have applied to this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Applicant List */}
                <div className="space-y-2">
                  {applications.map((app) => (
                    <button
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                        selectedApp?._id === app._id
                          ? 'bg-emerald-50/80 border-emerald-200 font-bold text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate">{app.applicantName}</span>
                        <StatusPill status={app.status} size="sm" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal truncate">
                        {app.applicantUniversity}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Selected Applicant Details & Chat */}
                {selectedApp && (
                  <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{selectedApp.applicantName}</h4>
                          <p className="text-[11px] text-slate-500">{selectedApp.applicantUniversity}</p>
                        </div>
                        {selectedApp.status === 'Applied' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplicationDecision(selectedApp._id, 'Accepted')}
                              className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                            >
                              Accept into Team
                            </button>
                            <button
                              onClick={() => handleApplicationDecision(selectedApp._id, 'Declined')}
                              className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl">
                        <p>
                          <strong>Why Join:</strong> {selectedApp.whyJoin}
                        </p>
                        <p>
                          <strong>Contribution:</strong> {selectedApp.contribution}
                        </p>
                        {selectedApp.portfolioUrl && (
                          <p>
                            <strong>Portfolio:</strong>{' '}
                            <a
                              href={selectedApp.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 underline"
                            >
                              {selectedApp.portfolioUrl}
                            </a>
                          </p>
                        )}
                      </div>

                      {/* Scoped Message History */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Project Discussion Thread
                        </p>
                        {selectedApp.messages && selectedApp.messages.length > 0 ? (
                          selectedApp.messages.map((msg, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="font-bold text-slate-800">{msg.senderName}</span>
                                <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-700 leading-snug">{msg.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No messages exchanged yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Send Message Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message or question..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg}
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Team Members */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Team Roster</h3>
              <span className="text-xs text-brand-700 font-semibold">
                {project.members?.length || 1}/{project.teamSize} Filled
              </span>
            </div>

            <div className="space-y-3">
              {project.members && project.members.length > 0 ? (
                project.members.map((mem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-brand-400 shrink-0">
                      <Image
                        src={
                          mem.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={mem.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{mem.name}</p>
                      <p className="text-[10px] text-brand-700 font-semibold truncate">{mem.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{mem.university}</p>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Showcase Modal */}
      {showcaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Publish Project to Public Showcase</h3>
              <button
                onClick={() => setShowcaseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublishShowcase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  required
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://myproject.app"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repository</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Outcomes & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  placeholder="e.g. Tested on 500 clinical reports, 94% accuracy, deployed on mobile."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowcaseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md hover:bg-brand-700 disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Confirm & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
