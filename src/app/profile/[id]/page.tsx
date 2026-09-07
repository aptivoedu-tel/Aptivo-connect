'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Hammer,
  Users,
  Building2,
  Calendar,
  Layers,
  Award,
  Star,
  MessageSquare,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeViewer, setActiveViewer] = useState<any>(null);

  // Reputation Endorsement Modal
  const [endorseModalOpen, setEndorseModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [endorseCategory, setEndorseCategory] = useState('Collaboration');
  const [endorseComment, setEndorseComment] = useState('');
  const [submittingEndorse, setSubmittingEndorse] = useState(false);
  const [endorseMessage, setEndorseMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile?id=${encodeURIComponent(params.id)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setProfileData(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    try {
      const stored = localStorage.getItem('aptivo_user');
      if (stored) {
        setActiveViewer(JSON.parse(stored));
      }
    } catch {}
  }, [params.id]);

  const handleEndorse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !activeViewer?.email) return;

    setSubmittingEndorse(true);
    setEndorseMessage('');
    try {
      const res = await fetch('/api/reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject._id,
          reviewerEmail: activeViewer.email,
          targetUserId: profileData.user._id,
          category: endorseCategory,
          comment: endorseComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEndorseMessage('Endorsement submitted successfully!');
        setTimeout(() => {
          setEndorseModalOpen(false);
          setEndorseComment('');
          fetchProfile();
        }, 1200);
      } else {
        setEndorseMessage(data.error || 'Failed to endorse.');
      }
    } catch (e: any) {
      setEndorseMessage(e.message || 'Network error.');
    } finally {
      setSubmittingEndorse(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading builder profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-black text-slate-900">Profile Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'This user profile does not exist or is private.'}</p>
          <Link
            href="/dashboard/build"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-brand-600 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Build</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, activity } = profileData;
  const createdProjects = activity?.createdProjects || [];
  const contributedProjects = activity?.contributedProjects || [];
  const showcaseProjects = activity?.showcaseProjects || [];
  const meetups = activity?.meetups || [];
  const experiences = activity?.experiences || [];
  const skillStats = activity?.skillStats || [];
  const reputation = user?.reputation || [];

  // Shared projects where both viewer and target are members
  const sharedProjects = (activity?.allProjects || []).filter((p: any) => {
    if (!activeViewer?._id) return false;
    const viewerId = activeViewer._id.toString();
    const isViewerInProject =
      p.ownerId?.toString() === viewerId ||
      p.members?.some((m: any) => m.userId?.toString() === viewerId);
    return isViewerInProject && viewerId !== user._id.toString();
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/build"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Projects</span>
          </Link>

          {sharedProjects.length > 0 && (
            <button
              onClick={() => {
                setSelectedProject(sharedProjects[0]);
                setEndorseModalOpen(true);
                setEndorseMessage('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Endorse Collaborator</span>
            </button>
          )}
        </div>

        {/* 1. Header Card: Professional Identity */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 text-white font-black text-4xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative shrink-0">
              {user.avatarUrl || user.profilePhoto ? (
                <Image
                  src={user.avatarUrl || user.profilePhoto}
                  alt={user.fullName || user.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                (user.fullName || user.name || 'U').charAt(0)
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {user.fullName || user.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aptivo Builder ID</span>
                </span>
                {user.isAptivoVerified && (
                  <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Builder</span>
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-brand-700">
                {user.headline ||
                  (user.accountType === 'student'
                    ? `${user.degree || 'Student'} · ${user.university || 'University'}`
                    : `${user.jobTitle || 'Professional'} · ${user.organization || 'Industry'}`)}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                <span>📍 {user.city || 'Pakistan'}</span>
                <span>
                  🎓 {user.accountType === 'student' ? 'Student Builder' : 'Professional Builder'}
                </span>
                {user.graduationYear && <span>Class of {user.graduationYear}</span>}
              </div>

              {/* Social / Portfolio Links */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {user.github && (
                  <a
                    href={user.github.startsWith('http') ? user.github : `https://${user.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {user.portfolio && (
                  <a
                    href={user.portfolio.startsWith('http') ? user.portfolio : `https://${user.portfolio}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. About Bio */}
        {user.bio && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">About the Builder</h2>
            <p className="text-sm leading-relaxed text-slate-700">{user.bio}</p>
          </section>
        )}

        {/* 3. Skills Tied to Real Work (No Fake Percentages) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Demonstrated Skills & Tools
            </h2>
          </div>

          {skillStats.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillStats.map((item: any) => (
                <div
                  key={item.skill}
                  className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                >
                  <span className="font-bold text-slate-900">{item.skill}</span>
                  {item.projectsCount > 0 ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Used in {item.projectsCount} {item.projectsCount === 1 ? 'project' : 'projects'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Core skill</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Built: Projects Created */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Projects Built ({createdProjects.length})
            </h2>
          </div>

          {createdProjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No created projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {createdProjects.map((p: any) => (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {p.field}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.status === 'Showcase'
                          ? 'bg-purple-100 text-purple-800'
                          : p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{p.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.problem}</p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {p.requiredSkills?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Team of {p.members?.length || 1}</span>
                    <Link
                      href={`/dashboard/build/${p._id}`}
                      className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Contributions: Projects Collaborated On */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Team Contributions ({contributedProjects.length})
            </h2>
          </div>

          {contributedProjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No team contributions yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {contributedProjects.map((p: any) => {
                const memberRecord = p.members?.find(
                  (m: any) => m.userId?.toString() === user._id.toString()
                );
                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {p.field}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {memberRecord?.role || 'Team Member'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{p.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.problem}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Led by {p.ownerName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. Showcase Projects (Verified Proof of Work) */}
        {showcaseProjects.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Verified Showcase Work ({showcaseProjects.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {showcaseProjects.map((p: any) => (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-brand-700">Showcase</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aptivo Verified
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{p.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{p.building || p.problem}</p>
                  {p.showcase?.outcomes && (
                    <p className="text-xs text-emerald-900 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                      &ldquo;{p.showcase.outcomes}&rdquo;
                    </p>
                  )}
                  <div className="pt-2 flex gap-3 text-xs font-bold">
                    {p.showcase?.demoUrl && (
                      <a
                        href={p.showcase.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {p.showcase?.githubUrl && (
                      <a
                        href={p.showcase.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline flex items-center gap-1"
                      >
                        <Github className="w-3 h-3" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Experiences & Meetups Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experiences */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Aptivo Experiences ({experiences.length})
              </h2>
            </div>
            {experiences.length === 0 ? (
              <p className="text-xs text-slate-400">No completed experiences yet.</p>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp: any) => (
                  <div key={exp._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-900">{exp.title}</p>
                    <p className="text-[11px] text-slate-500">{exp.company} · {exp.date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Meetups */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Meetups Attended ({meetups.length})
              </h2>
            </div>
            {meetups.length === 0 ? (
              <p className="text-xs text-slate-400">No registered meetups yet.</p>
            ) : (
              <div className="space-y-3">
                {meetups.map((m: any) => (
                  <div key={m._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-900">{m.title}</p>
                    <p className="text-[11px] text-slate-500">{m.speakerName} · {m.date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 8. Reputation & Collaborator Endorsements */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Collaborator Reputation & Endorsements ({reputation.length})
              </h2>
            </div>
            {sharedProjects.length > 0 && (
              <button
                onClick={() => {
                  setSelectedProject(sharedProjects[0]);
                  setEndorseModalOpen(true);
                  setEndorseMessage('');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                + Add Endorsement
              </button>
            )}
          </div>

          {reputation.length === 0 ? (
            <p className="text-xs text-slate-400">
              Peer reputation is earned through project collaboration. No endorsements recorded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reputation.map((rep: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-950">{rep.category}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{rep.projectTitle}</span>
                  </div>
                  {rep.comment && <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rep.comment}&rdquo;</p>}
                  <p className="text-[10px] text-slate-400">Endorsed by {rep.fromUserName}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Endorse Modal */}
      {endorseModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Endorse {user.fullName || user.name}</h3>
              <button onClick={() => setEndorseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Based on your shared work on <span className="font-bold text-slate-800">{selectedProject.title}</span>.
            </p>

            {endorseMessage && (
              <p
                className={`text-xs font-semibold p-2.5 rounded-xl ${
                  endorseMessage.includes('success')
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {endorseMessage}
              </p>
            )}

            <form onSubmit={handleEndorse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collaboration Category *</label>
                <select
                  value={endorseCategory}
                  onChange={(e) => setEndorseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                >
                  <option value="Technical contribution">Technical contribution</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Reliability">Reliability</option>
                  <option value="Communication">Communication</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={endorseComment}
                  onChange={(e) => setEndorseComment(e.target.value)}
                  placeholder="e.g. Led the backend integration reliably and communicated clear updates every sprint."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEndorseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEndorse}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-brand-700 disabled:opacity-50"
                >
                  {submittingEndorse ? 'Saving...' : 'Submit Endorsement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
