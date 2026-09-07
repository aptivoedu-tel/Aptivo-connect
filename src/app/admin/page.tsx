'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Hammer,
  Building2,
  Award,
  Radio,
  Building,
  MessageSquare,
  BarChart3,
  UserCheck,
  Settings,
  ShieldCheck,
  Plus,
  Check,
  X,
  Clock,
  Eye,
  Trash2,
  Edit,
  Send,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LogOut,
  Bell,
  Menu,
  Upload,
  Video,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

// ── Admin Tabs ─────────────────────────────────────────────────────────────

type AdminTab =
  | 'overview'
  | 'build'
  | 'meetup'
  | 'experience'
  | 'showcase'
  | 'users'
  | 'partners'
  | 'notifications'
  | 'settings';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real Database Collections
  const [stats, setStats] = useState({
    studentsCount: 0,
    professionalsCount: 0,
    activeProjectsCount: 0,
    pendingProjectsCount: 0,
    meetupsCount: 0,
    experiencesCount: 0,
    showcaseCount: 0,
    pendingApplicationsCount: 0,
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [meetups, setMeetups] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'professional'>('all');

  // Modal States & Poster Upload References
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createMeetupOpen, setCreateMeetupOpen] = useState(false);
  const [createExperienceOpen, setCreateExperienceOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const meetupFileInputRef = useRef<HTMLInputElement>(null);
  const experienceFileInputRef = useRef<HTMLInputElement>(null);

  // Project Creation Form State
  const [projTitle, setProjTitle] = useState('');
  const [projProblem, setProjProblem] = useState('');
  const [projBuilding, setProjBuilding] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projField, setProjField] = useState('Software Engineering');
  const [projSkills, setProjSkills] = useState('React, Node.js, MongoDB');
  const [projTeamSize, setProjTeamSize] = useState(4);
  const [projDuration, setProjDuration] = useState('6 weeks');
  const [projPosterUrl, setProjPosterUrl] = useState('');
  const [uploadingProjPoster, setUploadingProjPoster] = useState(false);

  // Meetup Creation Form State
  const [meetTitle, setMeetTitle] = useState('');
  const [meetShortDesc, setMeetShortDesc] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetCategory, setMeetCategory] = useState('Engineering & Tech');
  const [meetSpeaker, setMeetSpeaker] = useState('');
  const [meetRole, setMeetRole] = useState('');
  const [meetOrg, setMeetOrg] = useState('');
  const [meetFormat, setMeetFormat] = useState<'online' | 'in-person' | 'hybrid'>('online');
  const [meetDate, setMeetDate] = useState('');
  const [meetStartTime, setMeetStartTime] = useState('18:00');
  const [meetEndTime, setMeetEndTime] = useState('19:30');
  const [meetVenue, setMeetVenue] = useState('Google Meet');
  const [meetCapacity, setMeetCapacity] = useState(50);
  const [meetPosterUrl, setMeetPosterUrl] = useState('');
  const [uploadingMeetPoster, setUploadingMeetPoster] = useState(false);

  // Experience Creation Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expCategory, setExpCategory] = useState('Software House');
  const [expDate, setExpDate] = useState('');
  const [expTime, setExpTime] = useState('02:00 PM - 05:00 PM');
  const [expLocation, setExpLocation] = useState('');
  const [expCity, setExpCity] = useState('Karachi');
  const [expCapacity, setExpCapacity] = useState(20);
  const [expDescription, setExpDescription] = useState('');
  const [expEligibility, setExpEligibility] = useState('Open to enrolled university students');
  const [expPosterUrl, setExpPosterUrl] = useState('');
  const [uploadingExpPoster, setUploadingExpPoster] = useState(false);
  const [expQuestions, setExpQuestions] = useState<Array<{ id: string; questionText: string; questionType: string; required: boolean }>>([
    { id: '1', questionText: 'Why are you interested in this workplace immersion?', questionType: 'long-text', required: true },
    { id: '2', questionText: 'What is your current year of study & major?', questionType: 'short-text', required: true },
  ]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, projRes, meetRes, expRes, usersRes] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()).catch(() => ({})),
        fetch('/api/build?status=all').then((r) => r.json()).catch(() => ({})),
        fetch('/api/meetups?status=all').then((r) => r.json()).catch(() => ({})),
        fetch('/api/experience').then((r) => r.json()).catch(() => ({})),
        fetch('/api/people?limit=100').then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes.stats) {
        setStats({
          studentsCount: statsRes.stats.studentsCount || 0,
          professionalsCount: statsRes.stats.professionalsCount || 0,
          activeProjectsCount: statsRes.stats.activeProjectsCount || 0,
          pendingProjectsCount: statsRes.stats.pendingProjectsCount || 0,
          meetupsCount: meetRes.meetups?.length || 0,
          experiencesCount: expRes.experiences?.length || 0,
          showcaseCount: projRes.projects?.filter((p: any) => p.status === 'Showcase')?.length || 0,
          pendingApplicationsCount: statsRes.stats.pendingApplicationsCount || 0,
        });
      }

      if (projRes.projects) setProjects(projRes.projects);
      if (meetRes.meetups) setMeetups(meetRes.meetups);
      if (expRes.experiences) setExperiences(expRes.experiences);
      if (usersRes.users) setUsersList(usersRes.users);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Generic Poster Upload Handler
  const handleUploadPoster = async (
    file: File,
    category: string,
    setPosterUrl: (url: string) => void,
    setUploading: (u: boolean) => void
  ) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPosterUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload poster image');
      }
    } catch {
      alert('Error uploading poster');
    } finally {
      setUploading(false);
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projTitle,
          problem: projProblem,
          building: projBuilding,
          description: projDesc,
          field: projField,
          requiredSkills: projSkills.split(',').map((s) => s.trim()).filter(Boolean),
          teamSize: Number(projTeamSize),
          duration: projDuration,
          coverImage: projPosterUrl,
          ownerEmail: 'admin@connect.aptivo',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateProjectOpen(false);
        setProjTitle('');
        setProjProblem('');
        setProjBuilding('');
        setProjDesc('');
        setProjPosterUrl('');
        loadAllData();
      } else {
        alert(data.error || 'Failed to create project');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Meetup
  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetTitle,
          shortDescription: meetShortDesc,
          description: meetDesc,
          category: meetCategory,
          speakerName: meetSpeaker,
          speakerRole: meetRole,
          speakerOrganization: meetOrg,
          format: meetFormat,
          date: meetDate,
          startTime: meetStartTime,
          endTime: meetEndTime,
          venueName: meetVenue,
          capacity: Number(meetCapacity),
          coverImage: meetPosterUrl,
          status: 'published',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMeetupOpen(false);
        setMeetTitle('');
        setMeetShortDesc('');
        setMeetDesc('');
        setMeetSpeaker('');
        setMeetPosterUrl('');
        loadAllData();
      } else {
        alert(data.error || 'Failed to publish meetup');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Experience
  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expTitle,
          company: expCompany,
          category: expCategory,
          date: expDate,
          time: expTime,
          location: expLocation,
          city: expCity,
          capacity: Number(expCapacity),
          description: expDescription,
          eligibility: expEligibility,
          posterUrl: expPosterUrl,
          questionnaire: expQuestions,
          status: 'Upcoming',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateExperienceOpen(false);
        setExpTitle('');
        setExpCompany('');
        setExpDescription('');
        setExpLocation('');
        setExpPosterUrl('');
        loadAllData();
      } else {
        alert(data.error || 'Failed to create experience');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Project Status / Showcase
  const handleUpdateProjectStatus = async (projectId: string, status: string, isAptivoVerified?: boolean) => {
    try {
      const res = await fetch('/api/build', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, status, isAptivoVerified }),
      });
      const data = await res.json();
      if (data.success) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'build', label: 'BUILD Projects', icon: Hammer, badge: stats.pendingProjectsCount || undefined },
    { id: 'meetup', label: 'MEETUP Sessions', icon: Users },
    { id: 'experience', label: 'EXPERIENCE Labs', icon: Building2 },
    { id: 'showcase', label: 'Showcase', icon: Award },
    { id: 'users', label: 'Users Directory', icon: UserCheck },
    { id: 'notifications', label: 'Notifications Hub', icon: Bell },
    { id: 'settings', label: 'Settings & DB', icon: Settings },
  ];

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearchQuery.toLowerCase();
    const matchesQ =
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.university?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q);
    return matchesRole && matchesQ;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-slate-950 font-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">Aptivo Connect</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-800">
                Admin Console
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Pillars • Directory • Roster Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            <span>Exit to Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft self-start space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Admin Modules
          </div>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSel ? 'text-brand-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Admin Body */}
        <main className="flex-1 bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-soft overflow-hidden min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Database & Platform Overview</h3>
                  <p className="text-xs text-slate-500">Live operational counts from production MongoDB collections.</p>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Students</span>
                  <p className="text-2xl font-black text-emerald-950">{stats.studentsCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-800">Professionals</span>
                  <p className="text-2xl font-black text-blue-950">{stats.professionalsCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800">BUILD Projects</span>
                  <p className="text-2xl font-black text-amber-950">{projects.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-800">MEETUPS</span>
                  <p className="text-2xl font-black text-purple-950">{meetups.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-800">EXPERIENCE Labs</span>
                  <p className="text-2xl font-black text-rose-950">{experiences.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-teal-800">Showcase Products</span>
                  <p className="text-2xl font-black text-teal-950">{stats.showcaseCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-700">Pending Apps</span>
                  <p className="text-2xl font-black text-slate-900">{stats.pendingApplicationsCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-darkpine-900 text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase text-brand-400">Total Users</span>
                  <p className="text-2xl font-black">{stats.studentsCount + stats.professionalsCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUILD PROJECTS */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">BUILD Projects Directory</h3>
                  <p className="text-xs text-slate-500">Manage student team initiatives, review briefs, and upload posters.</p>
                </div>
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Project / Poster</th>
                      <th className="p-3.5">Field</th>
                      <th className="p-3.5">Owner / Team</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                              {p.coverImage ? (
                                <Image src={p.coverImage} alt="" fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                                  {p.title?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{p.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{p.building || p.problem}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{p.field}</td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{p.ownerName}</p>
                          <p className="text-[10px] text-slate-400">{p.members?.length || 0} members</p>
                        </td>
                        <td className="p-3.5">
                          <StatusPill status={p.status} />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {p.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateProjectStatus(p._id, 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                            )}
                            {p.status !== 'Showcase' && (
                              <button
                                onClick={() => handleUpdateProjectStatus(p._id, 'Showcase', true)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px]"
                              >
                                + Showcase
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MEETUP SESSIONS */}
          {activeTab === 'meetup' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">MEETUP Events & Sessions</h3>
                  <p className="text-xs text-slate-500">Publish expert talks, manage attendee rosters, and upload session posters.</p>
                </div>
                <button
                  onClick={() => setCreateMeetupOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Meetup</span>
                </button>
              </div>

              {/* Meetup Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetups.map((m) => (
                  <div key={m._id} className="p-5 rounded-3xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                        {m.coverImage ? (
                          <Image src={m.coverImage} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                            {m.title?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-brand-700">{m.category}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{m.title}</h4>
                        <p className="text-xs text-slate-600">
                          {m.speakerName} • {m.speakerRole || m.speakerOrganization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>{m.date} • {m.startTime}</span>
                      <span className="font-bold text-emerald-800">
                        {m.registrations?.length || 0} / {m.capacity} Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE LABS */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">EXPERIENCE Immersions & Labs</h3>
                  <p className="text-xs text-slate-500">Curate company visits, review custom questionnaires, and upload immersion posters.</p>
                </div>
                <button
                  onClick={() => setCreateExperienceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Experience</span>
                </button>
              </div>

              {/* Experience List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiences.map((exp) => (
                  <div key={exp._id} className="p-5 rounded-3xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                        {exp.posterUrl || exp.image ? (
                          <Image src={exp.posterUrl || exp.image} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                            {exp.title?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-brand-700">{exp.category}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{exp.title}</h4>
                        <p className="text-xs text-slate-600">{exp.company} • {exp.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>{exp.date} • {exp.time}</span>
                      <span className="font-bold text-emerald-800">
                        {exp.enrolledStudents?.length || 0} / {exp.capacity} Enrolled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SHOWCASE */}
          {activeTab === 'showcase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Verified Project Showcase</h3>
                  <p className="text-xs text-slate-500">Products published to the public showcase with verified Aptivo badges.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.filter((p) => p.status === 'Showcase').map((proj) => (
                  <div key={proj._id} className="p-4 rounded-3xl border border-slate-200/80 bg-white space-y-2">
                    <span className="text-[10px] font-bold uppercase text-brand-700">{proj.field}</span>
                    <h4 className="font-extrabold text-sm text-slate-900">{proj.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{proj.building || proj.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                      <Link href="/showcase" className="text-brand-600 font-bold hover:underline">
                        View Live &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Users Directory</h3>
                  <p className="text-xs text-slate-500">Live search across student and professional records in MongoDB.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, university..."
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="professional">Professionals</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Institution / Company</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                              {u.profilePhoto || u.avatarUrl ? (
                                <Image src={u.profilePhoto || u.avatarUrl} alt="" fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                                  {u.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="font-extrabold text-slate-900">{u.fullName || u.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600">
                          {u.university || u.organization || '—'}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                        <td className="p-3.5">
                          <Link
                            href={`/dashboard/profile?email=${u.email}`}
                            className="font-bold text-brand-600 hover:underline"
                          >
                            View &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Notifications & Dispatch Engine</h3>
                  <p className="text-xs text-slate-500">In-app notifications and real-time delivery logs.</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Notification Dispatch Engine is Active & Operational</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real events (Link Requests, Link Acceptance, Project Applications, Meetup Registrations) automatically generate database records in MongoDB and trigger live in-app badge updates.
                </p>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS & DB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Database & System Maintenance</h3>
                  <p className="text-xs text-slate-500">Manage MongoDB state, seed records, and clean dummy data.</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">Purge Dummy Data</h4>
                <p className="text-xs text-slate-600">
                  Clean any mock or test records from collections while preserving the Admin account and real user profiles.
                </p>
                <button
                  onClick={async () => {
                    if (!confirm('Purge dummy records and clean database?')) return;
                    const res = await fetch('/api/admin/clean-dummy-data', { method: 'POST' });
                    const d = await res.json();
                    alert(d.message || 'Database cleaned.');
                    loadAllData();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Clean Dummy Data
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE PROJECT MODAL WITH POSTER UPLOAD */}
      {createProjectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Create BUILD Project</h3>
              <button onClick={() => setCreateProjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Poster Upload Area */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Project Poster / Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    {projPosterUrl ? (
                      <Image src={projPosterUrl} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Poster</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      ref={projectFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPoster(file, 'project', setProjPosterUrl, setUploadingProjPoster);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => projectFileInputRef.current?.click()}
                      disabled={uploadingProjPoster}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-brand-600"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingProjPoster ? 'Uploading...' : 'Upload Project Poster'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Autonomous Campus Robot"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Field</label>
                  <input
                    type="text"
                    value={projField}
                    onChange={(e) => setProjField(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Team Size</label>
                  <input
                    type="number"
                    value={projTeamSize}
                    onChange={(e) => setProjTeamSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What are we building? *</label>
                <input
                  type="text"
                  required
                  value={projBuilding}
                  onChange={(e) => setProjBuilding(e.target.value)}
                  placeholder="e.g. LiDAR-based navigation system for campus delivery"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Statement</label>
                <textarea
                  rows={2}
                  value={projProblem}
                  onChange={(e) => setProjProblem(e.target.value)}
                  placeholder="Problem this project solves..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={projSkills}
                  onChange={(e) => setProjSkills(e.target.value)}
                  placeholder="e.g. Python, ROS 2, C++"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateProjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  Save & Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MEETUP MODAL WITH POSTER UPLOAD */}
      {createMeetupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Create MEETUP Session</h3>
              <button onClick={() => setCreateMeetupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetup} className="space-y-4">
              {/* Poster Upload Area */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Meetup Poster / Banner</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    {meetPosterUrl ? (
                      <Image src={meetPosterUrl} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Poster</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      ref={meetupFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPoster(file, 'meetup', setMeetPosterUrl, setUploadingMeetPoster);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => meetupFileInputRef.current?.click()}
                      disabled={uploadingMeetPoster}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-brand-600"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingMeetPoster ? 'Uploading...' : 'Upload Meetup Poster'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  placeholder="e.g. Breaking into AI Engineering & LLM Architecture"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Speaker Name *</label>
                  <input
                    type="text"
                    required
                    value={meetSpeaker}
                    onChange={(e) => setMeetSpeaker(e.target.value)}
                    placeholder="e.g. Dr. Salman Khan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Speaker Role / Org</label>
                  <input
                    type="text"
                    value={meetRole}
                    onChange={(e) => setMeetRole(e.target.value)}
                    placeholder="e.g. Lead AI Scientist"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={meetStartTime}
                    onChange={(e) => setMeetStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={meetCapacity}
                    onChange={(e) => setMeetCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={meetShortDesc}
                  onChange={(e) => setMeetShortDesc(e.target.value)}
                  placeholder="Summary of what students will learn..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateMeetupOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  Publish Meetup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXPERIENCE MODAL WITH POSTER UPLOAD & QUESTIONNAIRE */}
      {createExperienceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Create EXPERIENCE Lab</h3>
              <button onClick={() => setCreateExperienceOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExperience} className="space-y-4">
              {/* Poster Upload Area */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Experience Poster / Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    {expPosterUrl ? (
                      <Image src={expPosterUrl} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Poster</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      ref={experienceFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPoster(file, 'experience', setExpPosterUrl, setUploadingExpPoster);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => experienceFileInputRef.current?.click()}
                      disabled={uploadingExpPoster}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-brand-600"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingExpPoster ? 'Uploading...' : 'Upload Poster'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Immersion Title *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Systems Engineering Day at TechHQ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Host Organization *</label>
                  <input
                    type="text"
                    required
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="e.g. Systems Limited"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Venue</label>
                  <input
                    type="text"
                    value={expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    placeholder="e.g. Karachi Office"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={expCapacity}
                    onChange={(e) => setExpCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Questionnaire Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Enrollment Questionnaire</label>
                  <button
                    type="button"
                    onClick={() =>
                      setExpQuestions([
                        ...expQuestions,
                        { id: Date.now().toString(), questionText: '', questionType: 'short-text', required: true },
                      ])
                    }
                    className="text-[11px] font-bold text-brand-600 hover:underline"
                  >
                    + Add Question
                  </button>
                </div>

                {expQuestions.map((q, idx) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...expQuestions];
                        updated[idx].questionText = e.target.value;
                        setExpQuestions(updated);
                      }}
                      placeholder={`Question ${idx + 1}...`}
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setExpQuestions(expQuestions.filter((item) => item.id !== q.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateExperienceOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  Publish Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
