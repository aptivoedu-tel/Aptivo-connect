import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Aptivo <span className="text-brand-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              We connect students to things they would not easily reach on their own:
              top industry minds, real project teams, work environments, and exclusive access.
            </p>
            <div className="text-xs text-brand-400 font-mono">
              Not an LMS. Not a course catalog. An active opportunity engine.
            </div>
          </div>

          {/* Pillars Col */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Opportunity Pillars
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard/meetup" className="hover:text-white transition-colors">
                  MEETUP (Events & Sessions)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/build" className="hover:text-white transition-colors">
                  BUILD (Projects & Teams)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/experience" className="hover:text-white transition-colors">
                  EXPERIENCE (Visits & Labs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Platform & Showcase
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/showcase" className="hover:text-white transition-colors">
                  Verified Showcase
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-white transition-colors">
                  Student Identity
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Sign In (Unified Portal)
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Connect HQ
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students across FAST, LUMS, NED, NUST, Habib, GIKI and universities nationwide.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Phase 2 Active
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Aptivo Connect. Built with purpose for students.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted for high ambition</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by Aptivo Ecosystem</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
