'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { rememberInternalNavigation, useHistoryBack } from '@/components/BackButton';
import Avatar from '@/components/Avatar';
import Ably from 'ably';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const backToChats = useHistoryBack('/dashboard/messages');
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

        const recipientParam = searchParams.get('recipient');
        const convParam = searchParams.get('conv');

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
          selectConversation(target, email, false);
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
          const conversationUrl = `/dashboard/messages?conv=${encodeURIComponent(startData.conversation._id)}`;
          rememberInternalNavigation(conversationUrl);
          router.replace(conversationUrl);
          selectConversation(startData.conversation, email, false);
          return;
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: IConversation, email = currentUserEmail, updateHistory = true) => {
    if (updateHistory && searchParams.get('conv') !== conv._id) {
      const conversationUrl = `/dashboard/messages?conv=${encodeURIComponent(conv._id)}`;
      rememberInternalNavigation(conversationUrl);
      router.push(conversationUrl);
    }
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

  useEffect(() => {
    const conversationId = searchParams.get('conv');
    if (!conversationId) {
      setActiveConv(null);
      setMessages([]);
      return;
    }
    const conversation = conversations.find((item) => item._id === conversationId);
    if (conversation && conversation._id !== activeConv?._id) {
      selectConversation(conversation, currentUserEmail, false);
    }
  }, [searchParams, conversations, currentUserEmail, activeConv?._id]);

  // Ably delivers persisted messages live. Initial/fallback fetches remain the source-of-truth recovery path.
  useEffect(() => {
    if (!activeConv) return;
    const realtime = new Ably.Realtime({ authUrl: '/api/realtime/token', authMethod: 'GET' });
    const channel = realtime.channels.get(`conversation:${activeConv._id}`);
    const onMessage = (event: { data?: unknown }) => {
      const incoming = event.data as IMessage | undefined;
      if (!incoming?._id || !incoming.content) return;
      setMessages((previous) => previous.some((message) => message._id === incoming._id) ? previous : [...previous, incoming]);
      setConversations((previous) => previous.map((conversation) => conversation._id === activeConv._id ? { ...conversation, lastMessage: incoming.content, lastMessageAt: incoming.createdAt } : conversation).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()));
    };
    channel.subscribe('message.created', onMessage);
    return () => { channel.unsubscribe('message.created', onMessage); realtime.close(); };
  }, [activeConv]);

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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[calc(100dvh-150px)] min-h-[540px] flex flex-col">
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
              <h2 className="font-serif font-normal text-[30px] sm:text-[34px] leading-tight text-[#18201C] flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-600" />
                <span>Chats</span>
              </h2>
              <Link
                href="/dashboard/people"
                className="text-xs font-semibold text-brand-600 hover:underline font-sans"
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
                placeholder="Search chats"
                className="aptivo-input w-full min-h-11 rounded-xl pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 divide-y divide-[#E4E7E2] overflow-y-auto">
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
                    className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
                      isSelected ? 'border-l-4 border-l-[#287A5B] bg-[#E4EEE8]/70' : 'hover:bg-[#F7F6F1]'
                    }`}
                  >
                    <Avatar src={partner?.profilePhoto || partner?.avatarUrl} name={displayName} size={44}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-extrabold text-[#18201C]">
                          {displayName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="shrink-0 text-[10px] text-[#69736D]">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[#69736D]">
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
              <div className="flex items-center justify-between gap-3 border-b border-[#E4E7E2] bg-white p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      if (searchParams.get('conv')) backToChats();
                      else setActiveConv(null);
                    }}
                    className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar src={activePartner.profilePhoto || activePartner.avatarUrl} name={activePartner.fullName || activePartner.name} size={40}/>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-[#18201C]">
                      {activePartner.fullName || activePartner.name}
                    </h3>
                    <p className="truncate text-[11px] text-[#69736D]">
                      {activePartner.university || activePartner.organization || activePartner.jobTitle || 'Aptivo Builder'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${activePartner._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F6F1] p-4 sm:p-6">
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
                              ? 'bg-[#174D3A] text-white rounded-br-xs'
                              : 'border border-[#E4E7E2] bg-white text-[#18201C] rounded-bl-xs'
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
                className="flex items-center gap-2 border-t border-[#E4E7E2] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message…"
                  className="aptivo-input min-h-11 flex-1 rounded-2xl px-4 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-[#174D3A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#287A5B] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#E4EEE8] text-[#174D3A]"><MessageSquare className="h-7 w-7" /></div>
              <h3 className="aptivo-display text-2xl font-semibold text-[#18201C]">Start a conversation</h3>
              <p className="max-w-sm text-sm text-[#69736D]">
                Find someone through Campus, Connections or Build.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
