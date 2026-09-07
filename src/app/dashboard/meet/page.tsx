'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Video,
  Clock,
  Send,
  Sparkles,
  Star,
  MessageSquare,
} from 'lucide-react';
import StatusPill from '@/components/StatusPill';

interface IMeetItem {
  _id: string;
  field: string;
  targetRole?: string;
  discussionTopic: string;
  format: string;
  preference: string;
  status: string;
  scheduledDetails?: {
    mentorName: string;
    mentorRole: string;
    mentorOrganization?: string;
    mentorAvatar?: string;
    date: string;
    time: string;
    meetingLink: string;
    durationMinutes: number;
    notes?: string;
  };
  feedback?: {
    rating: number;
    takeaway?: string;
  };
  createdAt: string;
}

export default function MeetPage() {
  const [meets, setMeets] = useState<IMeetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackModalId, setFeedbackModalId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackTakeaway, setFeedbackTakeaway] = useState('');

  // Form State
  const [field, setField] = useState('Technology');
  const [customField, setCustomField] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [discussionTopic, setDiscussionTopic] = useState('');
  const [format, setFormat] = useState('Online');
  const [preference, setPreference] = useState('Individual');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeets = async () => {
    try {
      let email = '';
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
          email = stored.email || '';
        } catch {}
      }
      const url = email ? `/api/meet?studentEmail=${encodeURIComponent(email)}` : '/api/meet';
      const res = await fetch(url);
      const data = await res.json();
      if (data.meets) setMeets(data.meets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeets();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionTopic.trim()) return;

    let email = '';
    let studentName = '';
    let studentUniversity = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
        studentName = stored.fullName || stored.name || '';
        studentUniversity = stored.university || '';
      } catch {}
    }

    if (!email) {
      alert('Please sign in to submit a meeting request.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedField = field === 'Other' ? customField : field;
      const res = await fetch('/api/meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: email,
          studentName,
          studentUniversity,
          field: selectedField,
          targetRole,
          discussionTopic,
          format,
          preference,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setDiscussionTopic('');
        setTargetRole('');
        fetchMeets();
      } else {
        alert(data.error || 'Failed to submit meet request.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalId) return;

    try {
      const res = await fetch('/api/meet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feedbackModalId,
          feedback: {
            rating: feedbackRating,
            takeaway: feedbackTakeaway,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackModalId(null);
        setFeedbackTakeaway('');
        fetchMeets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Pillar 1: MEET</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Connect with Industry Mentors & Experts
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Tell us who you want to learn from. Aptivo actively facilitates, verifies, and schedules the conversation for you.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request Connection</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading connections...</div>
      ) : meets.length === 0 ? (
        <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Connection Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ready to speak to a Software Architect, Doctor, AI Researcher, or Civil Engineer? Submit your request above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meets.map((meet) => (
            <div
              key={meet._id}
              className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200/70 text-slate-800">
                    {meet.field}
                  </span>
                  <StatusPill status={meet.status} />
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {meet.targetRole || `Discussion in ${meet.field}`}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100">
                    &ldquo;{meet.discussionTopic}&rdquo;
                  </p>
                </div>

                {/* Scheduled details view */}
                {meet.scheduledDetails?.mentorName && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-emerald-950">
                        Session with {meet.scheduledDetails.mentorName}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {meet.scheduledDetails.durationMinutes} mins
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      {meet.scheduledDetails.mentorRole}
                      {meet.scheduledDetails.mentorOrganization ? ` • ${meet.scheduledDetails.mentorOrganization}` : ''}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-900 pt-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {meet.scheduledDetails.date} at {meet.scheduledDetails.time}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {meet.format} • {meet.preference}
                </span>

                {meet.status === 'Scheduled' && (
                  <div className="flex items-center gap-2">
                    <a
                      href={meet.scheduledDetails?.meetingLink || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                    <button
                      onClick={() => setFeedbackModalId(meet._id)}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                    >
                      Complete
                    </button>
                  </div>
                )}

                {meet.status === 'Completed' && (
                  <div className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                    <span>Session Completed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Request a Professional Connection</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Interested Field *
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                >
                  <option value="Technology">Technology & Software</option>
                  <option value="Engineering">Engineering (Civil / Mechanical / EE)</option>
                  <option value="AI & Research">AI, Machine Learning & Robotics</option>
                  <option value="Medicine">Medicine & Healthcare</option>
                  <option value="Business">Business & Tech Startups</option>
                  <option value="Design">UI/UX & Product Design</option>
                  <option value="Finance">Finance & Fintech</option>
                  <option value="Media">Media & Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {field === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specify Field
                  </label>
                  <input
                    type="text"
                    required
                    value={customField}
                    onChange={(e) => setCustomField(e.target.value)}
                    placeholder="e.g. Biotechnology"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Who would you like to meet? (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Civil Engineer, AI Researcher, Founder"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What would you like to discuss? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={discussionTopic}
                  onChange={(e) => setDiscussionTopic(e.target.value)}
                  placeholder="Tell us what you want to learn, questions about industry trends, career pathways, or real tools."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    <option value="Online">Online (Google Meet)</option>
                    <option value="In-person">In-person</option>
                    <option value="Either">Either</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    <option value="Individual">1-on-1 Session</option>
                    <option value="Small group">Curated Small Group</option>
                    <option value="Either">Either</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete & Feedback Modal */}
      {feedbackModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Session Feedback</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How was your meeting? Your feedback helps Aptivo facilitate better mentors and measure impact.
            </p>

            <form onSubmit={handleCompleteFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-2 rounded-xl border text-sm font-bold ${
                        feedbackRating >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What was your key takeaway? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackTakeaway}
                  onChange={(e) => setFeedbackTakeaway(e.target.value)}
                  placeholder="e.g. Learned about career paths in structural engineering and key tools to learn."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-brand-700"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
