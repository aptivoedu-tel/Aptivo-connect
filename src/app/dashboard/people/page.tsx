'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
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

    const handleRealtime = () => {
      fetchPeople(email, searchQuery, selectedRole, selectedField);
    };
    window.addEventListener('aptivo:realtime-event', handleRealtime);
    return () => window.removeEventListener('aptivo:realtime-event', handleRealtime);
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
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-200 font-sans">
      <div>
        <p className="text-[13px] font-semibold text-[#174D3A]">Connections</p>
        <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
          Discover people
        </h1>
        <div className="mt-4 flex gap-6 border-b border-[#E4E7E2]">
          <span className="border-b-2 border-[#174D3A] px-1 pb-3 text-[13px] font-semibold text-[#174D3A]">
            Discover
          </span>
          <Link href="/dashboard/links?tab=incoming" className="px-1 pb-3 text-[13px] font-medium text-[#69736D] hover:text-[#18201C]">
            Requests
          </Link>
          <Link href="/dashboard/links?tab=accepted" className="px-1 pb-3 text-[13px] font-medium text-[#69736D] hover:text-[#18201C]">
            Connections
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-[#E4E7E2] space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#69736D] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (Python, React), university, company..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#E4E7E2] text-[13px] text-[#18201C] focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20 bg-[#F7F6F1]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[13px] font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4E7E2] text-[12px]">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F7F6F1] border border-[#E4E7E2]">
            {(['all', 'student', 'professional'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRole(r);
                  fetchPeople(currentUserEmail, searchQuery, r, selectedField);
                }}
                className={`px-3.5 py-1 rounded-full font-semibold capitalize transition-all ${
                  selectedRole === r
                    ? 'bg-white text-[#18201C] shadow-xs'
                    : 'text-[#69736D] hover:text-[#18201C]'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#69736D] font-medium">Domain:</span>
            <select
              value={selectedField}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedField(val);
                fetchPeople(currentUserEmail, searchQuery, selectedRole, val);
              }}
              className="p-1.5 rounded-xl border border-[#E4E7E2] bg-white text-[#18201C] font-semibold focus:outline-none text-[12px]"
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
        <div className="py-12 text-center text-[#69736D] text-[14px]">
          Searching builder directory...
        </div>
      ) : people.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E4E7E2] rounded-[16px] p-10 text-center space-y-2">
          <Users className="w-8 h-8 text-[#69736D] mx-auto" />
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">No builders found</h3>
          <p className="text-[13px] text-[#69736D] max-w-sm mx-auto">
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
                className="bg-white rounded-[16px] p-5 border border-[#E4E7E2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={person.profilePhoto || person.avatarUrl} name={displayName} size={48} />
                      <div>
                        <Link
                          href={`/profile/${person._id}`}
                          className="font-semibold text-[15px] text-[#18201C] hover:text-[#174D3A] truncate block"
                        >
                          {displayName}
                        </Link>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#E4EEE8] text-[#174D3A] mt-0.5">
                          {person.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#69736D] line-clamp-1">{headline}</p>

                  {person.skills && person.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {person.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-[#E4EEE8] px-2.5 py-0.5 text-[11px] font-medium text-[#174D3A]"
                        >
                          {s}
                        </span>
                      ))}
                      {person.skills.length > 4 && (
                        <span className="text-[11px] text-[#69736D] self-center">
                          +{person.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E4E7E2] flex items-center gap-2">
                  {person.connectionState === 'none' && (
                    <button
                      onClick={() => handleLinkAction(person)}
                      disabled={actionLoadingId === person._id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[12px] font-semibold transition-all shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === person._id ? 'Sending...' : '+ Connect'}</span>
                    </button>
                  )}

                  {person.connectionState === 'pending_outgoing' && (
                    <span className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-full bg-[#E4EEE8] text-[#174D3A] text-[12px] font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}

                  {person.connectionState === 'pending_incoming' && (
                    <button
                      onClick={() => handleLinkAction(person)}
                      disabled={actionLoadingId === person._id}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] text-white text-[12px] font-semibold"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Accept</span>
                    </button>
                  )}

                  {person.connectionState === 'accepted' && (
                    <span className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-full bg-[#E4EEE8] text-[#174D3A] text-[12px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  )}

                  <Link
                    href={`/dashboard/messages?recipient=${person._id}`}
                    className="p-2 rounded-full border border-[#E4E7E2] text-[#69736D] hover:text-[#18201C] hover:bg-[#F7F6F1] transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/profile/${person._id}`}
                    className="p-2 rounded-full border border-[#E4E7E2] text-[#69736D] hover:text-[#18201C] hover:bg-[#F7F6F1] transition-colors"
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
