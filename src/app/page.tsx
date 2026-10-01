'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Hammer, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const pillars = [
  { name: 'Meet', label: 'People', icon: UsersRound, desc: 'Join talks, workshops and sessions with people in your field.' },
  { name: 'Build', label: 'Projects', icon: Hammer, desc: 'Find collaborators and work on projects with real purpose.' },
  { name: 'Experience', label: 'Opportunities', icon: Building2, desc: 'Step into companies, labs and workplaces through curated visits.' },
  { name: 'Grow', label: 'Your Profile', icon: TrendingUp, desc: 'Your skills, work and verified participation — all in one place.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F7F6F1] text-[#18201C]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#F7F6F1] px-5 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:px-10 lg:pt-14">
        <div className="relative mx-auto max-w-7xl">
          {/* Mobile / single-column layout first */}
          <div className="lg:grid lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-14">
            {/* LEFT: text */}
            <div className="max-w-xl">
              <h1 className="font-serif font-normal text-[clamp(2.75rem,6.5vw,3.25rem)] leading-[1.02] tracking-[-0.02em] text-[#18201C]">
                Meet.<br />Build.<br /><span className="text-[#174D3A]">Experience.</span>
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[#69736D] font-sans sm:text-base">
                Connect is where students find people, collaborate on real projects and access experiences that help them grow.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#E86F51] px-7 text-[14px] font-semibold text-white transition hover:bg-[#cf5e43] active:scale-[0.98] font-sans"
                >
                  Join Connect <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full px-4 text-[14px] font-medium text-[#174D3A] transition hover:bg-white font-sans"
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* RIGHT: organic visual composition */}
            <div aria-hidden="true" className="relative mx-auto mt-10 h-[340px] w-full max-w-[500px] sm:h-[400px] lg:mt-0">
              {/* Connection curves — thin Forest lines */}
              <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" fill="none">
                <path d="M112 202 C170 80 300 60 380 158 C436 226 354 324 258 294 C184 272 174 167 245 132 C302 104 362 152 350 204" stroke="#174D3A" strokeWidth="1.2" strokeDasharray="4 7" opacity="0.5" />
                <path d="M112 202L245 132M258 294L350 204" stroke="#174D3A" strokeWidth="1" opacity="0.3" />
              </svg>

              {/* Sage abstract forms */}
              <div className="absolute left-[5%] top-[15%] h-28 w-28 rounded-full bg-[#E4EEE8] opacity-60" />
              <div className="absolute right-[10%] bottom-[10%] h-20 w-20 rounded-[2rem] bg-[#E4EEE8] opacity-50 rotate-12" />

              {/* Image blobs with organic masks */}
              <div className="absolute left-[8%] top-[30%] h-28 w-28 overflow-hidden rounded-[2rem] shadow-[0_12px_26px_rgba(24,32,28,.12)] sm:h-32 sm:w-32">
                <div className="h-full w-full bg-[#174D3A] flex items-center justify-center text-white">
                  <UsersRound className="h-12 w-12" />
                </div>
              </div>
              <div className="absolute left-[42%] top-[8%] h-24 w-24 overflow-hidden rounded-[1.8rem] shadow-lg sm:h-28 sm:w-28">
                <div className="h-full w-full bg-[#FCE9E3] flex items-center justify-center text-[#A94431]">
                  <Hammer className="h-10 w-10" />
                </div>
              </div>
              <div className="absolute right-[4%] top-[28%] h-24 w-24 overflow-hidden rounded-[1.8rem] shadow-[0_10px_22px_rgba(24,32,28,.08)] sm:h-28 sm:w-28">
                <div className="h-full w-full bg-[#E4EEE8] flex items-center justify-center text-[#174D3A]">
                  <Building2 className="h-10 w-10" />
                </div>
              </div>
              <div className="absolute left-[44%] bottom-[8%] h-[4.5rem] w-[4.5rem] overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-[#E4E7E2] shadow-[0_10px_22px_rgba(24,32,28,.08)] flex items-center justify-center text-[#174D3A]">
                <Sparkles className="h-7 w-7" />
              </div>

              {/* Small Coral and Forest nodes */}
              <span className="absolute left-[5%] top-[20%] h-3 w-3 rounded-full bg-[#287A5B]" />
              <span className="absolute right-[18%] top-[10%] h-2.5 w-2.5 rounded-full bg-[#E86F51]" />
              <span className="absolute right-[3%] bottom-[18%] h-3 w-3 rounded-full bg-[#287A5B]" />

              <div className="absolute left-[30%] top-[52%] rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-[#18201C] shadow-sm ring-1 ring-[#E4E7E2] font-sans">Ideas connect here</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CONCEPTUAL PROGRESSION ─── */}
      <section className="border-t border-[#E4E7E2] bg-[#F7F6F1]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 gap-x-4 px-5 py-12 sm:grid-cols-4 sm:px-8 lg:px-10">
          {pillars.map(({ name, label, icon: Icon, desc }) => (
            <div key={name} className="text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#E4EEE8] text-[#174D3A]">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <p className="text-[13px] font-semibold text-[#18201C] font-sans">{name}</p>
              <p className="text-[12px] text-[#69736D] font-sans">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-t border-[#E4E7E2] bg-[#E4EEE8]/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-16 lg:px-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#287A5B] font-sans">How Connect works</p>
            <h2 className="font-serif font-normal text-[clamp(1.75rem,4vw,2.125rem)] leading-tight text-[#18201C] mt-2">A profile that grows with you.</h2>
          </div>
          <p className="max-w-2xl text-[15px] leading-[1.65] text-[#69736D] font-sans">
            Take part in meetups, collaborate on projects and join real-world experiences. Your Aptivo profile brings your skills, work and verified participation together as you go.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-[#E4E7E2]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-12 sm:px-8 md:flex-row md:items-center md:py-16 lg:px-10">
          <div>
            <h2 className="font-serif font-normal text-[clamp(1.5rem,3.5vw,1.875rem)] leading-tight text-[#18201C]">Your next step starts with a connection.</h2>
            <p className="mt-2 text-[13px] text-[#69736D] font-sans">Create your profile and find a way in.</p>
          </div>
          <Link href="/auth/register" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#174D3A] px-7 text-[14px] font-semibold text-white transition hover:bg-[#287A5B] font-sans">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
