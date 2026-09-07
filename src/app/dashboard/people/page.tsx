'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface IPerson {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: 'student' | 'professional' | 'admin';
  avatarUrl?: string;
  profilePhoto?: string;
  university?: string;
  campus?: string;
  degree?: string;
  fieldOfStudy?: string;
  field?: string;
  jobTitle?: string;
  organization?: string;
  bio?: string;
  skills: string[];
  connectionState: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';
  linkId?: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<IPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'professional'>('all');
  const [selectedField, setSelectedField] = useState('all');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
        setCurrentUserEmail(email);
      } catch {}
    }
    fetchPeople(email, '', selectedRole, selectedField);
  }, []);

  const fetchPeople = async (
    email = currentUserEmail,
    query = searchQuery,
    role = selectedRole,
    field = selectedField
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (email) params.set('email', email);
      if (query) params.set('q', query);
      if (role !== 'all') params.set('role', role);
      if (field !== 'all') params.set('field', field);

      const res = await fetch(`/api/people?${params.toString()}`);
      const data = await res.json();
      if (data.users) {
        setPeople(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPeople(currentUserEmail, searchQuery, selectedRole, selectedField);
  };

  const handleLinkAction = async (person: IPerson) => {
    if (!currentUserEmail) {
      alert('Please sign in to connect with builders.');
      return;
    }

    setActionLoadingId(person._id);
    try {
      if (person.connectionState === 'none') {
        // Send request
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requesterEmail: currentUserEmail,
            recipientId: person._id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setPeople((prev) =>
            prev.map((p) =>
              p._id === person._id
                ? { ...p, connectionState: 'pending_outgoing', linkId: data.link?._id }
                : p
            )
          );
        }
      } else if (person.connectionState === 'pending_incoming' && person.linkId) {
        // Accept request
        const res = await fetch(`/api/links/${person.linkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'accept', userEmail: currentUserEmail }),
        });
        const data = await res.json();
        if (data.success) {
          setPeople((prev) =>
            prev.map((p) =>
              p._id === person._id ? { ...p, connectionState: 'accepted' } : p
            )
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const fields = [
    'All Domains',
    'Computer Science',
    'Artificial Intelligence',
    'Software Engineering',
    'Robotics & Hardware',
    'Electrical & Embedded',
    'Design & Product',
    'Finance & Business',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-darkpine-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Aptivo Builder Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Discover Builders & Mentors
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Find peers across universities, collaborate on BUILD projects, and link with verified industry professionals.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (Python, React), university, company, or field..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200">
            {(['all', 'student', 'professional'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRole(r);
                  fetchPeople(currentUserEmail, searchQuery, r, selectedField);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                  selectedRole === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Domain:</span>
            <select
              value={selectedField}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedField(val);
                fetchPeople(currentUserEmail, searchQuery, selectedRole, val);
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none"
            >
              {fields.map((f) => (
                <option key={f} value={f === 'All Domains' ? 'all' : f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Searching builder directory...
        </div>
      ) : people.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No builders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters to discover other students and mentors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {people.map((person) => {
            const displayName = person.fullName || person.name || 'Builder';
            const headline =
              person.role === 'student'
                ? `${person.degree || person.fieldOfStudy || 'Student'} • ${person.university || 'University'}`
                : `${person.jobTitle || 'Professional'} • ${person.organization || 'Organization'}`;

            return (
              <div
                key={person._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-brand-500/40 shrink-0">
                        {person.profilePhoto || person.avatarUrl ? (
                          <Image
                            src={person.profilePhoto || person.avatarUrl || ''}
                            alt={displayName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-slate-700 text-lg">
                            {displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/profile?email=${person.email}`}
                          className="font-extrabold text-sm text-slate-900 hover:text-brand-600 truncate block"
                        >
                          {displayName}
                        </Link>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                          {person.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Headline & Location */}
                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">{headline}</p>

                  {/* Bio */}
                  {person.bio && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {person.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {person.skills && person.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {person.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono"
                        >
                          {s}
                        </span>
                      ))}
                      {person.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{person.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {/* Link / Connection button */}
                  {person.connectionState === 'none' && (
                    <button
                      onClick={() => handleLinkAction(person)}
                      disabled={actionLoadingId === person._id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === person._id ? 'Sending...' : '+ Link'}</span>
                    </button>
                  )}

                  {person.connectionState === 'pending_outgoing' && (
                    <span className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}

                  {person.connectionState === 'pending_incoming' && (
                    <button
                      onClick={() => handleLinkAction(person)}
                      disabled={actionLoadingId === person._id}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Accept</span>
                    </button>
                  )}

                  {person.connectionState === 'accepted' && (
                    <span className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Linked</span>
                    </span>
                  )}

                  {/* Message Button */}
                  <Link
                    href={`/dashboard/messages?recipient=${person._id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  {/* View Profile */}
                  <Link
                    href={`/dashboard/profile?email=${person.email}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="View Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
