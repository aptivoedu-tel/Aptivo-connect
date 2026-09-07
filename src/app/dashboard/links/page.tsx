'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Link2,
  Users,
  UserCheck,
  UserPlus,
  Clock,
  MessageSquare,
  Sparkles,
  Search,
  UserMinus,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ConnectedUser {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  profilePhoto?: string;
  university?: string;
  degree?: string;
  jobTitle?: string;
  organization?: string;
  bio?: string;
  skills?: string[];
}

interface LinkRecord {
  _id: string;
  requester: ConnectedUser;
  recipient: ConnectedUser;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LinksPage() {
  const [activeTab, setActiveTab] = useState<'accepted' | 'incoming' | 'outgoing'>('accepted');
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<LinkRecord[]>([]);
  const [incoming, setIncoming] = useState<LinkRecord[]>([]);
  const [outgoing, setOutgoing] = useState<LinkRecord[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let email = '';
    let id = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
        id = stored._id || '';
        setCurrentUserEmail(email);
        setCurrentUserId(id);
      } catch {}
    }
    if (email) {
      loadLinks(email);
    } else {
      setLoading(false);
    }
  }, []);

  const loadLinks = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.accepted || data.pendingIncoming || data.pendingOutgoing) {
        setAccepted(data.accepted || []);
        setIncoming(data.pendingIncoming || []);
        setOutgoing(data.pendingOutgoing || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (linkId: string, action: 'accept' | 'decline' | 'cancel') => {
    setActionLoadingId(linkId);
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userEmail: currentUserEmail }),
      });
      const data = await res.json();
      if (data.success) {
        loadLinks(currentUserEmail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDisconnect = async (linkId: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    setActionLoadingId(linkId);
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadLinks(currentUserEmail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-darkpine-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Link2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Professional Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Links & Relationships
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Manage your verified connections with builders, teammates, and industry mentors.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'accepted'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Links ({accepted.length})
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all relative ${
              activeTab === 'incoming'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Incoming Requests ({incoming.length})
            {incoming.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-1.5 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'outgoing'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sent Requests ({outgoing.length})
          </button>
        </div>

        <Link
          href="/dashboard/people"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Find People</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading your network...</div>
      ) : activeTab === 'accepted' ? (
        accepted.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No active links yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Connect with fellow students, project teammates, and mentors across the platform.
            </p>
            <Link
              href="/dashboard/people"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
            >
              <span>Discover Builders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accepted.map((link) => {
              const partner =
                link.requester?._id?.toString() === currentUserId
                  ? link.recipient
                  : link.requester;
              const displayName = partner?.fullName || partner?.name || 'Builder';
              const headline =
                partner?.role === 'student'
                  ? `${partner.degree || 'Student'} • ${partner.university || 'University'}`
                  : `${partner?.jobTitle || 'Professional'} • ${partner?.organization || 'Organization'}`;

              return (
                <div
                  key={link._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-brand-500/40 shrink-0">
                        {partner?.profilePhoto || partner?.avatarUrl ? (
                          <Image
                            src={partner.profilePhoto || partner.avatarUrl || ''}
                            alt={displayName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-slate-700 text-base">
                            {displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/profile?email=${partner?.email}`}
                          className="font-extrabold text-sm text-slate-900 hover:text-brand-600 truncate block"
                        >
                          {displayName}
                        </Link>
                        <span className="text-[10px] uppercase font-bold text-brand-700">
                          {partner?.role}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{headline}</p>
                    {partner?.skills && partner.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {partner.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/dashboard/messages?recipient=${partner?._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Link>
                    <button
                      onClick={() => handleDisconnect(link._id)}
                      disabled={actionLoadingId === link._id}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'incoming' ? (
        incoming.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-400 text-xs">
            No incoming connection requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incoming.map((link) => {
              const reqUser = link.requester;
              const displayName = reqUser?.fullName || reqUser?.name || 'Builder';
              return (
                <div
                  key={link._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      {reqUser?.profilePhoto || reqUser?.avatarUrl ? (
                        <Image
                          src={reqUser.profilePhoto || reqUser.avatarUrl || ''}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                          {displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/profile?email=${reqUser?.email}`}
                        className="font-extrabold text-sm text-slate-900 hover:text-brand-600 truncate block"
                      >
                        {displayName}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">
                        {reqUser?.university || reqUser?.organization || reqUser?.role}
                      </p>
                      {link.note && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5 line-clamp-1">
                          "{link.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(link._id, 'accept')}
                      disabled={actionLoadingId === link._id}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(link._id, 'decline')}
                      disabled={actionLoadingId === link._id}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        outgoing.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-400 text-xs">
            No outgoing connection requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outgoing.map((link) => {
              const recUser = link.recipient;
              const displayName = recUser?.fullName || recUser?.name || 'Builder';
              return (
                <div
                  key={link._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      {recUser?.profilePhoto || recUser?.avatarUrl ? (
                        <Image
                          src={recUser.profilePhoto || recUser.avatarUrl || ''}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                          {displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/profile?email=${recUser?.email}`}
                        className="font-extrabold text-sm text-slate-900 hover:text-brand-600 truncate block"
                      >
                        {displayName}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">
                        {recUser?.university || recUser?.organization || recUser?.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(link._id, 'cancel')}
                    disabled={actionLoadingId === link._id}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold"
                  >
                    Cancel Request
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
