'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Clock, Trash2, ArrowRight } from 'lucide-react';

interface INotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-200 font-sans">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#174D3A]">Updates</p>
          <h1 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] mt-1">
            Notifications
          </h1>
          <p className="mt-1.5 text-[14px] text-[#69736D]">
            Stay updated on team invites, meetup registrations, and link requests.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-[13px] font-semibold text-[#174D3A] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#69736D] text-[14px]">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-dashed border-[#E4E7E2] p-10 text-center space-y-2">
          <Bell className="w-8 h-8 text-[#69736D] mx-auto" />
          <h3 className="font-serif font-normal text-[18px] text-[#18201C]">No notifications yet</h3>
          <p className="text-[13px] text-[#69736D]">
            When you receive team updates or connection requests, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-[16px] border p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                n.read ? 'bg-white border-[#E4E7E2]' : 'bg-[#E4EEE8]/40 border-[#174D3A]/20'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    n.read ? 'bg-[#F7F6F1] text-[#69736D]' : 'bg-[#174D3A] text-white'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="font-semibold text-[14px] text-[#18201C]">{n.title}</h4>
                  <p className="text-[13px] text-[#69736D] leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-[#69736D] pt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#E4E7E2] px-3 py-1 text-[12px] font-semibold text-[#174D3A] hover:bg-[#F7F6F1]"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
