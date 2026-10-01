'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Compass,
  Link2,
  ShieldCheck,
} from 'lucide-react';

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

function OnboardingInner() {
  const router = useRouter();
  const [targetEmail, setTargetEmail] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form State
  const [accountType, setAccountType] = useState<'student' | 'professional'>('student');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');

  // Student Fields
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [currentYear, setCurrentYear] = useState('1st Year');
  const [graduationYear, setGraduationYear] = useState('');

  // Professional Fields
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceYears, setExperienceYears] = useState('1-3 years');

  // Bio, Skills, Interests, Links
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Fetch initial profile if exists
  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const u = data.user;
          setTargetEmail(u.email || '');
          setFullName(u.fullName || u.name || '');
          setAccountType(u.accountType || u.role || 'student');
          if (u.phone) setPhone(u.phone);
          if (u.whatsapp) setWhatsapp(u.whatsapp);
          if (u.city) setCity(u.city);
          if (u.university) setUniversity(u.university);
          if (u.degree) setDegree(u.degree);
          if (u.fieldOfStudy || u.field) setFieldOfStudy(u.fieldOfStudy || u.field);
          if (u.currentYear) setCurrentYear(u.currentYear);
          if (u.graduationYear || u.expectedGraduation) setGraduationYear(u.graduationYear || u.expectedGraduation);
          if (u.organization) setOrganization(u.organization);
          if (u.jobTitle || u.professionalRole) setJobTitle(u.jobTitle || u.professionalRole);
          if (u.industry) setIndustry(u.industry);
          if (u.experienceYears) setExperienceYears(u.experienceYears);
          if (u.bio) setBio(u.bio);
          if (u.skills && u.skills.length > 0) setSkills(u.skills);
          if (u.interests && u.interests.length > 0) setInterests(u.interests);
          if (u.github || u.githubUrl) setGithub(u.github || u.githubUrl);
          if (u.linkedin || u.linkedinUrl) setLinkedin(u.linkedin || u.linkedinUrl);
          if (u.portfolio || u.portfolioUrl) setPortfolio(u.portfolio || u.portfolioUrl);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const saveProfileUpdates = async () => {
    if (!targetEmail) return;
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          fullName,
          phone,
          whatsapp,
          city,
          university,
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
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProfileUpdates();
    if (step < 5) {
      setStep(step + 1);
    } else {
      setCompleted(true);
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    }
  };

  // Completion calculation for live meter
  const completionPercentage = Math.min(
    100,
    (fullName ? 15 : 0) +
      (phone && whatsapp ? 15 : 0) +
      (accountType === 'student' ? (university ? 20 : 0) : (organization ? 20 : 0)) +
      (bio.length >= 20 ? 15 : 0) +
      (skills.length >= 3 ? 15 : 0) +
      (interests.length >= 2 ? 10 : 0) +
      (github || linkedin || portfolio ? 10 : 0)
  );

  const stepsList = [
    { num: 1, label: 'Basic Info', icon: User },
    { num: 2, label: accountType === 'student' ? 'Education' : 'Experience', icon: accountType === 'student' ? GraduationCap : Briefcase },
    { num: 3, label: 'Skills & Bio', icon: Layers },
    { num: 4, label: 'Interests', icon: Compass },
    { num: 5, label: 'Links', icon: Link2 },
  ];

  if (loading) {
    return <div className="py-24 text-center text-slate-400 text-sm">Loading onboarding...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-brand-500/10 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-600 to-darkpine-900 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4 text-brand-200" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Aptivo <span className="text-brand-600">Connect</span>
          </span>
        </Link>

        {/* Live Completion Badge */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-700">Profile Strength:</span>
          <span className="text-xs font-black text-brand-600">{completionPercentage}%</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 relative z-10 space-y-6">
        {/* Progress Step Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            {stepsList.map((s, idx) => {
              const Icon = s.icon;
              const isPast = step > s.num;
              const isCurrent = step === s.num;

              return (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setStep(s.num)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group"
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-md ring-4 ring-brand-500/20'
                          : isPast
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] font-semibold hidden sm:block ${
                        isCurrent ? 'text-slate-900 font-bold' : isPast ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {idx < stepsList.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > idx + 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Body Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-6">
          {completed ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Profile Setup Completed!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your Aptivo Connect identity is active. Redirecting you to your opportunity dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Set up your name and verified contact channels for session invites.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Hamza Raza"
                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
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
                          placeholder="+92 300 1234567"
                          className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Karachi, Lahore, Islamabad"
                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Education / Professional Work */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {accountType === 'student' ? 'Academic Information' : 'Professional Background'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {accountType === 'student'
                        ? 'Helps mentors and project leads understand your academic level.'
                        : 'Showcases your industry expertise for student mentorship and visits.'}
                    </p>
                  </div>

                  {accountType === 'student' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">University / Institute *</label>
                        <input
                          type="text"
                          required
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="e.g. FAST-NUCES, LUMS, NED, NUST, GIKI"
                          className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Program *</label>
                          <input
                            type="text"
                            required
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            placeholder="e.g. BS Computer Science"
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study *</label>
                          <input
                            type="text"
                            required
                            value={fieldOfStudy}
                            onChange={(e) => setFieldOfStudy(e.target.value)}
                            placeholder="e.g. Computer Science, AI, Robotics"
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Year *</label>
                          <select
                            value={currentYear}
                            onChange={(e) => setCurrentYear(e.target.value)}
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                          >
                            <option value="1st Year">1st Year (Freshman)</option>
                            <option value="2nd Year">2nd Year (Sophomore)</option>
                            <option value="3rd Year">3rd Year (Junior)</option>
                            <option value="4th Year">4th Year (Senior / Final Year)</option>
                            <option value="Masters / PhD">Masters / PhD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expected Graduation Year *</label>
                          <input
                            type="text"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            placeholder="e.g. 2026"
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Company *</label>
                          <input
                            type="text"
                            required
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="e.g. 10Pearls, Systems Ltd, NESPAK"
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
                            placeholder="e.g. Senior Machine Learning Engineer"
                            className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Field *</label>
                          <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g. Software & AI, FinTech, Healthcare"
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
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Skills & Bio */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Skills & About Bio</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Add tools and skills you use or want to build with in BUILD teams.
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Skill Tags (Select or type custom)</label>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-h-[50px]">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            className="hover:text-rose-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Custom skill input */}
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
                        placeholder="Type a skill (e.g. PyTorch, Rust, Solidity) and press Add"
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleAddSkill(customSkill);
                          setCustomSkill('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                      >
                        Add
                      </button>
                    </div>

                    {/* Popular presets */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Popular Presets (Click to add):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SKILLS.slice(0, 15).map((ps) => (
                          <button
                            key={ps}
                            type="button"
                            onClick={() => handleAddSkill(ps)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                              skills.includes(ps)
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 opacity-60'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            + {ps}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-slate-700">Short Bio / About *</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. 3rd-year CS student passionate about building computer vision tools for healthcare diagnostics..."
                      className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Domain Interests */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Domain Interests</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Select fields you want to explore through MEET mentors, BUILD projects, and workplace EXPERIENCE.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(accountType === 'student' ? PRESET_INTERESTS_STUDENT : PRESET_INTERESTS_PRO).map((int) => {
                      const isSelected = interests.includes(int);
                      return (
                        <button
                          key={int}
                          type="button"
                          onClick={() => handleToggleInterest(int)}
                          className={`p-3.5 rounded-2xl text-left border transition-all text-xs font-bold flex items-center justify-between ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{int}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Links & Public Portfolio */}
              {step === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio & Links</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Link your GitHub, LinkedIn, or portfolio to strengthen your applications across BUILD and EXPERIENCE.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/yourhandle"
                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio / Personal Website</label>
                      <input
                        type="url"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://mywebsite.me"
                        className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-3">
                  {step < 5 && (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Skip step
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    <span>{saving ? 'Saving...' : step === 5 ? 'Complete Profile' : 'Save & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OnboardingInner />
    </Suspense>
  );
}
