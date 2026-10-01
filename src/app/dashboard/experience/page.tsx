'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Send,
  Building,
  Info,
  Search,
  X,
} from 'lucide-react';
import MediaImage from '@/components/MediaImage';

interface IEnrolled {
  studentName: string;
  university?: string;
  status: string;
}

interface IExperience {
  _id: string;
  title: string;
  company: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  capacity: number;
  enrolledCount: number;
  eligibility: string;
  image: string;
  status: string;
  enrolledStudents: IEnrolled[];
  questionnaire?: Array<{ id: string; questionText: string; questionType: 'short-text' | 'long-text' | 'single-choice' | 'multiple-choice'; required: boolean; options?: string[] }>;
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Enroll Modal
  const [activeExp, setActiveExp] = useState<IExperience | null>(null);
  const [whyAttend, setWhyAttend] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experience');
      const data = await res.json();
      if (data.experiences) setExperiences(data.experiences);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExp) return;

    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }

    if (!email) {
      alert('Please sign in to apply for this workplace immersion.');
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch('/api/experience/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: activeExp._id,
          whyAttend,
          questionResponses: (activeExp.questionnaire || []).map((question) => ({ questionText: question.questionText, answer: questionAnswers[question.id] || '' })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledSuccess(true);
        setTimeout(() => {
          setEnrolledSuccess(false);
          setActiveExp(null);
          setWhyAttend('');
          setQuestionAnswers({});
          fetchExperiences();
        }, 1800);
      } else {
        alert(data.error || 'Failed to enroll in experience.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(false);
    }
  };

  const categories = ['All', 'Software House', 'Research Lab', 'Startup Office'];

  const filtered = experiences.filter(
    (e) => (selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase())) && [e.title, e.company, e.category, e.location, e.city].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#174D3A]">Experience</p>
          <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
            Step into the work.
          </h1>
          <p className="mt-1.5 text-[14px] text-[#69736D]">
            Visit the places where ideas become real.
          </p>
        </div>
        <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-full bg-white px-4 text-[#69736D] border border-[#E4E7E2] focus-within:ring-2 focus-within:ring-[#174D3A]/20">
          <Search className="h-4 w-4 shrink-0 text-[#69736D]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences..."
            className="w-full bg-transparent text-[13px] text-[#18201C] outline-none placeholder:text-[#69736D]"
          />
        </label>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[#174D3A] text-white shadow-sm'
                : 'bg-white border border-[#E4E7E2] text-[#69736D] hover:bg-[#F7F6F1]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Experience Cards */}
      {loading ? (
        <div className="py-12 text-center text-[#69736D] text-[14px]">Loading experiences...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-[16px] border border-dashed border-[#E4E7E2] text-center space-y-3">
          <Building className="w-8 h-8 text-[#69736D] mx-auto" />
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">No Experiences Available</h3>
          <p className="text-[13px] text-[#69736D] max-w-md mx-auto">
            Check back soon as Aptivo curates more industrial visits and laboratory walkthroughs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((exp) => {
            const seatsRemaining = exp.capacity - (exp.enrolledCount || 0);
            return (
              <div
                key={exp._id}
                className="bg-white overflow-hidden rounded-[16px] border border-[#E4E7E2] transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <MediaImage src={exp.image} alt={exp.title} kind="experience" className="h-44" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#174D3A] text-[11px] font-medium">
                      {exp.category}
                    </span>
                  </div>
                  <div className="px-5 space-y-2">
                    <span className="text-[11px] font-semibold text-[#174D3A] uppercase tracking-wide">
                      {exp.company}
                    </span>
                    <h3 className="font-semibold text-[16px] leading-snug text-[#18201C]">
                      {exp.title}
                    </h3>
                    <p className="text-[13px] text-[#69736D] line-clamp-2">{exp.description}</p>
                  </div>

                  {/* Info Badges */}
                  <div className="mx-5 space-y-1.5 text-[12px] text-[#69736D] bg-[#F7F6F1] p-3.5 rounded-[12px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                      <span>{exp.date} • {exp.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                      <span className="truncate">{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#174D3A] font-medium">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>{seatsRemaining} seats remaining of {exp.capacity}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3">
                  <button
                    onClick={() => setActiveExp(exp)}
                    className="w-full py-2.5 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[13px] font-semibold transition-all shadow-sm"
                  >
                    View & Register
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enroll Modal */}
      {activeExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {enrolledSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#174D3A] mx-auto" />
                <h3 className="font-serif font-normal text-[24px] text-[#18201C]">You’re registered ✓</h3>
                <p className="text-[13px] text-[#69736D] max-w-xs mx-auto">
                  Your place for {activeExp.title} is confirmed. Aptivo will notify you about any updates.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E7E2]">
                  <div>
                    <h3 className="text-[18px] font-serif font-normal text-[#18201C]">
                      Register: {activeExp.title}
                    </h3>
                    <p className="text-[12px] text-[#69736D]">
                      Hosted at {activeExp.company} ({activeExp.city})
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveExp(null)}
                    className="text-[#69736D] hover:text-[#18201C]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEnroll} className="space-y-4">
                  <div className="p-3.5 bg-[#E4EEE8] rounded-[12px] text-[12px] text-[#174D3A] space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Eligibility Requirement:
                    </p>
                    <p>{activeExp.eligibility}</p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#18201C] mb-1">
                      Why do you want to attend this workplace experience? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={whyAttend}
                      onChange={(e) => setWhyAttend(e.target.value)}
                      placeholder="Tell us what you hope to learn and how this aligns with your career interests."
                      className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px] focus:ring-2 focus:ring-[#174D3A]/20 focus:outline-none"
                    />
                  </div>

                  {(activeExp.questionnaire || []).map((question) => (
                    <div key={question.id}>
                      <label className="block text-[12px] font-semibold text-[#18201C] mb-1">{question.questionText} {question.required ? '*' : ''}</label>
                      {question.questionType === 'long-text' ? <textarea required={question.required} rows={3} value={questionAnswers[question.id] || ''} onChange={(e) => setQuestionAnswers((a) => ({ ...a, [question.id]: e.target.value }))} className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px]" /> : question.questionType === 'single-choice' ? <select required={question.required} value={questionAnswers[question.id] || ''} onChange={(e) => setQuestionAnswers((a) => ({ ...a, [question.id]: e.target.value }))} className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px]"><option value="">Select an option</option>{(question.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input required={question.required} value={questionAnswers[question.id] || ''} onChange={(e) => setQuestionAnswers((a) => ({ ...a, [question.id]: e.target.value }))} className="w-full p-3 rounded-[12px] border border-[#E4E7E2] text-[13px]" />}
                    </div>
                  ))}

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveExp(null)}
                      className="px-5 py-2 rounded-full border border-[#E4E7E2] text-[#69736D] text-[13px] font-semibold hover:bg-[#F7F6F1]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enrolling}
                      className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[13px] font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{enrolling ? 'Submitting...' : 'Register'}</span>
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
