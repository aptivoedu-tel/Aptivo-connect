'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import MediaImage from '@/components/MediaImage';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Compass,
  Link2,
  Lock,
  Eye,
  CheckCircle2,
  Plus,
  X,
  Save,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowLeft,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  Award,
  Upload,
  UserPlus,
  UserCheck,
  Clock,
  UserMinus,
  MessageSquare,
  Users,
} from 'lucide-react';
import { calculateProfileCompletion, ProfileCompletionResult } from '@/lib/profileUtils';

const PRESET_SKILLS = [
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'FastAPI',
  'Machine Learning',
  'PyTorch',
  'TensorFlow',
  'Computer Vision',
  'NLP',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Figma',
  'UI/UX Design',
  'Product Management',
  'Embedded Systems',
  'ROS 2',
  'Robotics',
  'Solidity',
  'Cybersecurity',
];

const PRESET_INTERESTS_STUDENT = [
  'Artificial Intelligence',
  'Software Development',
  'Data Science',
  'Cybersecurity',
  'Research',
  'Engineering',
  'Business',
  'Entrepreneurship',
  'Design',
  'Finance',
  'Medicine',
  'Media',
  'Robotics & Hardware',
  'Autonomous Vehicles',
  'Clean Energy',
];

const PRESET_INTERESTS_PRO = [
  'Mentoring',
  'Speaking',
  'Meet Sessions',
  'Project Collaboration',
  'Research',
  'Hiring & Internships',
  'Workplace Tours',
  'Advisory',
];

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
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'links'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  // Authenticated vs Profile User
  const [currentLoggedInEmail, setCurrentLoggedInEmail] = useState('');
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState('');
  const [isSelf, setIsSelf] = useState(true);
  const [profileUserId, setProfileUserId] = useState('');

  // User Profile State
  const [userEmail, setUserEmail] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'professional'>('student');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Student Fields
  const [university, setUniversity] = useState('');
  const [campus, setCampus] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Professional Fields
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // Bio, Skills, Interests, Links
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Privacy Settings
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Platform verified activity
  const [platformMetrics, setPlatformMetrics] = useState({
    meetingsCount: 0,
    projectsCount: 0,
    experiencesCount: 0,
  });

  const [verifiedProjects, setVerifiedProjects] = useState<unknown[]>([]);
  const [verifiedExperiences, setVerifiedExperiences] = useState<unknown[]>([]);

  // Links state
  const [connectionState, setConnectionState] = useState<'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted'>('none');
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [linkNote, setLinkNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [linksList, setLinksList] = useState<{
    accepted: LinkRecord[];
    pendingIncoming: LinkRecord[];
    pendingOutgoing: LinkRecord[];
  }>({ accepted: [], pendingIncoming: [], pendingOutgoing: [] });

  // Completion stats
  const [completion, setCompletion] = useState<ProfileCompletionResult>({
    score: 0,
    suggestions: [],
    isComplete: false,
  });

  const fetchProfile = async () => {
    try {
      // The profile editor is protected by the signed server session. Browser
      // storage is only a cache and may be empty or stale after a session restore.
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.user) {
        const u = data.user;
        setProfileUserId(u._id);
        setUserEmail(u.email);
        setCurrentLoggedInEmail(u.email || '');
        setCurrentLoggedInUserId(u._id || '');
        setFullName(u.fullName || u.name || '');
        setAccountType(u.accountType || u.role || 'student');
        if (u.phone) setPhone(u.phone);
        if (u.whatsapp) setWhatsapp(u.whatsapp);
        if (u.city) setCity(u.city);
        setProfilePhoto(u.profilePhoto || u.avatarUrl || '');
        setCoverImage(u.coverImage || '');

        if (u.university) setUniversity(u.university);
        if (u.campus) setCampus(u.campus);
        if (u.degree) setDegree(u.degree);
        if (u.fieldOfStudy || u.field) setFieldOfStudy(u.fieldOfStudy || u.field);
        if (u.currentYear) setCurrentYear(u.currentYear);
        if (u.graduationYear || u.expectedGraduation) setGraduationYear(u.graduationYear || u.expectedGraduation);

        if (u.organization) setOrganization(u.organization);
        if (u.jobTitle || u.professionalRole) setJobTitle(u.jobTitle || u.professionalRole);
        if (u.industry) setIndustry(u.industry);
        if (u.experienceYears) setExperienceYears(u.experienceYears);

        if (u.bio) setBio(u.bio);
        if (u.skills) setSkills(u.skills);
        if (u.interests) setInterests(u.interests);
        if (u.github || u.githubUrl) setGithub(u.github || u.githubUrl);
        if (u.linkedin || u.linkedinUrl) setLinkedin(u.linkedin || u.linkedinUrl);
        if (u.portfolio || u.portfolioUrl) setPortfolio(u.portfolio || u.portfolioUrl);

        if (u.privacy) {
          setIsPublic(u.privacy.isPublic ?? true);
          setShowEmail(u.privacy.showEmail ?? false);
          setShowPhone(u.privacy.showPhone ?? false);
        }

        setPlatformMetrics({
          meetingsCount: u.meetingsCount || 0,
          projectsCount: u.projectsCount || 0,
          experiencesCount: u.experiencesCount || 0,
        });

        if (data.activity?.projects) setVerifiedProjects(data.activity.projects);
        if (data.activity?.experiences) setVerifiedExperiences(data.activity.experiences);
        if (data.completion) setCompletion(data.completion);

        // This route is the authenticated member's editor. Public profiles use
        // /profile/[id], so never let a query/local-storage value select a user.
        setIsSelf(true);
        fetchUserLinks(u._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkStatus = async (loggedInEmail: string, otherUserId: string) => {
    try {
      const res = await fetch(`/api/links?email=${encodeURIComponent(loggedInEmail)}&targetUserId=${otherUserId}`);
      const data = await res.json();
      if (data.connectionState) {
        setConnectionState(data.connectionState);
        if (data.link?._id) setActiveLinkId(data.link._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserLinks = async (userId: string) => {
    try {
      const res = await fetch(`/api/links?userId=${userId}`);
      const data = await res.json();
      if (data.accepted || data.pendingIncoming || data.pendingOutgoing) {
        setLinksList({
          accepted: data.accepted || [],
          pendingIncoming: data.pendingIncoming || [],
          pendingOutgoing: data.pendingOutgoing || [],
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarUploadMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    if (userEmail) formData.append('email', userEmail);
    if (profileUserId) formData.append('userId', profileUserId);

    try {
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.avatarUrl) {
        setProfilePhoto(data.avatarUrl);
        setAvatarUploadMsg('Photo uploaded and stored securely!');
        window.dispatchEvent(new CustomEvent('aptivo:profile-updated', { detail: { avatarUrl: data.avatarUrl } }));
        // Update local storage user if self
        if (isSelf && typeof window !== 'undefined') {
          try {
            const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
            stored.avatarUrl = data.avatarUrl;
            stored.profilePhoto = data.avatarUrl;
            localStorage.setItem('aptivo_user', JSON.stringify(stored));
          } catch {}
        }
      } else {
        setAvatarUploadMsg(data.error || 'Upload failed');
      }
    } catch {
      setAvatarUploadMsg('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setAvatarUploadMsg(null), 3000);
    }
  };

  const handleSendLinkRequest = async () => {
    if (!currentLoggedInEmail || !profileUserId) return;
    setLinkActionLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterEmail: currentLoggedInEmail,
          recipientId: profileUserId,
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

  const handleRespondLink = async (action: 'accept' | 'decline' | 'cancel', linkIdToUse?: string) => {
    const id = linkIdToUse || activeLinkId;
    if (!id) return;
    setLinkActionLoading(true);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userEmail: currentLoggedInEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accept') {
          setConnectionState('accepted');
        } else if (action === 'decline' || action === 'cancel') {
          setConnectionState('none');
        }
        if (profileUserId) fetchUserLinks(profileUserId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLinkActionLoading(false);
    }
  };

  const handleRemoveLink = async (linkIdToUse?: string) => {
    const id = linkIdToUse || activeLinkId;
    if (!id) return;
    if (!confirm('Are you sure you want to disconnect from this builder?')) return;
    setLinkActionLoading(true);
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setConnectionState('none');
        setActiveLinkId(null);
        if (profileUserId) fetchUserLinks(profileUserId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLinkActionLoading(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleToggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          fullName,
          phone,
          whatsapp,
          city,
          profilePhoto,
          coverImage,
          university,
          campus,
          degree,
          fieldOfStudy,
          currentYear,
          graduationYear,
          organization,
          jobTitle,
          industry,
          experienceYears,
          bio,
          skills,
          interests,
          github,
          linkedin,
          portfolio,
          privacy: {
            isPublic,
            showEmail,
            showPhone,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        const savedAvatar = data.user?.profilePhoto || data.user?.avatarUrl || profilePhoto;
        setProfilePhoto(savedAvatar);
        window.dispatchEvent(new CustomEvent('aptivo:profile-updated', { detail: { avatarUrl: savedAvatar } }));
        setSaveSuccess(true);
        if (data.completion) setCompletion(data.completion);
        if (typeof window !== 'undefined') {
          try {
            const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
            stored.fullName = fullName;
            stored.name = fullName;
            stored.university = university;
            stored.degree = degree;
            stored.profilePhoto = savedAvatar;
            stored.avatarUrl = savedAvatar;
            localStorage.setItem('aptivo_user', JSON.stringify(stored));
          } catch {}
        }
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              {accountType === 'student' ? 'Student Identity' : 'Industry Professional'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {city || 'Pakistan'}
            </span>
            {linksList.accepted.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
                {linksList.accepted.length} Links
              </span>
            )}
          </div>
          <h2 className="font-serif font-normal text-[26px] sm:text-[30px] leading-tight text-slate-900">
            {fullName || 'Builder Profile'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Central identity layer active across MEETUP, BUILD, EXPERIENCE, and SHOWCASE.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isSelf ? (
            /* Connection Action for other users */
            <div className="flex items-center gap-2">
              {connectionState === 'none' && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  disabled={linkActionLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Connect / Link</span>
                </button>
              )}
              {connectionState === 'pending_outgoing' && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Request Pending</span>
                  </span>
                  <button
                    onClick={() => handleRespondLink('cancel')}
                    disabled={linkActionLoading}
                    className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                    title="Cancel Request"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {connectionState === 'pending_incoming' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespondLink('accept')}
                    disabled={linkActionLoading}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept Request</span>
                  </button>
                  <button
                    onClick={() => handleRespondLink('decline')}
                    disabled={linkActionLoading}
                    className="px-3 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  >
                    Decline
                  </button>
                </div>
              )}
              {connectionState === 'accepted' && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected</span>
                  </span>
                  <button
                    onClick={() => handleRemoveLink()}
                    disabled={linkActionLoading}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs"
                    title="Disconnect"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Self Actions */
            <>
              <button
                onClick={() => setActiveTab(activeTab === 'links' ? 'edit' : 'links')}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  activeTab === 'links'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Link2 className="w-4 h-4 text-brand-600" />
                <span>My Network ({linksList.accepted.length})</span>
                {linksList.pendingIncoming.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Eye className="w-4 h-4 text-brand-600" />
                <span>{activeTab === 'preview' ? 'Back to Editor' : 'Public Profile'}</span>
              </button>

              {activeTab === 'edit' && (
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Note Modal for Connection Request */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Connect with {fullName}</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Add a brief note about why you want to link (e.g. project collaboration, mutual interest).
            </p>
            <textarea
              rows={3}
              value={linkNote}
              onChange={(e) => setLinkNote(e.target.value)}
              placeholder="Hi! I'd love to connect and collaborate on..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendLinkRequest}
                disabled={linkActionLoading}
                className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm"
              >
                {linkActionLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved and synced across all Connect modules!</span>
        </div>
      )}

      {/* Profile Strength Banner (when in self view) */}
      {isSelf && activeTab !== 'links' && (
        <div className="rounded-2xl bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-semibold text-slate-900">
                  Profile strength
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-950">{completion.score}% complete</h3>
              <p className="max-w-md text-sm text-slate-600">
                A complete profile helps people understand what you do and what you want to work on.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl sm:w-64 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Profile completion</span>
                <span className="text-emerald-800">{completion.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                  style={{ width: `${completion.score}%` }}
                />
              </div>
              {completion.suggestions.length > 0 && (
                <p className="text-[11px] text-slate-500 truncate">
                  Next: {completion.suggestions[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LINKS TAB (MY NETWORK) */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Pending Incoming Requests */}
          {linksList.pendingIncoming.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-700" />
                  <span>Pending Link Requests ({linksList.pendingIncoming.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linksList.pendingIncoming.map((link) => {
                  const reqUser = link.requester;
                  return (
                    <div key={link._id} className="bg-white rounded-2xl p-4 border border-amber-200/60 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={reqUser?.avatarUrl || reqUser?.profilePhoto} name={reqUser?.fullName || reqUser?.name || 'User'} size={40} />
                        <div className="min-w-0">
                          <Link href={`/profile/${reqUser?._id}`} className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate block">
                            {reqUser?.fullName || reqUser?.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate">
                            {reqUser?.university || reqUser?.organization || reqUser?.role}
                          </p>
                          {link.note && (
                            <p className="text-[10px] text-slate-600 italic mt-0.5 line-clamp-1">"{link.note}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRespondLink('accept', link._id)}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondLink('decline', link._id)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connected Links Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Connected Builders & Mentors ({linksList.accepted.length})
                </h3>
              </div>
            </div>

            {linksList.accepted.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No active links yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse the SHOWCASE or MEETUP sessions and connect with fellow builders and industry minds.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linksList.accepted.map((link) => {
                  const isRequester = link.requester._id === profileUserId;
                  const partner = isRequester ? link.recipient : link.requester;
                  return (
                    <div key={link._id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={partner?.avatarUrl || partner?.profilePhoto} name={partner?.fullName || partner?.name || 'User'} size={48} />
                        <div className="min-w-0">
                          <Link href={`/profile/${partner?._id}`} className="font-bold text-xs text-slate-900 hover:text-brand-600 truncate block">
                            {partner?.fullName || partner?.name}
                          </Link>
                          <p className="text-[11px] text-brand-700 font-semibold truncate">
                            {partner?.role === 'student' ? partner.degree || 'Student' : partner?.jobTitle || 'Professional'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {partner?.university || partner?.organization || 'Aptivo Builder'}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/profile/${partner?._id}`}
                          className="text-[11px] font-bold text-slate-700 hover:text-brand-600"
                        >
                          View Profile &rarr;
                        </Link>
                        <button
                          onClick={() => handleRemoveLink(link._id)}
                          className="text-[10px] text-slate-400 hover:text-rose-600"
                          title="Disconnect"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODE (Only when self) */}
      {isSelf && activeTab === 'edit' ? (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* SECTION 1: Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Personal Information & Photo</h3>
              </div>
            </div>

            {/* Avatar Upload Area */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <Avatar src={profilePhoto} name={fullName || 'User'} size={80} className="border-2 border-brand-500 shadow-sm" />
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-slate-900">Profile Picture (GridFS Encrypted)</h4>
                <p className="text-[11px] text-slate-500">
                  Upload high-res JPG, PNG, or WEBP up to 5MB. Rendered across your profile, project showcases, and links.
                </p>
                <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                  </button>
                  {avatarUploadMsg && (
                    <span className="text-xs font-semibold text-emerald-700">{avatarUploadMsg}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Account ID)</label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL (Optional Override)</label>
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Academic / Professional Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              {accountType === 'student' ? (
                <GraduationCap className="w-5 h-5 text-brand-600" />
              ) : (
                <Briefcase className="w-5 h-5 text-blue-600" />
              )}
              <h3 className="font-extrabold text-slate-900 text-lg">
                {accountType === 'student' ? 'Academic Information' : 'Professional Information'}
              </h3>
            </div>

            {accountType === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University / Institute *</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campus</label>
                  <input
                    type="text"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    placeholder="e.g. Main Campus"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Program *</label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study *</label>
                  <input
                    type="text"
                    required
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Masters / PhD">Masters / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Company *</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Field</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="1-3 years">1–3 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5-10 years">5–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: About Bio */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">About & Bio</h3>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you are passionate about building or researching..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* SECTION 4: Skills & Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Skills & Tools</h3>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs"
                  >
                    <span>{s}</span>
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(customSkill);
                      setCustomSkill('');
                    }
                  }}
                  placeholder="Type skill & press Add"
                  className="flex-1 p-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAddSkill(customSkill);
                    setCustomSkill('');
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_SKILLS.slice(0, 8).map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => handleAddSkill(ps)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    + {ps}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Domain Interests</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(accountType === 'student' ? PRESET_INTERESTS_STUDENT.slice(0, 8) : PRESET_INTERESTS_PRO).map((int) => {
                  const isSel = interests.includes(int);
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => handleToggleInterest(int)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between ${
                        isSel
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{int}</span>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 5: Links */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">Links & Portfolio</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://mywebsite.me"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Privacy Settings */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-700" />
              <h3 className="font-extrabold text-slate-900 text-lg">Privacy & Public Visibility</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  Make my profile visible to other Aptivo Connect builders and mentors
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs text-slate-600">Show email address on public profile</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs text-slate-600">Show WhatsApp / Phone number on public profile</span>
              </label>
            </div>
          </div>
        </form>
      ) : activeTab === 'preview' ? (
        /* PREVIEW MODE: Public Profile View */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-8 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isSelf ? 'Public View Preview' : 'Builder Profile'}
              </span>
            </div>
            {isSelf && (
              <button
                onClick={() => setActiveTab('edit')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                &larr; Return to Edit Mode
              </button>
            )}
          </div>

          {/* Living profile identity */}
          <div className="overflow-hidden rounded-[24px] border border-[#E4E7E2] bg-white">
            {coverImage ? <MediaImage src={coverImage} alt={`${fullName} cover`} kind="build" className="h-32 sm:h-44"/> : <div className="relative h-32 overflow-hidden bg-[#E4EEE8] sm:h-44"><div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border border-[#287A5B]/40"/><div className="absolute left-[18%] top-8 h-2.5 w-2.5 rounded-full bg-[#E86F51]"/><div className="absolute left-[28%] top-12 h-px w-40 rotate-[-18deg] bg-[#287A5B]/50"/><div className="absolute right-[22%] bottom-8 h-3 w-3 rounded-full bg-[#174D3A]"/></div>}
            <div className="relative px-5 pb-5 sm:px-7">
              <Avatar src={profilePhoto} name={fullName || 'User'} size={96} className="-mt-12 border-4 border-white shadow-sm" />
              <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Aptivo ID
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-700">
                {accountType === 'student' ? `${degree || 'Student'} • ${university || 'University'}` : `${jobTitle || 'Professional'} • ${organization || 'Organization'}`}
              </p>
              <p className="text-xs text-slate-400">{city || 'Pakistan'}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">About</p>
              <p>{bio}</p>
            </div>
          )}

          {/* Skills & Interests Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills & Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills listed yet</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Domain Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {interests.length > 0 ? (
                  interests.map((int) => (
                    <span key={int} className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      {int}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No interests listed</span>
                )}
              </div>
            </div>
          </div>

          {/* Verified Projects Showcase */}
          {verifiedProjects.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Projects ({verifiedProjects.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {verifiedProjects.map((proj: any) => (
                  <div key={proj._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-700">{proj.field}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{proj.building || proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-700">
            {github && (
              <a href={github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-900 hover:underline">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {portfolio && (
              <a href={portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-700 hover:underline">
                <Globe className="w-4 h-4" /> Portfolio
              </a>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
