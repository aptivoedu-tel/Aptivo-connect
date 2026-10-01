'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Users,
  Compass,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

// ── Types ──────────────────────────────────────────────────────────────────

interface IApplication {
  _id: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected';
  fullName: string;
  campusOrCommunity: string;
  whyAmbassador: string;
  joinedAt?: string;
  responsibilities?: string;
  createdAt: string;
}

interface ICampusDemand {
  _id: string;
  campus: string;
  university: string;
  category: string;
  title: string;
  studentCountEstimate: number;
  description: string;
  status: string;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const statusIcon = (status: string) => {
  switch (status) {
    case 'Accepted': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case 'Rejected': return <XCircle className="w-5 h-5 text-rose-400" />;
    case 'Shortlisted': return <Star className="w-5 h-5 text-amber-400" />;
    default: return <Clock className="w-5 h-5 text-slate-400" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'Accepted': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Shortlisted': return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'Rejected': return 'text-rose-700 bg-rose-50 border-rose-200';
    default: return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function AmbassadorPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [application, setApplication] = useState<IApplication | null>(null);
  const [demands, setDemands] = useState<ICampusDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'check' | 'apply' | 'status' | 'portal'>('check');

  // Apply form state
  const [whyAmbassador, setWhyAmbassador] = useState('');
  const [campusOrCommunity, setCampusOrCommunity] = useState('');
  const [leadershipExperience, setLeadershipExperience] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [availability, setAvailability] = useState('5-8 hours/week');
  const [linkedin, setLinkedin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Campus Pulse (demand) form
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [demandTitle, setDemandTitle] = useState('');
  const [demandCategory, setDemandCategory] = useState<'MEET' | 'BUILD' | 'EXPERIENCE' | 'ACCESS'>('MEET');
  const [demandStudentCount, setDemandStudentCount] = useState(20);
  const [demandDescription, setDemandDescription] = useState('');
  const [reportingDemand, setReportingDemand] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────

  const checkApplication = async (email: string) => {
    if (!email) {
      setLoading(false);
      setView('check');
      return;
    }
    try {
      const res = await fetch(`/api/ambassador/apply?userEmail=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.application) {
        setApplication(data.application);
        setView(data.application.status === 'Accepted' ? 'portal' : 'status');
      } else {
        setView('check');
      }
    } catch (e) {
      console.error(e);
      setView('check');
    } finally {
      setLoading(false);
    }
  };

  const fetchDemands = async () => {
    try {
      const res = await fetch('/api/ambassador');
      const data = await res.json();
      if (data.demands) setDemands(data.demands);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }

    if (email) {
      setCurrentUserEmail(email);
      checkApplication(email);
      fetch('/api/profile', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (d.user) {
            if (d.user.whatsapp || d.user.phone) setWhatsapp(d.user.whatsapp || d.user.phone);
            if (d.user.university) setCampusOrCommunity(d.user.campus ? `${d.user.university} (${d.user.campus})` : d.user.university);
            if (d.user.linkedin || d.user.linkedinUrl) setLinkedin(d.user.linkedin || d.user.linkedinUrl);
          }
        })
        .catch(() => {});
    } else {
      setLoading(false);
      setView('check');
    }

    fetchDemands();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) {
      setSubmitError('Please sign in to submit an ambassador application.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/ambassador/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          whyAmbassador,
          campusOrCommunity,
          leadershipExperience,
          whatsapp,
          availability,
          linkedinUrl: linkedin,
          university: '',
          degree: '',
          field: '',
          city: '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
        setView('status');
      } else {
        setSubmitError(data.error || 'Something went wrong.');
        if (data.application) { setApplication(data.application); setView('status'); }
      }
    } catch (e) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) return;
    setReportingDemand(true);
    try {
      await fetch('/api/ambassador/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassadorEmail: currentUserEmail,
          category: demandCategory,
          title: demandTitle,
          studentCountEstimate: demandStudentCount,
          description: demandDescription,
        }),
      });
      setIsReportOpen(false);
      setDemandTitle(''); setDemandDescription('');
      fetchDemands();
    } finally {
      setReportingDemand(false);
    }
  };

  // ── Views ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
        Checking your ambassador status…
      </div>
    );
  }

  // ── VIEW: Landing (not applied) ────────────────────────────────────────

  if (view === 'check') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-[#13231c] rounded-3xl p-8 sm:p-10 space-y-5 border border-emerald-950/60 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Aptivo Connect Ambassador Program</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
            Become the link between your campus and the wider ecosystem.
          </h2>

          <p className="text-sm text-emerald-100/80 leading-relaxed max-w-lg">
            Aptivo Connect Ambassadors are the on-ground intelligence layer of our platform. They understand what students on their campus need — and channel that into real action.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
            {[
              { icon: Users, label: 'Represent your campus', desc: 'Voice what peers actually need' },
              { icon: Compass, label: 'Shape the program', desc: 'Your reports drive real sessions' },
              { icon: Star, label: 'Exclusive access', desc: 'Priority access to all Aptivo events' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1">
                <Icon className="w-4 h-4 text-brand-400" />
                <p className="font-bold text-white text-xs">{label}</p>
                <p className="text-[11px] text-emerald-200/70">{desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView('apply')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-darkpine-950 text-sm font-extrabold shadow-lg shadow-brand-500/30 transition-all"
          >
            <span>Apply to the Ambassador Program</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* How it works */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Application Journey</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            {['Submit Application', 'Aptivo Reviews', 'Shortlisted', 'Accepted', 'Campus Pulse Portal'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-semibold text-slate-800">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: Application Form ─────────────────────────────────────────────

  if (view === 'apply') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Ambassador Program Application</h2>
            <p className="text-sm text-slate-500 mt-0.5">Tell the Aptivo team who you are and what you can do.</p>
          </div>
          <button
            onClick={() => setView('check')}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmitApplication} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Why do you want to become an Aptivo Connect Ambassador? *
              </label>
              <textarea required rows={4} value={whyAmbassador} onChange={(e) => setWhyAmbassador(e.target.value)}
                placeholder="Tell us your motivation — what you see on your campus and what you want to change or amplify."
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Which campus or community would you represent? *
              </label>
              <input required value={campusOrCommunity} onChange={(e) => setCampusOrCommunity(e.target.value)}
                placeholder="e.g. FAST-NUCES Karachi Main Campus / IBA Karachi / Tech community in Lahore"
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Previous community or leadership experience *
              </label>
              <textarea required rows={3} value={leadershipExperience} onChange={(e) => setLeadershipExperience(e.target.value)}
                placeholder="e.g. Lead organiser at FAST Tech Week 2025, Club president at ACM FAST Karachi, ran 3 hackathons…"
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number *</label>
                <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Weekly Availability *</label>
                <select required value={availability} onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                >
                  <option value="">Select…</option>
                  <option value="2-4 hours/week">2–4 hours / week</option>
                  <option value="4-8 hours/week">4–8 hours / week</option>
                  <option value="8+ hours/week">8+ hours / week</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">LinkedIn Profile URL (optional)</label>
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Your student account remains unchanged. Ambassador access is granted separately on approval.
            </p>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── VIEW: Application Status (not yet accepted) ────────────────────────

  if (view === 'status' && application) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Your Ambassador Application</h2>
            {statusIcon(application.status)}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${statusColor(application.status)}`}>
            <span>{application.status}</span>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            {['Submitted', 'Under Review', 'Shortlisted', 'Accepted'].map((step) => {
              const statuses = ['Submitted', 'Under Review', 'Shortlisted', 'Accepted'];
              const isRejected = (application.status as string) === 'Rejected';
              const currentIdx = statuses.indexOf(application.status);
              const stepIdx = statuses.indexOf(step);
              const isDone = !isRejected && stepIdx <= currentIdx;
              const isCurrent = !isRejected && step === application.status;

              return (
                <div key={step} className={`flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all ${
                  isCurrent ? 'bg-brand-50 border-brand-200 font-bold text-brand-900' :
                  isDone ? 'bg-slate-50 border-slate-100 text-slate-600' :
                  'bg-white border-slate-100 text-slate-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                    isDone ? 'bg-brand-500 text-white' : 'bg-slate-200'
                  }`}>
                    {isDone && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span>{step}</span>
                  {isCurrent && <span className="ml-auto text-[10px] text-brand-600 font-bold animate-pulse">← You are here</span>}
                </div>
              );
            })}

            {application.status === 'Rejected' && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Application not progressed at this time</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <p><strong>Submitted by:</strong> {application.fullName}</p>
            <p><strong>Representing:</strong> {application.campusOrCommunity}</p>
            <p><strong>Applied on:</strong> {new Date(application.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            The Aptivo team will notify you of any updates via in-app notification and email.
          </p>
        </div>
      </div>
    );
  }

  // ── VIEW: Campus Pulse Portal (Accepted Ambassadors Only) ──────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-900 text-xs font-bold mb-2 border border-brand-200">
            <Radio className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Ambassador Program — Campus Pulse</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">Active</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Pulse</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            You are an active Aptivo Connect Ambassador. Report what students on your campus need — your intelligence drives real opportunities.
          </p>
          {application?.campusOrCommunity && (
            <p className="text-xs font-semibold text-brand-700 mt-1">
              Representing: {application.campusOrCommunity}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Report Campus Demand
        </button>
      </div>

      {/* Submitted Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Your Campus Reports</h3>
          <span className="text-xs text-slate-500">{demands.length} Reports Logged</span>
        </div>

        {demands.length === 0 ? (
          <div className="p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center text-xs text-slate-400 space-y-2">
            <p>No campus reports yet. Use the button above to log the first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demands.map((dm) => (
              <div key={dm._id} className="bg-slate-50 rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                      {dm.category} · ~{dm.studentCountEstimate} Students
                    </span>
                    <StatusPill status={dm.status} size="sm" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">{dm.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-2xl border border-slate-100">
                    &ldquo;{dm.description}&rdquo;
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 flex justify-between">
                  <span>{dm.university}</span>
                  <span>{new Date(dm.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Demand Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report Campus Demand</h3>
                <p className="text-xs text-slate-500 mt-0.5">Direct intelligence to Aptivo Ops.</p>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleReportDemand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pillar Category</label>
                <select value={demandCategory} onChange={(e) => setDemandCategory(e.target.value as typeof demandCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none">
                  <option value="MEET">MEET — Demand for specific mentors/speakers</option>
                  <option value="BUILD">BUILD — Students looking for project collaborators</option>
                  <option value="EXPERIENCE">EXPERIENCE — Demand for company/lab visits</option>
                  <option value="ACCESS">ACCESS — Demand for seminars or tool credits</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demand Summary *</label>
                <input required value={demandTitle} onChange={(e) => setDemandTitle(e.target.value)}
                  placeholder="e.g. 20 FAST students want AI research mentors"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Interested Students</label>
                <input type="number" min={1} max={500} value={demandStudentCount}
                  onChange={(e) => setDemandStudentCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Campus Context *</label>
                <textarea required rows={3} value={demandDescription} onChange={(e) => setDemandDescription(e.target.value)}
                  placeholder="Why are students seeking this? What specific topics or formats would work best?"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setIsReportOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={reportingDemand}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-sm disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" />
                  {reportingDemand ? 'Submitting…' : 'Submit to Aptivo HQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
