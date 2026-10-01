'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import Avatar from '@/components/Avatar';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Hammer,
  Users,
  Building2,
  Calendar,
  Layers,
  Award,
  Star,
  MessageSquare,
  ShieldCheck,
  Plus,
  UserPlus,
  Clock,
  UserCheck,
  X,
  Upload,
} from 'lucide-react';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeViewer, setActiveViewer] = useState<any>(null);

  // Link / Relationship State
  const [connectionState, setConnectionState] = useState<'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted'>('none');
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [linkNote, setLinkNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Endorsement Modal
  const [endorseModalOpen, setEndorseModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [endorseCategory, setEndorseCategory] = useState('Collaboration');
  const [endorseComment, setEndorseComment] = useState('');
  const [submittingEndorse, setSubmittingEndorse] = useState(false);
  const [endorseMessage, setEndorseMessage] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/profile?id=${encodeURIComponent(params.id)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setProfileData(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchViewerAndLinks = async (targetUserId: string) => {
    try {
      // 1. Fetch authenticated viewer identity
      const viewerRes = await fetch('/api/profile', { cache: 'no-store' });
      const viewerData = await viewerRes.json();
      if (viewerData.user) {
        setActiveViewer(viewerData.user);
        // 2. Check relationship state
        if (viewerData.user.email && targetUserId) {
          const linkRes = await fetch(`/api/links?email=${encodeURIComponent(viewerData.user.email)}&targetUserId=${targetUserId}`);
          const linkData = await linkRes.json();
          if (linkData.connectionState) {
            setConnectionState(linkData.connectionState);
            if (linkData.link?._id) setActiveLinkId(linkData.link._id);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  useEffect(() => {
    if (profileData?.user?._id) {
      fetchViewerAndLinks(profileData.user._id);
    }
  }, [profileData?.user?._id]);

  useEffect(() => {
    const handleRealtimeEvent = () => {
      if (profileData?.user?._id) {
        fetchViewerAndLinks(profileData.user._id);
      }
    };
    window.addEventListener('aptivo:realtime-event', handleRealtimeEvent);
    return () => window.removeEventListener('aptivo:realtime-event', handleRealtimeEvent);
  }, [profileData?.user?._id]);

  const handleSendLinkRequest = async () => {
    if (!activeViewer?.email || !profileData?.user?._id) return;
    setLinkActionLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterEmail: activeViewer.email,
          recipientId: profileData.user._id,
          note: linkNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectionState('pending_outgoing');
        setActiveLinkId(data.link?._id || null);
        setShowNoteModal(false);
        setLinkNote('');
      } else {
        alert(data.error || 'Could not send connection request');
      }
    } catch {
      alert('Error sending connection request');
    } finally {
      setLinkActionLoading(false);
    }
  };

  const handleRespondLink = async (action: 'accept' | 'decline' | 'cancel') => {
    if (!activeLinkId) return;
    setLinkActionLoading(true);
    try {
      const res = await fetch(`/api/links/${activeLinkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userEmail: activeViewer?.email }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accept') setConnectionState('accepted');
        else setConnectionState('none');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLinkActionLoading(false);
    }
  };

  const handleEndorse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !activeViewer?.email || !profileData?.user?._id) return;

    setSubmittingEndorse(true);
    setEndorseMessage('');
    try {
      const res = await fetch('/api/reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject._id,
          reviewerEmail: activeViewer.email,
          targetUserId: profileData.user._id,
          category: endorseCategory,
          comment: endorseComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEndorseMessage('Endorsement submitted successfully!');
        setTimeout(() => {
          setEndorseModalOpen(false);
          setEndorseComment('');
          fetchProfile();
        }, 1200);
      } else {
        setEndorseMessage(data.error || 'Failed to endorse.');
      }
    } catch (e: any) {
      setEndorseMessage(e.message || 'Network error.');
    } finally {
      setSubmittingEndorse(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#69736D] text-[14px] font-sans">
        Loading builder profile...
      </div>
    );
  }

  if (error || !profileData || !profileData.user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-serif text-[#18201C]">Profile Not Found</h2>
        <p className="text-xs text-[#69736D]">{error || 'This profile does not exist or is private.'}</p>
        <BackButton fallback="/dashboard/campus" className="rounded-full bg-[#174D3A] px-5 py-2 text-xs font-semibold text-white hover:bg-[#287A5B]">
          Back to Campus
        </BackButton>
      </div>
    );
  }

  const { user, activity, isOwnProfile: serverIsOwnProfile } = profileData;
  const isOwnProfile = Boolean(serverIsOwnProfile || (activeViewer?._id && activeViewer._id.toString() === user._id.toString()));

  const projects = activity?.projects || [];
  const meets = activity?.meets || [];
  const experiences = activity?.experiences || [];
  const records = activity?.records || [];

  // Shared projects between viewer & profile owner
  const sharedProjects = projects.filter((p: any) => {
    if (!activeViewer?._id || isOwnProfile) return false;
    const vId = activeViewer._id.toString();
    return p.ownerId?.toString() === vId || p.members?.some((m: any) => m.userId?.toString() === vId);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 -mt-5 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 font-sans">
      {/* ═══ COVER IMAGE ═══ */}
      <div className="relative">
        <div className="h-40 sm:h-48 md:h-56 w-full overflow-hidden bg-[#E4EEE8]">
          {user.coverImage ? (
            <img src={user.coverImage} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#E4EEE8] to-[#d4e5da]" />
          )}
        </div>
        <div className="absolute left-4 sm:left-6 lg:left-8 top-3">
          <BackButton fallback="/dashboard/campus" className="bg-white/80 backdrop-blur-sm text-[#18201C] hover:bg-white rounded-full px-3 py-1 text-xs font-medium shadow-sm">
            Back
          </BackButton>
        </div>
      </div>

      {/* ═══ AVATAR OVERLAP + IDENTITY ═══ */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20">
          <div className="relative inline-block">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-white overflow-hidden bg-[#E4EEE8] shadow-lg">
              {user.profilePhoto || user.avatarUrl ? (
                <img src={user.profilePhoto || user.avatarUrl} alt={user.fullName || user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#174D3A] font-serif text-2xl">
                  {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Action Button Area (Top Right) */}
          <div className="absolute right-0 top-16 sm:top-20 flex items-center gap-2">
            {isOwnProfile ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#174D3A] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#287A5B]"
              >
                Edit Profile
              </Link>
            ) : (
              <>
                {connectionState === 'none' && (
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#174D3A] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#287A5B]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                )}
                {connectionState === 'pending_outgoing' && (
                  <button
                    onClick={() => handleRespondLink('cancel')}
                    disabled={linkActionLoading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E4EEE8] px-4 py-2 text-[13px] font-semibold text-[#174D3A]"
                  >
                    <Clock className="w-4 h-4 text-[#287A5B]" />
                    <span>Request Sent</span>
                  </button>
                )}
                {connectionState === 'pending_incoming' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespondLink('accept')}
                      disabled={linkActionLoading}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#174D3A] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#287A5B]"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRespondLink('decline')}
                      disabled={linkActionLoading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7E2] bg-white px-4 py-2 text-[13px] font-semibold text-[#69736D] hover:bg-[#F7F6F1]"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
                {connectionState === 'accepted' && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4EEE8] px-4 py-2 text-[13px] font-semibold text-[#174D3A]">
                      <UserCheck className="w-4 h-4" />
                      <span>Connected</span>
                    </span>
                    <Link
                      href={`/dashboard/messages?recipient=${user._id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#174D3A] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#287A5B]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </Link>
                  </div>
                )}

                {sharedProjects.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedProject(sharedProjects[0]);
                      setEndorseModalOpen(true);
                      setEndorseMessage('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7E2] bg-white px-4 py-2 text-[13px] font-semibold text-[#18201C] hover:bg-[#F7F6F1]"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Endorse</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Identity Details */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif font-normal text-[26px] sm:text-[30px] leading-tight text-[#18201C]">
              {user.fullName || user.name || 'Builder Profile'}
            </h1>
            {user.isAptivoVerified && (
              <span className="rounded-full bg-[#E4EEE8] px-2.5 py-0.5 text-[11px] font-medium text-[#174D3A]">
                ✓ Verified
              </span>
            )}
          </div>

          <p className="text-[13px] text-[#69736D]">
            {user.headline ||
              [
                user.fieldOfStudy || user.jobTitle,
                user.currentYear ? `${user.currentYear}` : null,
                user.university || user.organization,
              ]
                .filter(Boolean)
                .join(' · ')}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#69736D]">
            {user.city && <span>📍 {user.city}</span>}
            {user.accountType && <span>🎓 {user.accountType === 'student' ? 'Student Builder' : 'Professional'}</span>}
            {user.graduationYear && <span>Class of {user.graduationYear}</span>}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#18201C]">{user.bio}</p>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((skill: string) => (
              <span key={skill} className="rounded-full bg-[#E4EEE8] px-3 py-1 text-[12px] font-medium text-[#174D3A]">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Stats Strip */}
        <div className="mt-5 grid grid-cols-4 divide-x divide-[#E4E7E2] rounded-[14px] border border-[#E4E7E2] bg-white overflow-hidden">
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-[#18201C]">{projects.length}</p>
            <p className="text-[11px] text-[#69736D]">Projects</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-[#18201C]">{experiences.length}</p>
            <p className="text-[11px] text-[#69736D]">Experiences</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-[#18201C]">{meets.length}</p>
            <p className="text-[11px] text-[#69736D]">Meets</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-[#287A5B]">{records.length}</p>
            <p className="text-[11px] text-[#69736D]">Records</p>
          </div>
        </div>
      </div>

      {/* ═══ BODY SECTIONS ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-6 pb-8">
        {/* Social / External Links */}
        {(user.github || user.linkedin || user.portfolio) && (
          <div className="flex items-center gap-3 pt-2">
            {user.github && (
              <a
                href={user.github.startsWith('http') ? user.github : `https://${user.github}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7E2] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#18201C] hover:bg-[#F7F6F1]"
              >
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {user.linkedin && (
              <a
                href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7E2] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#18201C] hover:bg-[#F7F6F1]"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
              </a>
            )}
            {user.portfolio && (
              <a
                href={user.portfolio.startsWith('http') ? user.portfolio : `https://${user.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7E2] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#18201C] hover:bg-[#F7F6F1]"
              >
                <Globe className="w-3.5 h-3.5 text-[#287A5B]" /> Portfolio
              </a>
            )}
          </div>
        )}

        {/* Projects Showcase */}
        <div className="space-y-4">
          <h2 className="font-serif text-[20px] text-[#18201C]">Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#E4E7E2] bg-white p-6 text-center text-[13px] text-[#69736D]">
              No projects listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p: any) => (
                <div key={p._id} className="rounded-[16px] border border-[#E4E7E2] bg-white p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#E4EEE8] px-2.5 py-0.5 text-[11px] font-medium text-[#174D3A]">
                      {p.field || 'Project'}
                    </span>
                    {p.status && (
                      <span className="text-[11px] text-[#69736D] font-medium">{p.status}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[15px] text-[#18201C]">{p.title}</h3>
                  <p className="text-[13px] text-[#69736D] line-clamp-2">{p.problem || p.building}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Records */}
        {records.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-[20px] text-[#18201C]">Aptivo Journey & Records ({records.length})</h2>
            <div className="space-y-3">
              {records.map((r: any) => (
                <div key={r._id} className="rounded-[16px] border border-[#E4E7E2] bg-white p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#174D3A]">{r.section || 'Record'}</span>
                    <span className="text-[11px] text-[#69736D]">{r.startDate || ''} {r.endDate ? `– ${r.endDate}` : ''}</span>
                  </div>
                  <h4 className="font-semibold text-[14px] text-[#18201C]">{r.title}</h4>
                  {r.organization && <p className="text-[12px] text-[#69736D]">{r.organization}</p>}
                  {r.description && <p className="text-[13px] text-[#18201C] pt-1">{r.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Send Connection Request Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#18201C]">Connect with {user.fullName || user.name}</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-[#69736D] hover:text-[#18201C]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#69736D]">
              Add a brief note about why you want to connect.
            </p>
            <textarea
              rows={3}
              value={linkNote}
              onChange={(e) => setLinkNote(e.target.value)}
              placeholder="Hi! I'd love to connect..."
              className="w-full p-3 rounded-2xl border border-[#E4E7E2] text-xs focus:outline-none focus:ring-2 focus:ring-[#174D3A]/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69736D] hover:bg-[#F7F6F1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendLinkRequest}
                disabled={linkActionLoading}
                className="px-5 py-2 rounded-full bg-[#174D3A] text-white text-xs font-semibold hover:bg-[#287A5B]"
              >
                {linkActionLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
