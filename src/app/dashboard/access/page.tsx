'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Gift,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface IAccessItem {
  _id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  format: string;
  linkOrVenue: string;
  partnerName: string;
  perks: string[];
  image?: string;
  registrations: Array<{ studentId: string }>;
}

export default function AccessPage() {
  const [events, setEvents] = useState<IAccessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registeredSuccessId, setRegisteredSuccessId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/access');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
      } catch {}
    }

    if (!email) {
      alert('Please sign in to register for this event.');
      return;
    }

    setRegisteringId(eventId);
    try {
      const res = await fetch('/api/access/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          studentEmail: email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredSuccessId(eventId);
        fetchEvents();
      } else {
        alert(data.error || 'Failed to register.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegisteringId(null);
    }
  };

  const categories = ['All', 'Meetup', 'Seminar', 'Platform Access', 'Webinar'];

  const filtered = events.filter(
    (ev) => selectedCategory === 'All' || ev.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Pillar 4: ACCESS</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Exclusive Opportunities, Seminars & Perks
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Register for university seminars, tech community meetups, and claim curated software & cloud resources through Aptivo partners.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Access Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading opportunities...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Opportunities Listed</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Stay tuned as new university seminars and partner vouchers are added weekly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isDone = registeredSuccessId === item._id;

            return (
              <div
                key={item._id}
                className="bg-slate-50 hover:bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  {item.image && (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-950/80 backdrop-blur-md text-purple-200 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                      {item.partnerName}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Date & Format Info */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{item.date} • {item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.format} • {item.linkOrVenue}</span>
                    </div>
                  </div>

                  {/* Perks Tags */}
                  {item.perks && item.perks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Gift className="w-3 h-3 text-amber-500" /> Member Perks:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.perks.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-medium border border-purple-100"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60">
                  {isDone ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Registered Successfully</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(item._id)}
                      disabled={registeringId === item._id}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{registeringId === item._id ? 'Registering...' : 'Claim / Register'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
