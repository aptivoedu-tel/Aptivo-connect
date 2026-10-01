'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Shield, Bell, User, Lock, Eye, LogOut, CheckCircle2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [appearInDiscovery, setAppearInDiscovery] = useState(true);
  const [appearInCampus, setAppearInCampus] = useState(true);
  const [allowConnectionRequests, setAllowConnectionRequests] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.privacy) {
            setIsPublic(data.user.privacy.isPublic ?? true);
            setShowEmail(data.user.privacy.showEmail ?? false);
            setShowPhone(data.user.privacy.showPhone ?? false);
            setAppearInDiscovery(data.user.privacy.appearInDiscovery ?? true);
            setAppearInCampus(data.user.privacy.appearInCampus ?? true);
            setAllowConnectionRequests(data.user.privacy.allowConnectionRequests ?? true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacy: {
            isPublic,
            showEmail,
            showPhone,
            appearInDiscovery,
            appearInCampus,
            allowConnectionRequests,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    try { localStorage.removeItem('aptivo_user'); } catch {}
    window.location.replace('/auth/login');
  };

  if (loading) {
    return <div className="py-12 text-center text-[#69736D] text-[14px] font-sans">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-200 font-sans">
      <div>
        <p className="text-[13px] font-semibold text-[#174D3A]">Account</p>
        <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
          Settings & Privacy
        </h1>
        <p className="mt-1.5 text-[14px] text-[#69736D]">
          Manage your account preferences, visibility, and security controls.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-[14px] bg-[#E4EEE8] border border-[#174D3A]/20 text-[13px] font-semibold text-[#174D3A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#174D3A]" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Privacy Section */}
        <div className="bg-white rounded-[16px] border border-[#E4E7E2] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E7E2]">
            <Shield className="w-5 h-5 text-[#174D3A]" />
            <h2 className="font-serif font-normal text-[20px] text-[#18201C]">Privacy & Discovery</h2>
          </div>

          <div className="space-y-4 text-[13px]">
            <label className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F6F1] hover:bg-[#E4EEE8]/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-[#18201C] block">Public Profile</span>
                <span className="text-[#69736D] text-[12px]">Allow other builders to view your profile and work</span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded text-[#174D3A] focus:ring-[#174D3A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F6F1] hover:bg-[#E4EEE8]/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-[#18201C] block">Appear in Campus Directory</span>
                <span className="text-[#69736D] text-[12px]">Show your profile in student & university directory search</span>
              </div>
              <input
                type="checkbox"
                checked={appearInCampus}
                onChange={(e) => setAppearInCampus(e.target.checked)}
                className="h-4 w-4 rounded text-[#174D3A] focus:ring-[#174D3A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F6F1] hover:bg-[#E4EEE8]/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-[#18201C] block">Allow Connection Requests</span>
                <span className="text-[#69736D] text-[12px]">Let other students and mentors send you link requests</span>
              </div>
              <input
                type="checkbox"
                checked={allowConnectionRequests}
                onChange={(e) => setAllowConnectionRequests(e.target.checked)}
                className="h-4 w-4 rounded text-[#174D3A] focus:ring-[#174D3A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F6F1] hover:bg-[#E4EEE8]/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-[#18201C] block">Show Email on Profile</span>
                <span className="text-[#69736D] text-[12px]">Display your email address to verified connections</span>
              </div>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="h-4 w-4 rounded text-[#174D3A] focus:ring-[#174D3A]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[12px] bg-[#F7F6F1] hover:bg-[#E4EEE8]/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-[#18201C] block">Show Phone on Profile</span>
                <span className="text-[#69736D] text-[12px]">Display your contact phone number to verified connections</span>
              </div>
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="h-4 w-4 rounded text-[#174D3A] focus:ring-[#174D3A]"
              />
            </label>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-[16px] border border-[#E4E7E2] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E7E2]">
            <User className="w-5 h-5 text-[#174D3A]" />
            <h2 className="font-serif font-normal text-[20px] text-[#18201C]">Account Details</h2>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[#69736D] block">Account Email</span>
              <span className="font-semibold text-[#18201C]">{user?.email}</span>
            </div>
            <div>
              <span className="text-[#69736D] block">Role / Account Type</span>
              <span className="font-semibold text-[#18201C] capitalize">{user?.accountType || user?.role || 'Student'}</span>
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-[#E4E7E2] px-5 py-2.5 text-[13px] font-semibold text-rose-700 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#174D3A] hover:bg-[#287A5B] px-6 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
