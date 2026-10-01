'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, LogIn, User, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aptivo_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSignOut = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    try { localStorage.removeItem('aptivo_user'); } catch {}
    setCurrentUser(null);
    window.location.replace('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F6F1]">
      <div className="mx-auto flex h-[56px] sm:h-[64px] lg:h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Wordmark */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif font-normal text-[22px] lg:text-[26px] tracking-[-0.01em] text-[#18201C]">Aptivo</span>
          <span className="font-sans text-[13px] lg:text-[14px] font-semibold text-[#174D3A] -mt-0.5">Connect</span>
        </Link>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <Link href="/admin" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#69736D] hover:text-[#174D3A] transition-colors font-sans">
                  <ShieldCheck className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#174D3A] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#287A5B] font-sans shadow-sm"
              >
                <User className="w-4 h-4" />
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={handleSignOut} title="Sign Out" className="p-2 rounded-full text-[#69736D] hover:text-[#E86F51] hover:bg-[#FCE9E3] transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-[13px] font-medium text-[#69736D] hover:text-[#18201C] transition-colors font-sans">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E86F51] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#cf5e43] font-sans"
              >
                Join Connect
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Login + Join + Menu */}
        <div className="flex items-center gap-3 md:hidden">
          {!currentUser && (
            <>
              <Link href="/auth/login" className="text-[13px] font-medium text-[#69736D] font-sans">Login</Link>
              <Link href="/auth/register" className="inline-flex items-center rounded-full bg-[#E86F51] px-4 py-1.5 text-[12px] font-semibold text-white font-sans">
                Join Connect
              </Link>
            </>
          )}
          {currentUser && (
            <Link href="/dashboard" className="text-[13px] font-medium text-[#174D3A] font-sans">Dashboard</Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#18201C] hover:bg-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E4E7E2] px-5 py-5 space-y-3 animate-in slide-in-from-top-2 shadow-sm">
          <Link href="/#pillars" onClick={() => setMobileMenuOpen(false)} className="block text-[14px] font-medium text-[#18201C] py-2 font-sans">
            Explore Connect
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-[14px] font-medium text-[#18201C] py-2 font-sans">
            How It Works
          </Link>
          <div className="pt-3 border-t border-[#E4E7E2] flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl bg-[#174D3A] text-white font-semibold text-[13px] font-sans">
                  Go to Dashboard
                </Link>
                {currentUser.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 rounded-xl bg-[#E4EEE8] text-[#174D3A] font-semibold text-[13px] font-sans">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="w-full text-center py-2 rounded-xl border border-[#E4E7E2] text-[#69736D] font-medium text-[13px] font-sans"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl border border-[#E4E7E2] text-[#18201C] font-semibold text-[13px] font-sans">
                  Login
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl bg-[#E86F51] text-white font-semibold text-[13px] font-sans">
                  Join Connect
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
