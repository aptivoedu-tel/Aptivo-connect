'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // User Profile State
  const [userEmail, setUserEmail] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'professional'>('student');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

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
    accessCount: 0,
  });

  const [verifiedProjects, setVerifiedProjects] = useState<any[]>([]);
  const [verifiedExperiences, setVerifiedExperiences] = useState<any[]>([]);

  // Completion stats
  const [completion, setCompletion] = useState<ProfileCompletionResult>({
    score: 0,
    suggestions: [],
    isComplete: false,
  });

  const fetchProfile = async (emailOverride?: string) => {
    const emailToFetch = emailOverride || userEmail;
    if (!emailToFetch) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(emailToFetch)}`);
      const data = await res.json();
      if (data.user) {
        const u = data.user;
        setUserEmail(u.email);
        setFullName(u.fullName || u.name || '');
        setAccountType(u.accountType || u.role || 'student');
        if (u.phone) setPhone(u.phone);
        if (u.whatsapp) setWhatsapp(u.whatsapp);
        if (u.city) setCity(u.city);
        if (u.profilePhoto || u.avatarUrl) setProfilePhoto(u.profilePhoto || u.avatarUrl);

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
          accessCount: u.accessCount || 0,
        });

        if (data.activity?.projects) setVerifiedProjects(data.activity.projects);
        if (data.activity?.experiences) setVerifiedExperiences(data.activity.experiences);
        if (data.completion) setCompletion(data.completion);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let email = '';
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        email = urlParams.get('email') || '';
        if (!email) {
          const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
          email = stored.email || '';
        }
      } catch {}
    }
    if (email) {
      setUserEmail(email);
      fetchProfile(email);
    } else {
      setLoading(false);
    }
  }, []);

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
        setSaveSuccess(true);
        if (data.completion) setCompletion(data.completion);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading your profile...</div>;
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
              {city || 'Karachi, PK'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {fullName || 'Student Profile'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Central identity layer reused automatically across MEET, BUILD, EXPERIENCE, and ACCESS.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Eye className="w-4 h-4 text-brand-600" />
            <span>{activeTab === 'preview' ? 'Back to Editor' : 'View Public Profile'}</span>
          </button>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved and synced across all Connect modules!</span>
        </div>
      )}

      {/* Profile Strength Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-darkpine-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Aptivo Identity Strength
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Profile {completion.score}% Complete</h3>
            <p className="text-xs text-emerald-200/80 max-w-md">
              A comprehensive profile increases your chance of acceptance into BUILD project teams and workplace tours.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 sm:w-64 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Strength</span>
              <span className="text-brand-400">{completion.score}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completion.score}%` }}
              />
            </div>
            {completion.suggestions.length > 0 && (
              <p className="text-[10px] text-emerald-200/70 truncate">
                Next: {completion.suggestions[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODE */}
      {activeTab === 'edit' ? (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* SECTION 1: Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-brand-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">Personal Information</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
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
                    placeholder="e.g. Karachi Campus"
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
            {/* Skills */}
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

            {/* Interests */}
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
                  Make my profile visible to other Aptivo Connect students and mentors
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
      ) : (
        /* PREVIEW MODE: Exact Public Profile View */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-8 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Public View Preview
              </span>
            </div>
            <button
              onClick={() => setActiveTab('edit')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              &larr; Return to Edit Mode
            </button>
          </div>

          {/* Profile Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-900 text-white font-black text-3xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative shrink-0">
              {profilePhoto ? (
                <Image src={profilePhoto} alt={fullName} fill className="object-cover" unoptimized />
              ) : (
                fullName.charAt(0) || 'U'
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Aptivo ID
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-700">
                {accountType === 'student' ? `${degree} • ${university}` : `${jobTitle} • ${organization}`}
              </p>
              <p className="text-xs text-slate-400">{city || 'Pakistan'}</p>
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
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Domain Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((int) => (
                  <span key={int} className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    {int}
                  </span>
                ))}
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
                {verifiedProjects.map((proj) => (
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
      )}
    </div>
  );
}
