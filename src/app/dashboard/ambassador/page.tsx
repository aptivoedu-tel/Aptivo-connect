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
  X,
} from 'lucide-react';

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

const statusIcon = (status: string) => {
  switch (status) {
    case 'Accepted': return <CheckCircle2 className="w-5 h-5 text-[#174D3A]" />;
    case 'Rejected': return <XCircle className="w-5 h-5 text-rose-600" />;
    case 'Shortlisted': return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
    default: return <Clock className="w-5 h-5 text-[#69736D]" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'Accepted': return 'text-[#174D3A] bg-[#E4EEE8] border-[#174D3A]/20';
    case 'Shortlisted': return 'text-amber-900 bg-amber-50 border-amber-200';
    case 'Rejected': return 'text-rose-700 bg-rose-50 border-rose-200';
    default: return 'text-[#69736D] bg-[#F7F6F1] border-[#E4E7E2]';
  }
};

export default function AmbassadorPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [application, setApplication] = useState<IApplication | null>(null);
  const [demands, setDemands] = useState<ICampusDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'check' | 'apply' | 'status' | 'portal'>('check');

  const [whyAmbassador, setWhyAmbassador] = useState('');
  const [campusOrCommunity, setCampusOrCommunity] = useState('');
  const [leadershipExperience, setLeadershipExperience] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [availability, setAvailability] = useState('5-8 hours/week');
  const [linkedin, setLinkedin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [demandTitle, setDemandTitle] = useState('');
  const [demandCategory, setDemandCategory] = useState<'MEET' | 'BUILD' | 'EXPERIENCE' | 'ACCESS'>('MEET');
  const [demandStudentCount, setDemandStudentCount] = useState(20);
  const [demandDescription, setDemandDescription] = useState('');
  const [reportingDemand, setReportingDemand] = useState(false);

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

  if (loading) {
    return (
      <div className="py-20 text-center text-[#69736D] text-[14px] font-sans">
        Checking ambassador status...
      </div>
    );
  }

  if (view === 'check') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="bg-[#174D3A] rounded-[24px] p-8 sm:p-10 space-y-5 text-white shadow-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[12px] font-medium">
            <Radio className="w-3.5 h-3.5 text-[#E4EEE8] animate-pulse" />
            <span>Aptivo Ambassador Program</span>
          </div>

          <h1 className="font-serif font-normal text-[32px] sm:text-[40px] leading-tight text-white">
            Become the link between your campus and the wider ecosystem.
          </h1>

          <p className="text-[14px] text-white/80 leading-relaxed max-w-xl">
            Aptivo Connect Ambassadors are the on-ground intelligence layer of our platform. They understand what students on their campus need — and channel that into real action.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[13px]">
            {[
              { icon: Users, label: 'Represent campus', desc: 'Voice what peers actually need' },
              { icon: Compass, label: 'Shape direction', desc: 'Your reports drive real sessions' },
              { icon: Star, label: 'Exclusive access', desc: 'Priority access to Aptivo events' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 rounded-[14px] p-3.5 border border-white/15 space-y-1">
                <Icon className="w-4 h-4 text-white" />
                <p className="font-semibold text-white text-[12px]">{label}</p>
                <p className="text-[11px] text-white/70">{desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView('apply')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#174D3A] text-[13px] font-semibold hover:bg-[#F7F6F1] transition-all"
          >
            <span>Apply to the Ambassador Program</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-[#E4E7E2] rounded-[16px] p-6 space-y-4">
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">Application Journey</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[12px]">
            {['Submit Application', 'Aptivo Review', 'Shortlisted', 'Accepted', 'Campus Pulse Portal'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#174D3A] text-white font-semibold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-semibold text-[#18201C]">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#69736D] shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'apply') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif font-normal text-[28px] text-[#18201C]">Ambassador Application</h1>
            <p className="text-[13px] text-[#69736D]">Tell the Aptivo team who you are and what you can do.</p>
          </div>
          <button
            onClick={() => setView('check')}
            className="text-[13px] text-[#69736D] hover:text-[#18201C] font-semibold"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmitApplication} className="bg-white rounded-[16px] border border-[#E4E7E2] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="space-y-4 text-[13px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#18201C] mb-1">
                Why do you want to become an Aptivo Connect Ambassador? *
              </label>
              <textarea required rows={4} value={whyAmbassador} onChange={(e) => setWhyAmbassador(e.target.value)}
                placeholder="Tell us your motivation — what you see on your campus and what you want to change or amplify."
                className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18201C] mb-1">
                Which campus or community would you represent? *
              </label>
              <input required value={campusOrCommunity} onChange={(e) => setCampusOrCommunity(e.target.value)}
                placeholder="e.g. FAST-NUCES Karachi Main Campus / IBA Karachi"
                className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18201C] mb-1">
                Previous community or leadership experience *
              </label>
              <textarea required rows={3} value={leadershipExperience} onChange={(e) => setLeadershipExperience(e.target.value)}
                placeholder="e.g. Lead organiser at FAST Tech Week, Club president at ACM FAST Karachi..."
                className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#18201C] mb-1">WhatsApp Number *</label>
                <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#18201C] mb-1">Weekly Availability *</label>
                <select required value={availability} onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="2-4 hours/week">2–4 hours / week</option>
                  <option value="4-8 hours/week">4–8 hours / week</option>
                  <option value="8+ hours/week">8+ hours / week</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18201C] mb-1">LinkedIn Profile URL (optional)</label>
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
              />
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#E4E7E2]">
            <p className="text-[11px] text-[#69736D]">
              Ambassador access is granted separately upon application approval.
            </p>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[13px] font-semibold transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'status' && application) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans">
        <div className="bg-white rounded-[16px] border border-[#E4E7E2] p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-normal text-[22px] text-[#18201C]">Ambassador Application Status</h2>
            {statusIcon(application.status)}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[13px] font-semibold ${statusColor(application.status)}`}>
            <span>{application.status}</span>
          </div>

          <div className="space-y-2 pt-2">
            {['Submitted', 'Under Review', 'Shortlisted', 'Accepted'].map((step) => {
              const statuses = ['Submitted', 'Under Review', 'Shortlisted', 'Accepted'];
              const isRejected = (application.status as string) === 'Rejected';
              const currentIdx = statuses.indexOf(application.status);
              const stepIdx = statuses.indexOf(step);
              const isDone = !isRejected && stepIdx <= currentIdx;
              const isCurrent = !isRejected && step === application.status;

              return (
                <div key={step} className={`flex items-center gap-3 p-3 rounded-[12px] border text-[12px] transition-all ${
                  isCurrent ? 'bg-[#E4EEE8] border-[#174D3A]/30 font-semibold text-[#174D3A]' :
                  isDone ? 'bg-[#F7F6F1] border-[#E4E7E2] text-[#18201C]' :
                  'bg-white border-[#E4E7E2] text-[#69736D]'
                }`}>
                  <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                    isDone ? 'bg-[#174D3A] text-white' : 'bg-[#E4E7E2] text-[#69736D]'
                  }`}>
                    {isDone && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span>{step}</span>
                  {isCurrent && <span className="ml-auto text-[11px] text-[#174D3A] font-semibold">← Current status</span>}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#F7F6F1] rounded-[12px] border border-[#E4E7E2] text-[12px] text-[#69736D] space-y-1">
            <p><strong className="text-[#18201C]">Submitted by:</strong> {application.fullName}</p>
            <p><strong className="text-[#18201C]">Representing:</strong> {application.campusOrCommunity}</p>
            <p><strong className="text-[#18201C]">Applied on:</strong> {new Date(application.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E4E7E2]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4EEE8] text-[#174D3A] text-[12px] font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-[#174D3A]" />
            <span>Ambassador Program — Campus Pulse</span>
          </div>
          <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C]">Campus Pulse Portal</h1>
          <p className="text-[13px] text-[#69736D] mt-1 max-w-xl">
            You are an active Aptivo Connect Ambassador. Report campus needs to drive real opportunities.
          </p>
        </div>
        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[13px] font-semibold transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Report Campus Demand
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-normal text-[20px] text-[#18201C]">Campus Reports ({demands.length})</h3>
        </div>

        {demands.length === 0 ? (
          <div className="p-10 bg-white rounded-[16px] border border-dashed border-[#E4E7E2] text-center text-[13px] text-[#69736D]">
            No campus reports logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demands.map((dm) => (
              <div key={dm._id} className="bg-white rounded-[16px] p-5 border border-[#E4E7E2] shadow-sm space-y-3">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E4EEE8] text-[#174D3A] text-[11px] font-semibold">
                    {dm.category} · ~{dm.studentCountEstimate} Students
                  </span>
                  <h4 className="font-semibold text-[#18201C] text-[15px]">{dm.title}</h4>
                  <p className="text-[13px] text-[#69736D] bg-[#F7F6F1] p-3 rounded-[12px]">
                    &ldquo;{dm.description}&rdquo;
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E4E7E2] text-[11px] text-[#69736D] flex justify-between">
                  <span>{dm.university}</span>
                  <span>{new Date(dm.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E7E2]">
              <h3 className="font-serif font-normal text-[20px] text-[#18201C]">Report Campus Demand</h3>
              <button onClick={() => setIsReportOpen(false)} className="text-[#69736D] hover:text-[#18201C]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportDemand} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold text-[#18201C] mb-1">Pillar Category</label>
                <select value={demandCategory} onChange={(e) => setDemandCategory(e.target.value as typeof demandCategory)}
                  className="w-full p-2.5 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none">
                  <option value="MEET">MEET — Demand for specific mentors/speakers</option>
                  <option value="BUILD">BUILD — Students looking for project collaborators</option>
                  <option value="EXPERIENCE">EXPERIENCE — Demand for company/lab visits</option>
                  <option value="ACCESS">ACCESS — Demand for seminars or tool credits</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#18201C] mb-1">Demand Summary *</label>
                <input required value={demandTitle} onChange={(e) => setDemandTitle(e.target.value)}
                  placeholder="e.g. 20 FAST students want AI research mentors"
                  className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#18201C] mb-1">Detailed Campus Context *</label>
                <textarea required rows={3} value={demandDescription} onChange={(e) => setDemandDescription(e.target.value)}
                  placeholder="Why are students seeking this? What specific topics or formats would work best?"
                  className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsReportOpen(false)} className="px-5 py-2 rounded-full border border-[#E4E7E2] text-[#69736D] font-semibold hover:bg-[#F7F6F1]">Cancel</button>
                <button type="submit" disabled={reportingDemand}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white font-semibold transition-all disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" />
                  {reportingDemand ? 'Submitting...' : 'Submit to Aptivo HQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
