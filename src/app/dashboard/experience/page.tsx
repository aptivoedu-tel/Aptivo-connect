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
} from 'lucide-react';
import Image from 'next/image';
import StatusPill from '@/components/StatusPill';

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
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Enroll Modal
  const [activeExp, setActiveExp] = useState<IExperience | null>(null);
  const [whyAttend, setWhyAttend] = useState('');
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
          studentEmail: email,
          whyAttend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledSuccess(true);
        setTimeout(() => {
          setEnrolledSuccess(false);
          setActiveExp(null);
          setWhyAttend('');
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
    (e) => selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Pillar 3: EXPERIENCE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Workplace Visits & Research Lab Immersions
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Step beyond textbooks. Experience software houses, hardware research facilities, and startup headquarters firsthand.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Experience Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading experiences...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <Building className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Experiences Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Check back soon as Aptivo curates more industrial visits and laboratory walkthroughs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exp) => {
            const seatsRemaining = exp.capacity - (exp.enrolledCount || 0);
            return (
              <div
                key={exp._id}
                className="bg-slate-50 hover:bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                      {exp.company}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  {/* Info Badges */}
                  <div className="space-y-2 text-xs text-slate-500 bg-white p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{exp.date} • {exp.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{seatsRemaining} seats remaining of {exp.capacity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60">
                  <button
                    onClick={() => setActiveExp(exp)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>View & Register</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enroll Modal */}
      {activeExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {enrolledSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">You’re registered ✓</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your place for {activeExp.title} is confirmed. Aptivo will notify you about any changes.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Register: {activeExp.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hosted at {activeExp.company} ({activeExp.city})
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveExp(null)}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleEnroll} className="space-y-4">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Eligibility Requirement:
                    </p>
                    <p className="text-blue-800">{activeExp.eligibility}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Why do you want to attend this workplace experience? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={whyAttend}
                      onChange={(e) => setWhyAttend(e.target.value)}
                      placeholder="Tell us what you hope to learn and how this aligns with your career interests."
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveExp(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enrolling}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{enrolling ? 'Submitting...' : 'Submit Application'}</span>
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
