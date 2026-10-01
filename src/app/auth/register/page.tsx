'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  Phone,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'student' | 'professional'>('student');

  // Basic Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('Karachi');

  // Student Fields
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [currentYear, setCurrentYear] = useState('1st Year');
  const [graduationYear, setGraduationYear] = useState('2027');

  // Professional Fields
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceYears, setExperienceYears] = useState('1-3 years');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          accountType,
          phone,
          whatsapp: whatsapp || phone,
          city,
          university,
          degree,
          fieldOfStudy: fieldOfStudy || degree,
          currentYear,
          graduationYear,
          organization,
          jobTitle,
          industry,
          experienceYears,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Registration failed.');
      } else {
        if (data.user) {
          try {
            localStorage.setItem('aptivo_user', JSON.stringify(data.user));
          } catch {}
        }
        setSuccess(true);
        setTimeout(() => {
          router.replace(data.redirectTo || `/onboarding?email=${encodeURIComponent(email)}`);
        }, 1000);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-500/10 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-darkpine-900 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-brand-200" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            Aptivo <span className="text-brand-600">Connect</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Join the opportunity ecosystem connecting ambitious students with real mentors, project teams, and company visits.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          {/* Account Type Selector (Student vs Professional ONLY - NO AMBASSADOR) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                accountType === 'student'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('professional')}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                accountType === 'professional'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Professional</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Account created! Redirecting to onboarding...</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
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

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hamza@fast.edu.pk or student@gmail.com"
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Phone & WhatsApp */}
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

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Karachi, Lahore, Islamabad"
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>

            {/* Student Specific Fields */}
            {accountType === 'student' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs font-bold text-brand-700 uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Details</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University / Institute *</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. FAST-NUCES Karachi, LUMS, NED, NUST"
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
                      placeholder="e.g. Computer Science, AI"
                      className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
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
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Masters / PhD">Masters / PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expected Graduation Year *</label>
                    <input
                      type="text"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g. 2027"
                      className="w-full p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional Specific Fields */}
            {accountType === 'professional' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Professional Information</span>
                </div>

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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Field / Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Software & AI, FinTech"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-600 font-bold hover:underline">
              Sign In here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
