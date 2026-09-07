'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Hammer,
  Building2,
  Compass,
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
  Sliders,
  Bell,
  Menu,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

// ── Types ──────────────────────────────────────────────────────────────────

type AdminTab =
  | 'overview'
  | 'meet'
  | 'build'
  | 'experience'
  | 'access'
  | 'showcase'
  | 'ambassadors'
  | 'campus-pulse'
  | 'partners'
  | 'notifications'
  | 'analytics'
  | 'students'
  | 'settings';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real Database Collections
  const [stats, setStats] = useState({
    studentsCount: 0,
    professionalsCount: 0,
    meetRequestsCount: 0,
    pendingMeetsCount: 0,
    activeProjectsCount: 0,
    pendingProjectsCount: 0,
    experiencesCount: 0,
    accessEventsCount: 0,
    pendingApplicationsCount: 0,
    pendingAmbassadorsCount: 0,
  });

  const [meets, setMeets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [accessEvents, setAccessEvents] = useState<any[]>([]);
  const [ambassadorApps, setAmbassadorApps] = useState<any[]>([]);
  const [campusDemands, setCampusDemands] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Modals & Action States
  const [selectedMeet, setSelectedMeet] = useState<any | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [mentorRole, setMentorRole] = useState('');
  const [meetDate, setMeetDate] = useState('Tomorrow, 5:00 PM');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/apt-session');

  // Build Review Modal
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Experience Modal
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expCategory, setExpCategory] = useState('Software House');
  const [expDate, setExpDate] = useState('');
  const [expTime, setExpTime] = useState('02:00 PM - 05:00 PM');
  const [expLocation, setExpLocation] = useState('');
  const [expCity, setExpCity] = useState('Karachi');
  const [expCapacity, setExpCapacity] = useState(20);
  const [expDescription, setExpDescription] = useState('');
  const [expEligibility, setExpEligibility] = useState('Open to all CS & Engineering students');

  // Access Modal
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accTitle, setAccTitle] = useState('');
  const [accCategory, setAccCategory] = useState('Meetup');
  const [accDate, setAccDate] = useState('');
  const [accTime, setAccTime] = useState('06:00 PM');
  const [accFormat, setAccFormat] = useState('Online');
  const [accVenue, setAccVenue] = useState('https://meet.google.com/apt-event');
  const [accPartner, setAccPartner] = useState('Aptivo Connect');
  const [accPerks, setAccPerks] = useState('');
  const [accDescription, setAccDescription] = useState('');

  // Partner Modal
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partOrg, setPartOrg] = useState('');
  const [partType, setPartType] = useState('Company');
  const [partContact, setPartContact] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partCity, setPartCity] = useState('Karachi');
  const [partProvides, setPartProvides] = useState('');
  const [partNotes, setPartNotes] = useState('');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Notification Banner
  const [bannerMsg, setBannerMsg] = useState('');

  // Data Loading
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        meetsRes,
        projectsRes,
        expRes,
        accRes,
        ambRes,
        demRes,
        partRes,
        logsRes,
        studRes,
      ] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/meet'),
        fetch('/api/build'),
        fetch('/api/experience'),
        fetch('/api/access'),
        fetch('/api/ambassador/applications'),
        fetch('/api/ambassador'),
        fetch('/api/admin/partners'),
        fetch('/api/notifications/dispatch'),
        fetch('/api/admin/students'),
      ]);

      const [
        statsData,
        meetsData,
        projectsData,
        expData,
        accData,
        ambData,
        demData,
        partData,
        logsData,
        studData,
      ] = await Promise.all([
        statsRes.json(),
        meetsRes.json(),
        projectsRes.json(),
        expRes.json(),
        accRes.json(),
        ambRes.json(),
        demRes.json(),
        partRes.json(),
        logsRes.json(),
        studRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (meetsData.meets) setMeets(meetsData.meets);
      if (projectsData.projects) setProjects(projectsData.projects);
      if (expData.experiences) setExperiences(expData.experiences);
      if (accData.events) setAccessEvents(accData.events);
      if (ambData.applications) setAmbassadorApps(ambData.applications);
      if (demData.demands) setCampusDemands(demData.demands);
      if (partData.partners) setPartners(partData.partners);
      if (logsData.logs) setDispatchLogs(logsData.logs);
      if (studData.users) setStudentsList(studData.users);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 3000);
  };

  // ── MEET Actions ─────────────────────────────────────────────────────────

  const handleScheduleMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeet) return;

    try {
      const res = await fetch('/api/meet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMeet._id,
          status: 'Scheduled',
          mentorAssigned: {
            name: mentorName,
            role: mentorRole,
            company: 'Industry Partner',
          },
          scheduledDate: meetDate,
          meetingLink: meetLink,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleModalOpen(false);
        setSelectedMeet(null);
        showBanner('Connection scheduled and student notified!');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkMeetCompleted = async (meetId: string) => {
    try {
      const res = await fetch('/api/meet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: meetId, status: 'Completed' }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner('Session marked completed!');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── BUILD Actions ────────────────────────────────────────────────────────

  const handleProjectDecision = async (projectId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch('/api/build', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedProject(null);
        showBanner(`Project marked as ${status}!`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishToShowcase = async (projectId: string) => {
    try {
      const res = await fetch('/api/build', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          status: 'Showcase',
          isAptivoVerified: true,
          showcase: {
            isLive: true,
            summary: 'Verified real-world student outcome delivered through Aptivo Connect.',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner('Project published live to Showcase with Verified Badge!');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── EXPERIENCE Actions ───────────────────────────────────────────────────

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
          capacity: expCapacity,
          description: expDescription,
          eligibility: expEligibility,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExperienceModalOpen(false);
        setExpTitle('');
        setExpCompany('');
        setExpDescription('');
        showBanner('New Experience created and published!');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await fetch(`/api/experience?id=${id}`, { method: 'DELETE' });
      showBanner('Experience deleted.');
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // ── ACCESS Actions ───────────────────────────────────────────────────────

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: accTitle,
          category: accCategory,
          date: accDate,
          time: accTime,
          format: accFormat,
          linkOrVenue: accVenue,
          partnerName: accPartner,
          perks: accPerks,
          description: accDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessModalOpen(false);
        setAccTitle('');
        setAccDescription('');
        showBanner('Access opportunity created!');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccess = async (id: string) => {
    try {
      await fetch(`/api/access?id=${id}`, { method: 'DELETE' });
      showBanner('Access opportunity removed.');
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // ── AMBASSADOR Actions ───────────────────────────────────────────────────

  const handleAmbassadorDecision = async (
    applicationId: string,
    status: 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected'
  ) => {
    try {
      const res = await fetch('/api/ambassador/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Ambassador application marked as ${status}!`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── PARTNER Actions ──────────────────────────────────────────────────────

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: partOrg,
          type: partType,
          contactPerson: partContact,
          contactEmail: partEmail,
          contactPhone: partPhone,
          city: partCity,
          whatTheyProvide: partProvides,
          internalNotes: partNotes,
          partnershipStatus: 'Active',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPartnerModalOpen(false);
        setPartOrg('');
        setPartContact('');
        setPartEmail('');
        setPartProvides('');
        setPartNotes('');
        showBanner('Internal Partner CRM record saved.');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── PURGE DUMMY DATA ─────────────────────────────────────────────────────

  const handlePurgeDummyData = async () => {
    try {
      const res = await fetch('/api/admin/clean-dummy-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showBanner('Dummy data purged! Database now in clean state.');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Navigation Items ─────────────────────────────────────────────────────

  const navItems: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'meet', label: 'Meet', icon: Users, count: stats.pendingMeetsCount },
    { id: 'build', label: 'Build', icon: Hammer, count: stats.pendingProjectsCount },
    { id: 'experience', label: 'Experience', icon: Building2, count: stats.experiencesCount },
    { id: 'access', label: 'Access', icon: Compass, count: stats.accessEventsCount },
    { id: 'showcase', label: 'Showcase', icon: Award },
    { id: 'ambassadors', label: 'Ambassador Apps', icon: Radio, count: stats.pendingAmbassadorsCount },
    { id: 'campus-pulse', label: 'Campus Pulse', icon: Building, count: campusDemands.length },
    { id: 'partners', label: 'Partners CRM', icon: ShieldCheck, count: partners.length },
    { id: 'students', label: 'Students Directory', icon: UserCheck, count: stats.studentsCount },
    { id: 'notifications', label: 'Dispatch Logs', icon: MessageSquare, count: dispatchLogs.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F2] text-slate-900 flex flex-col font-sans">
      {/* ── Top Bar ── */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-500 text-darkpine-950 flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Aptivo <span className="text-brand-600">Operations</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                HQ Live
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            title="Refresh database state"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            Student View &rarr;
          </Link>

          <Link
            href="/auth/login"
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-xs transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Banner */}
      {bannerMsg && (
        <div className="bg-brand-500 text-darkpine-950 text-xs font-bold py-2 px-4 text-center sticky top-16 z-40 animate-in slide-in-from-top-2 shadow-md">
          {bannerMsg}
        </div>
      )}

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Navigation Sidebar */}
        <aside className="w-64 bg-[#13231c] border-r border-emerald-950/40 p-4 hidden lg:flex flex-col justify-between shrink-0 overflow-y-auto my-4 ml-4 rounded-3xl shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-3 py-2">
              Operations Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-darkpine-950 shadow-md shadow-brand-500/20 translate-x-1'
                      : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-darkpine-950' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-darkpine-950 text-brand-300'
                          : 'bg-emerald-900/90 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-950/60 border border-emerald-900/40 rounded-2xl text-[11px] text-emerald-300/80 space-y-1 mt-4">
            <p className="font-bold text-slate-900">Aptivo Connect v3.0</p>
            <p className="text-[10px]">Connected to MongoDB Atlas</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative bg-[#13231c] w-64 p-4 flex flex-col justify-between border-r border-emerald-950/40 z-50">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-emerald-900/60">
                  <span className="font-bold text-slate-900 text-sm">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-emerald-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold ${
                        isActive
                          ? 'bg-brand-500 text-darkpine-950'
                          : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-darkpine-950' : 'text-emerald-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/90 text-emerald-300 border border-emerald-800">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              1. OVERVIEW TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Header Greeting Gradient Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-darkpine-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-950/40">
                <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span>Aptivo Operations Control Hub</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Operations Management Console
                    </h1>
                    <p className="text-xs text-emerald-200/80 mt-1 max-w-xl">
                      Central control for mentor scheduling, student project validations, workplace visits, and campus ambassador networks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 bg-emerald-950/80 border border-emerald-800/60 px-4 py-2.5 rounded-2xl shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-300 font-bold">All Systems Live</span>
                  </div>
                </div>
              </div>

              {/* Real Database Top Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {[
                  { label: 'Total Students', value: stats.studentsCount, icon: Users, color: 'text-slate-900', bg: 'bg-slate-100 text-slate-700' },
                  { label: 'Pending Meets', value: stats.pendingMeetsCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-700' },
                  { label: 'Active Projects', value: stats.activeProjectsCount, icon: Hammer, color: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-700' },
                  { label: 'Experiences', value: stats.experiencesCount, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 text-blue-700' },
                  { label: 'Access Events', value: stats.accessEventsCount, icon: Compass, color: 'text-purple-600', bg: 'bg-purple-100 text-purple-700' },
                  { label: 'Pending Apps', value: stats.pendingAmbassadorsCount + stats.pendingProjectsCount, icon: Radio, color: 'text-rose-600', bg: 'bg-rose-100 text-rose-700' },
                ].map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-3 hover:border-brand-300 hover:shadow-soft transition-all shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {m.label}
                        </span>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${m.bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className={`text-2xl sm:text-3xl font-black ${m.color}`}>{m.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pending Actions Section */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Pending Actions Queue</span>
                </h3>

                {stats.pendingMeetsCount === 0 &&
                stats.pendingProjectsCount === 0 &&
                stats.pendingAmbassadorsCount === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-extrabold text-slate-900 text-base">All Caught Up!</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      There are no pending meet requests, unapproved projects, or ambassador applications awaiting action.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Meet Requests Action */}
                    {stats.pendingMeetsCount > 0 && (
                      <div className="bg-white border border-amber-300 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {stats.pendingMeetsCount} Meet Requests Pending
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">Assign Mentors & Schedule</h4>
                          <p className="text-xs text-slate-500">
                            Students have submitted 1:1 meeting connection requests waiting for mentor matching.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('meet')}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-darkpine-950 font-bold text-xs"
                        >
                          Review Meet Requests &rarr;
                        </button>
                      </div>
                    )}

                    {/* Project Approval Action */}
                    {stats.pendingProjectsCount > 0 && (
                      <div className="bg-white border border-brand-300 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold">
                            {stats.pendingProjectsCount} Project Proposals
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">Review Student Proposals</h4>
                          <p className="text-xs text-slate-500">
                            Validate project scope, required skills, and approve for team applications.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('build')}
                          className="w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs"
                        >
                          Review Project Briefs &rarr;
                        </button>
                      </div>
                    )}

                    {/* Ambassador Applications Action */}
                    {stats.pendingAmbassadorsCount > 0 && (
                      <div className="bg-white border border-purple-300 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            {stats.pendingAmbassadorsCount} Ambassador Applications
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">Review Campus Candidates</h4>
                          <p className="text-xs text-slate-500">
                            Review student leadership experience and grant Campus Pulse portal access.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('ambassadors')}
                          className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs"
                        >
                          Review Applications &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              2. MEET OPERATIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'meet' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">MEET Connection Operations</h2>
                  <p className="text-xs text-slate-500">
                    Review student requests, match with verified mentors, and schedule Google Meet sessions.
                  </p>
                </div>
              </div>

              {meets.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Meet Requests Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Student connection requests will appear here as students submit them from their dashboard.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-4">Student</th>
                          <th className="p-4">Requested Field</th>
                          <th className="p-4">Discussion Topic</th>
                          <th className="p-4">Format</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {meets.map((m) => (
                          <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-semibold text-slate-900">
                              <div>{m.studentName || 'Student'}</div>
                              <div className="text-[10px] text-slate-500">{m.studentUniversity || 'University'}</div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {m.field}
                              </span>
                            </td>
                            <td className="p-4 max-w-xs truncate text-slate-600">{m.discussionTopic}</td>
                            <td className="p-4">{m.format} ({m.preference})</td>
                            <td className="p-4">
                              <StatusPill status={m.status} size="sm" />
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {m.status !== 'Scheduled' && m.status !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    setSelectedMeet(m);
                                    setScheduleModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs shadow-xs"
                                >
                                  Schedule Session
                                </button>
                              )}
                              {m.status === 'Scheduled' && (
                                <button
                                  onClick={() => handleMarkMeetCompleted(m._id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              3. BUILD OPERATIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'build' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">BUILD Project Review & Sprints</h2>
                  <p className="text-xs text-slate-500">
                    Approve proposals, monitor active 6-week sprints, and verify finished outcomes for public showcase.
                  </p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Hammer className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Projects Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Approved student proposals and active teams will appear here once submitted.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-600 text-[10px] font-bold uppercase">
                            {p.field}
                          </span>
                          <StatusPill status={p.status} size="sm" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{p.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.problem || p.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.requiredSkills?.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-600 text-[9px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 truncate">{p.ownerName}</span>
                        <div className="flex items-center gap-1.5">
                          {p.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleProjectDecision(p._id, 'Approved')}
                                className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleProjectDecision(p._id, 'Rejected')}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.status === 'Active' && (
                            <button
                              onClick={() => handlePublishToShowcase(p._id)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                            >
                              Publish to Showcase
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              4. EXPERIENCE OPERATIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">EXPERIENCE Management</h2>
                  <p className="text-xs text-slate-500">
                    Schedule workplace immersions, software house visits, and research lab walkthroughs.
                  </p>
                </div>
                <button
                  onClick={() => setExperienceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs shadow-md shadow-brand-500/20 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Experience</span>
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Experiences Scheduled</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Use the button above to publish your first workplace immersion or lab walkthrough.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {experiences.map((exp) => (
                    <div
                      key={exp._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {exp.category}
                          </span>
                          <span className="text-xs font-mono text-slate-600 font-bold">
                            {exp.enrolledStudents?.length || 0} / {exp.capacity} Seats Filled
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{exp.title}</h4>
                        <p className="text-xs font-semibold text-brand-400">{exp.company} · {exp.city}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{exp.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exp.date} ({exp.time})</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{exp.status}</span>
                        <button
                          onClick={() => handleDeleteExperience(exp._id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              5. ACCESS OPERATIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'access' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">ACCESS Opportunities & Perks</h2>
                  <p className="text-xs text-slate-500">
                    Publish tech meetups, seminars, tool credits, and platform perks.
                  </p>
                </div>
                <button
                  onClick={() => setAccessModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs shadow-md shadow-brand-500/20 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Access Event</span>
                </button>
              </div>

              {accessEvents.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Compass className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Access Events Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Publish tech talks, seminars, and developer perks for the student community.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accessEvents.map((acc) => (
                    <div
                      key={acc._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            {acc.category} · {acc.format}
                          </span>
                          <span className="text-xs font-mono text-slate-600 font-bold">
                            {acc.registrations?.length || 0} RSVPs
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{acc.title}</h4>
                        <p className="text-xs font-semibold text-purple-400">By {acc.partnerName}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{acc.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{acc.date} ({acc.time})</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{acc.status}</span>
                        <button
                          onClick={() => handleDeleteAccess(acc._id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              6. SHOWCASE SUBMISSIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'showcase' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Public Showcase Gallery Verification</h2>
                  <p className="text-xs text-slate-500">
                    Review and verify completed student outcomes before publishing live to /showcase.
                  </p>
                </div>
                <Link
                  href="/showcase"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:underline"
                >
                  <span>View Live Showcase Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {projects.filter((p) => p.status === 'Showcase').length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Award className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Showcased Projects Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When students finish their BUILD sprints, you can verify and publish their projects here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects
                    .filter((p) => p.status === 'Showcase')
                    .map((proj) => (
                      <div
                        key={proj._id}
                        className="bg-white border border-emerald-500/40 rounded-3xl p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Aptivo Verified
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {proj.field}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{proj.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{proj.problem || proj.description}</p>
                        <p className="text-[11px] text-slate-500">Lead: {proj.ownerName} ({proj.ownerUniversity})</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              7. AMBASSADOR APPLICATIONS REVIEW TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'ambassadors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Ambassador Program Applications</h2>
                  <p className="text-xs text-slate-500">
                    Review candidate applications. Only accepted applicants gain access to the Campus Pulse portal.
                  </p>
                </div>
              </div>

              {ambassadorApps.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Radio className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Ambassador Applications Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Student applications will appear here when submitted from the Ambassador Program page.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ambassadorApps.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-base">{app.fullName}</span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              app.status === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-500/30'
                                : app.status === 'Shortlisted'
                                ? 'bg-amber-100 text-amber-800 border border-amber-500/30'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-500/30'
                                : 'bg-purple-100 text-purple-800 border border-purple-500/30'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-brand-400 font-semibold">
                          Represents: {app.campusOrCommunity}
                        </p>
                        <p className="text-xs text-slate-500">
                          {app.university} · {app.degree} ({app.city})
                        </p>

                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-600">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Why Ambassador:
                          </p>
                          <p className="italic">&ldquo;{app.whyAmbassador}&rdquo;</p>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-600">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Leadership Experience:
                          </p>
                          <p>&ldquo;{app.leadershipExperience}&rdquo;</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {app.status !== 'Shortlisted' && app.status !== 'Accepted' && (
                            <button
                              onClick={() => handleAmbassadorDecision(app._id, 'Shortlisted')}
                              className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'Accepted' && (
                            <button
                              onClick={() => handleAmbassadorDecision(app._id, 'Accepted')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Accept & Activate
                            </button>
                          )}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() => handleAmbassadorDecision(app._id, 'Rejected')}
                              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              8. CAMPUS PULSE DEMAND TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'campus-pulse' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Campus Pulse Intelligence</h2>
                  <p className="text-xs text-slate-500">
                    Real student demand reported by approved ambassadors on the ground.
                  </p>
                </div>
              </div>

              {campusDemands.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <Building className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Campus Pulse Reports Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Approved ambassadors report student demand, requested mentors, and team needs from their campus portal.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campusDemands.map((dem) => (
                    <div
                      key={dem._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-600 font-bold text-[10px] uppercase">
                          {dem.category} · ~{dem.studentCountEstimate} Students
                        </span>
                        <StatusPill status={dem.status} size="sm" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{dem.title}</h4>
                      <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                        &ldquo;{dem.description}&rdquo;
                      </p>
                      <p className="text-[11px] text-brand-400 font-semibold">{dem.university}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              9. INTERNAL PARTNERS CRM TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'partners' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Internal Partners CRM</h2>
                  <p className="text-xs text-slate-500">
                    Internal operational database of companies, labs, and universities providing opportunities.
                  </p>
                </div>
                <button
                  onClick={() => setPartnerModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold text-xs shadow-md shadow-brand-500/20 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partner Record</span>
                </button>
              </div>

              {partners.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Partner Records Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add external companies, research labs, or tech communities that collaborate with Aptivo Connect.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map((part) => (
                    <div
                      key={part._id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-5 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-base truncate">
                            {part.organizationName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {part.partnershipStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{part.type} · {part.city}</p>
                        <div className="text-xs text-slate-600 space-y-1 pt-1">
                          <p><strong>Contact:</strong> {part.contactPerson}</p>
                          <p className="truncate"><strong>Email:</strong> {part.contactEmail}</p>
                          {part.contactPhone && <p><strong>Phone:</strong> {part.contactPhone}</p>}
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 text-xs text-slate-600 border border-slate-800">
                          <strong className="text-slate-400 text-[10px] uppercase block">Provides:</strong>
                          {part.whatTheyProvide}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              10. STUDENTS & USERS DIRECTORY TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Registered Students Directory</h2>
                  <p className="text-xs text-slate-500">
                    Real user accounts registered on Aptivo Connect with verified profile data.
                  </p>
                </div>
              </div>

              {studentsList.filter((u) => u.role !== 'admin').length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Students Registered Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    New student accounts created through /auth/register will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden shadow-soft">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email / Contact</th>
                        <th className="p-4">University & Degree</th>
                        <th className="p-4">City</th>
                        <th className="p-4">Skills</th>
                        <th className="p-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentsList
                        .filter((u) => u.role !== 'admin')
                        .map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900">
                              {u.fullName || u.name}
                            </td>
                            <td className="p-4">
                              <div>{u.email}</div>
                              <div className="text-[10px] text-slate-500">{u.phone || u.whatsapp || 'â€”'}</div>
                            </td>
                            <td className="p-4">
                              <div>{u.university || 'â€”'}</div>
                              <div className="text-[10px] text-slate-500">{u.degree || u.field || 'â€”'}</div>
                            </td>
                            <td className="p-4">{u.city || 'Karachi'}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-600 font-bold text-[10px]">
                                {u.skills?.length || 0} Skills
                              </span>
                            </td>
                            <td className="p-4 text-right text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              11. NOTIFICATIONS DISPATCH LOGS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Multi-Channel Dispatch Logs</h2>
                  <p className="text-xs text-slate-500">
                    Live logs of In-App alerts, WhatsApp template previews, and Email triggers.
                  </p>
                </div>
              </div>

              {dispatchLogs.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 shadow-soft rounded-3xl p-12 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">No Notifications Dispatched Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When events trigger across MEET, BUILD, or EXPERIENCE, notification logs will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dispatchLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-500/30 text-[10px] font-bold font-mono">
                            {log.eventType}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{log.recipientName}</span>
                          <span className="text-xs text-slate-500">({log.recipientEmail})</span>
                        </div>
                        <pre className="text-[11px] text-slate-600 font-mono bg-slate-950 p-3 rounded-xl whitespace-pre-wrap border border-slate-800">
                          {log.whatsAppMessagePreview}
                        </pre>
                      </div>
                      <div className="flex md:flex-col items-end gap-1 shrink-0 text-[11px]">
                        <span className="text-emerald-400 font-bold">âœ“ WhatsApp</span>
                        <span className="text-blue-400 font-bold">âœ“ Email</span>
                        <span className="text-brand-400 font-bold">âœ“ In-App</span>
                        <span className="text-slate-500 mt-1">
                          {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              12. ANALYTICS & FUNNELS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Platform Performance Analytics</h2>
                  <p className="text-xs text-slate-500">
                    Real metrics and conversion funnels computed purely from database records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-3xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">North Star</p>
                  <p className="text-3xl font-black text-slate-900">
                    {meets.filter((m) => m.status === 'Completed').length +
                      projects.filter((p) => p.status === 'Showcase').length}
                  </p>
                  <p className="text-xs text-emerald-300 font-semibold">Opportunities Delivered</p>
                </div>
                <div className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-3xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Signups</p>
                  <p className="text-3xl font-black text-slate-900">{stats.studentsCount}</p>
                  <p className="text-xs text-slate-500">Total Registered Users</p>
                </div>
                <div className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-3xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Partners</p>
                  <p className="text-3xl font-black text-blue-400">{partners.length}</p>
                  <p className="text-xs text-slate-500">Internal CRM Orgs</p>
                </div>
              </div>
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              13. SETTINGS & DATA CLEANUP TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Admin Operations Settings</h2>
                  <p className="text-xs text-slate-500">
                    System health diagnostics and database maintenance tools.
                  </p>
                </div>
              </div>

              {/* Data Cleanup Tool Card */}
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Purge Dummy / Seed Data</span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      Removes any seeded demo students, fake projects, fake experiences, and fake analytics while keeping your real Admin account completely intact.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: 'Purge all dummy seed data?',
                        message:
                          'This will clean out all old fake records across meetings, projects, and experiences, ensuring your platform only displays real data and clean empty states. Your Admin account will be preserved.',
                        onConfirm: handlePurgeDummyData,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs font-bold shrink-0 transition-all"
                  >
                    Purge Dummy Data
                  </button>
                </div>
              </div>

              {/* System Diagnostics */}
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">System Diagnostics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Admin Account</span>
                    <span className="text-white font-mono font-bold">admin@connect.aptivo</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Environment</span>
                    <span className="text-emerald-400 font-mono font-bold">Next.js 14 App Router + MongoDB Atlas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODALS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

      {/* Schedule Meet Modal */}
      {scheduleModalOpen && selectedMeet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base">Schedule Google Meet Connection</h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeet} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Assigned Mentor Name *</label>
                <input
                  required
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="e.g. Dr. Ahmed Khan"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Mentor Role & Company</label>
                <input
                  value={mentorRole}
                  onChange={(e) => setMentorRole(e.target.value)}
                  placeholder="e.g. Lead AI Scientist, 10Pearls"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Date & Time</label>
                  <input
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Google Meet URL *</label>
                  <input
                    required
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold"
                >
                  Confirm & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Experience Modal */}
      {experienceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base">Create Workplace / Lab Experience</h3>
              <button onClick={() => setExperienceModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExperience} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Experience Title *</label>
                <input
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. 10Pearls Cloud & AI Immersion Walkthrough"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Host Company / Lab *</label>
                  <input
                    required
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="e.g. 10Pearls / NCRA"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Software House">Software House</option>
                    <option value="Research Lab">Research Lab</option>
                    <option value="Startup Office">Startup Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Date *</label>
                  <input
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="e.g. Sep 15, 2026"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Time</label>
                  <input
                    value={expTime}
                    onChange={(e) => setExpTime(e.target.value)}
                    placeholder="e.g. 02:00 PM - 05:00 PM"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">City</label>
                  <input
                    value={expCity}
                    onChange={(e) => setExpCity(e.target.value)}
                    placeholder="Karachi"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    value={expCapacity}
                    onChange={(e) => setExpCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Overview of the workplace immersion..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExperienceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold"
                >
                  Publish Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Access Event Modal */}
      {accessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base">Create ACCESS Opportunity</h3>
              <button onClick={() => setAccessModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccess} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Title *</label>
                <input
                  required
                  value={accTitle}
                  onChange={(e) => setAccTitle(e.target.value)}
                  placeholder="e.g. AI Founder AMA with Indus Valley Capital"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={accCategory}
                    onChange={(e) => setAccCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Meetup">Developer Meetup</option>
                    <option value="Seminar">Seminar / Panel</option>
                    <option value="Perk">Platform Tool Perk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Format</label>
                  <select
                    value={accFormat}
                    onChange={(e) => setAccFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Online">Online Webinar</option>
                    <option value="In-Person">In-Person Campus Session</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Date *</label>
                  <input
                    required
                    value={accDate}
                    onChange={(e) => setAccDate(e.target.value)}
                    placeholder="Sep 20, 2026"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Venue / Online Link</label>
                  <input
                    value={accVenue}
                    onChange={(e) => setAccVenue(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={accDescription}
                  onChange={(e) => setAccDescription(e.target.value)}
                  placeholder="Overview of the session..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAccessModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base">Add Partner CRM Record</h3>
              <button onClick={() => setPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Organisation Name *</label>
                <input
                  required
                  value={partOrg}
                  onChange={(e) => setPartOrg(e.target.value)}
                  placeholder="e.g. Systems Limited"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Contact Person *</label>
                  <input
                    required
                    value={partContact}
                    onChange={(e) => setPartContact(e.target.value)}
                    placeholder="Farah Asif"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={partEmail}
                    onChange={(e) => setPartEmail(e.target.value)}
                    placeholder="talent@systemsltd.com"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">What They Provide *</label>
                <input
                  required
                  value={partProvides}
                  onChange={(e) => setPartProvides(e.target.value)}
                  placeholder="e.g. Enterprise visits for 20 students"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Internal Notes</label>
                <input
                  value={partNotes}
                  onChange={(e) => setPartNotes(e.target.value)}
                  placeholder="Coordination notes..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-darkpine-950 font-bold"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-sm w-full p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            <h3 className="font-extrabold text-base text-white">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{confirmDialog.message}</p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, open: false });
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


