'use client';

import React, { useState, useEffect } from 'react';
import {
  Hammer,
  Plus,
  Users,
  CheckCircle2,
  Send,
  Code,
  Tag,
  Search,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import Image from 'next/image';

interface IMember {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  university?: string;
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
  location?: string;
  ownerName: string;
  ownerUniversity?: string;
  members: IMember[];
  status: string;
  isAptivoVerified: boolean;
  coverImage?: string;
}

export default function BuildPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyModalProject, setApplyModalProject] = useState<IProject | null>(null);

  // Create Form State
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('Software');
  const [skillsInput, setSkillsInput] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [duration, setDuration] = useState('6 weeks');
  const [mode, setMode] = useState('Remote');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Apply Form State
  const [whyJoin, setWhyJoin] = useState('');
  const [contribution, setContribution] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [availability, setAvailability] = useState('10-15 hrs/week');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/build');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }
    if (email) {
      fetch(`/api/profile?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.user) {
            if (d.user.skills && d.user.skills.length > 0) {
              setSkills(d.user.skills.join(', '));
            }
            if (d.user.github || d.user.githubUrl || d.user.portfolio || d.user.portfolioUrl) {
              setPortfolioUrl(d.user.portfolio || d.user.portfolioUrl || d.user.github || d.user.githubUrl || '');
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }
    if (!email) {
      alert('Please sign in to submit a project brief.');
      return;
    }
    setSubmittingCreate(true);
    try {
      const requiredSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: email,
          title,
          problem,
          building,
          description,
          field,
          requiredSkills,
          teamSize: Number(teamSize),
          duration,
          mode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setTitle('');
        setProblem('');
        setBuilding('');
        setDescription('');
        setSkillsInput('');
        fetchProjects();
      } else {
        alert(data.error || 'Failed to submit proposal.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleApplyToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalProject) return;

    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }
    if (!email) {
      alert('Please sign in to apply to this team.');
      return;
    }

    setSubmittingApply(true);
    try {
      const skillsArr = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/build/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: applyModalProject._id,
          applicantEmail: email,
          whyJoin,
          contribution,
          skills: skillsArr,
          portfolioUrl,
          availability,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setApplyModalProject(null);
          setWhyJoin('');
          setContribution('');
          setSkills('');
          setPortfolioUrl('');
        }, 1800);
      } else {
        alert(data.error || 'Application failed.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingApply(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesField = selectedField === 'All' || p.field.toLowerCase().includes(selectedField.toLowerCase());
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesField && matchesSearch;
  });

  const categories = ['All', 'AI & Healthcare', 'Fintech & Software', 'Robotics & Hardware', 'Design'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Hammer className="w-3.5 h-3.5" />
            <span>Pillar 2: BUILD</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Build Real Projects with Student Teammates
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Discover curated, verified student initiatives or propose your own idea. Aptivo validates scope, structures briefs, and showcases completed work.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-brand-600 text-white text-sm font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Propose a Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedField(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedField === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tech, title or skill..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <Hammer className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or propose a new project brief using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj._id}
              className="bg-slate-50 hover:bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Cover Image */}
                {proj.coverImage && (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src={proj.coverImage}
                      alt={proj.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    {proj.isAptivoVerified && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Aptivo Verified
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {proj.field}
                  </span>
                  <StatusPill status={proj.status} size="sm" />
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    <strong className="text-slate-900 font-semibold">Problem:</strong> {proj.problem}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    <strong className="text-slate-900 font-semibold">Building:</strong> {proj.building}
                  </p>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-800 text-[10px] font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {proj.members?.length || 1}/{proj.teamSize} Team Seats
                  </span>
                  <span>{proj.mode} • {proj.duration}</span>
                </div>

                <button
                  onClick={() => setApplyModalProject(proj)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Apply to Join Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Propose a Project (BUILD)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aptivo reviews, validates scope, and gives verified status to help form your team.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Medical AI Assistant"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What Problem does it solve? *
                </label>
                <input
                  type="text"
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Patients struggle to understand complex clinical lab reports."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What are you building? *
                </label>
                <input
                  type="text"
                  required
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. AI-driven report summarizer with bilingual voice guidance."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Project Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the workflow, architecture, or target user journey..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Field</label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    <option value="AI & Healthcare">AI & Healthcare</option>
                    <option value="Fintech & Software">Fintech & Software</option>
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="In-person">In-person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Team Size</label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 weeks"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. React Native, Machine Learning, UI/UX"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <span>{submittingCreate ? 'Submitting...' : 'Submit for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to Join Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {applySuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Application Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  The project lead has received your details. You will receive an in-app notification when reviewed.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Apply to Join: {applyModalProject.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lead by {applyModalProject.ownerName} ({applyModalProject.ownerUniversity})
                    </p>
                  </div>
                  <button
                    onClick={() => setApplyModalProject(null)}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleApplyToProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Why do you want to join this project? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={whyJoin}
                      onChange={(e) => setWhyJoin(e.target.value)}
                      placeholder="Share your interest in this domain and why this project excites you."
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      What can you contribute? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      placeholder="e.g. Backend API development, Figma UI designs, ML training scripts."
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relevant Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Python, PyTorch, React, Tailwind"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        GitHub or Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. 10-15 hrs/week"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setApplyModalProject(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApply}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingApply ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
