'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  User,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';

interface IParticipant {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  profilePhoto?: string;
  university?: string;
  jobTitle?: string;
  organization?: string;
}

interface IConversation {
  _id: string;
  participants: IParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderId?: IParticipant | string;
}

interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConv, setActiveConv] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load conversations
  useEffect(() => {
    let email = '';
    let id = '';
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('aptivo_user') || '{}');
        email = stored.email || '';
        id = stored._id || '';
        setCurrentUserId(id);
        setCurrentUserEmail(email);

        const urlParams = new URLSearchParams(window.location.search);
        const recipientParam = urlParams.get('recipient');
        const convParam = urlParams.get('conv');

        loadConversations(email, id, recipientParam, convParam);
      } catch {}
    }
  }, []);

  const loadConversations = async (
    email: string,
    userId: string,
    recipientParam?: string | null,
    convParam?: string | null
  ) => {
    try {
      const res = await fetch(`/api/conversations?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      const list: IConversation[] = data.conversations || [];
      setConversations(list);

      // Handle opening specific conversation or recipient from URL
      if (convParam) {
        const target = list.find((c) => c._id === convParam);
        if (target) {
          selectConversation(target, email);
          return;
        }
      }

      if (recipientParam) {
        // Start or select conversation with recipient
        const resStart = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderEmail: email, recipientId: recipientParam }),
        });
        const startData = await resStart.json();
        if (startData.conversation) {
          const freshList = [
            startData.conversation,
            ...list.filter((c) => c._id !== startData.conversation._id),
          ];
          setConversations(freshList);
          selectConversation(startData.conversation, email);
          return;
        }
      }

      if (list.length > 0 && !activeConv) {
        selectConversation(list[0], email);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: IConversation, email = currentUserEmail) => {
    setActiveConv(conv);
    try {
      const res = await fetch(
        `/api/messages?conversationId=${conv._id}&email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time polling when active conversation is selected
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages?conversationId=${activeConv._id}&email=${encodeURIComponent(currentUserEmail)}`
        );
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConv, currentUserEmail]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    const other = activeConv.participants.find(
      (p) => p._id?.toString() !== currentUserId && p.email !== currentUserEmail
    );

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv._id,
          senderEmail: currentUserEmail,
          recipientId: other?._id,
          content,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        // Update local last message
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConv._id
              ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const other = c.participants.find(
      (p) => p._id?.toString() !== currentUserId && p.email !== currentUserEmail
    );
    const name = other?.fullName || other?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipant = (conv: IConversation | null) => {
    if (!conv) return null;
    return conv.participants.find(
      (p) => p._id?.toString() !== currentUserId && p.email !== currentUserEmail
    );
  };

  const activePartner = getOtherParticipant(activeConv);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Conversations List */}
        <aside
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col shrink-0 bg-slate-50/50 ${
            activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <span>Messages</span>
              </h2>
              <Link
                href="/dashboard/people"
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                + New Chat
              </Link>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">No conversations yet</p>
                <p className="text-[11px] text-slate-500">
                  Discover builders in People or Links to start a chat.
                </p>
                <Link
                  href="/dashboard/people"
                  className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-[11px] font-bold"
                >
                  Discover People
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = getOtherParticipant(conv);
                const displayName = partner?.fullName || partner?.name || 'Builder';
                const isSelected = activeConv?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-l-brand-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                      {partner?.profilePhoto || partner?.avatarUrl ? (
                        <Image
                          src={partner.profilePhoto || partner.avatarUrl || ''}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-slate-700 text-sm">
                          {displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {displayName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || 'Click to view messages'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Chat Area */}
        <main className={`flex-1 flex flex-col bg-white ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv && activePartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                    {activePartner.profilePhoto || activePartner.avatarUrl ? (
                      <Image
                        src={activePartner.profilePhoto || activePartner.avatarUrl || ''}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-slate-700 text-sm">
                        {activePartner.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {activePartner.fullName || activePartner.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activePartner.university || activePartner.organization || activePartner.jobTitle || 'Aptivo Builder'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/profile?email=${activePartner.email}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                {messages.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-brand-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">
                      Conversation with {activePartner.fullName || activePartner.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Say hello, propose a BUILD project collaboration, or share knowledge.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.senderId === currentUserId ||
                      (msg.senderId as any)?._id?.toString() === currentUserId;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-slate-200/80 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message... (Press Enter to send)"
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50/60"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="font-extrabold text-slate-700 text-base">No conversation selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a conversation from the sidebar or find a builder to message directly.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
