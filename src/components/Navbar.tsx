'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowRight, LogIn, UserPlus, User, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aptivo_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSignOut = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    try {
      localStorage.removeItem('aptivo_user');
    } catch {}
    setCurrentUser(null);
    window.location.replace('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-darkpine-900 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-brand-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Aptivo</span>
              <span className="font-semibold text-xl tracking-tight text-brand-600">Connect</span>
            </div>
            <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
              Meet · Build · Experience
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="/#pillars" className="hover:text-brand-600 transition-colors">
            Explore
          </Link>
          <Link href="/#how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
          <Link href="/#faq" className="hover:text-brand-600 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              {currentUser.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors rounded-full border border-emerald-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
                  <span>Admin Hub</span>
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm group"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>Dashboard ({currentUser.fullName?.split(' ')[0] || currentUser.name?.split(' ')[0] || 'User'})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm group"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-2">
          <Link
            href="/#pillars"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-brand-600"
          >
            Explore Connect
          </Link>
          <Link
            href="/showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-brand-600"
          >
            Meet, Build & Experience
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-brand-600"
          >
            How It Works
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-brand-600"
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-brand-400" />
                  <span>Go to Dashboard ({currentUser.fullName?.split(' ')[0] || currentUser.name?.split(' ')[0] || 'User'})</span>
                </Link>
                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-sm"
                  >
                    Admin Operations Hub
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account (Student / Pro)</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

