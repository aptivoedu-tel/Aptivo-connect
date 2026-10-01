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

  const activeConvRef = useRef<IConversation | null>(null);
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const parseId = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val._id) return parseId(val._id);
      if (val.$oid) return parseId(val.$oid);
      if (val.toString) return val.toString();
    }
    return String(val);
  };

  const handleIncomingMessage = (incoming: IMessage) => {
    if (!incoming || !incoming.content) return;
    const incId = parseId(incoming._id);
    const incConvId = parseId(incoming.conversationId);
    const activeId = parseId(activeConvRef.current?._id);

    // 1. If currently open conversation matches incoming message, append immediately
    if (activeId && activeId === incConvId) {
      setMessages((previous) => {
        const exists = previous.some((m) => parseId(m._id) === incId);
        if (exists) return previous;
        return [...previous, incoming];
      });
    }

    // 2. Always update the conversations list (latest message preview + timestamp) and re-sort
    setConversations((previous) => {
      const exists = previous.some((c) => parseId(c._id) === incConvId);
      if (!exists) {
        if (currentUserEmail) loadConversations(currentUserEmail, currentUserId);
        return previous;
      }
      return previous
        .map((c) =>
          parseId(c._id) === incConvId
            ? { ...c, lastMessage: incoming.content, lastMessageAt: incoming.createdAt || new Date().toISOString() }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
    });
  };

  // 1. Ably channel subscription for the active open conversation
  useEffect(() => {
    if (!activeConv?._id) return;
    const convId = parseId(activeConv._id);
    let realtime: Ably.Realtime | null = null;
    try {
      realtime = new Ably.Realtime({ authUrl: '/api/realtime/token', authMethod: 'GET' });
      const channel = realtime.channels.get(`conversation:${convId}`);
      const onMessage = (event: { data?: unknown }) => {
        if (event.data) {
          handleIncomingMessage(event.data as IMessage);
        }
      };
      channel.subscribe('message.created', onMessage);
      return () => {
        channel.unsubscribe('message.created', onMessage);
        realtime?.close();
      };
    } catch (e) {
      console.error('Ably conversation subscription error:', e);
    }
  }, [activeConv?._id]);

  // 2. Global realtime event listener (for user channel messages)
  useEffect(() => {
    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name === 'message.created' && detail?.data) {
        handleIncomingMessage(detail.data as IMessage);
      }
    };
    window.addEventListener('aptivo:realtime-event', handleRealtime);
    return () => window.removeEventListener('aptivo:realtime-event', handleRealtime);
  }, []);

  // 3. Focus/reconnect reconciliation from MongoDB source-of-truth
  useEffect(() => {
    const handleFocus = () => {
      if (activeConvRef.current?._id && currentUserEmail) {
        fetch(`/api/messages?conversationId=${activeConvRef.current._id}&email=${encodeURIComponent(currentUserEmail)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.messages) {
              setMessages(data.messages);
            }
          })
          .catch(() => {});
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUserEmail]);

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

  /* Format time for conversation list */
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#E4E7E2] bg-white h-[calc(100dvh-140px)] min-h-[500px] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* ── CONVERSATION LIST (Screen 5 left) ── */}
        <aside className={`w-full md:w-80 lg:w-[22rem] border-r border-[#E4E7E2] flex flex-col shrink-0 bg-white ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-serif font-normal text-[28px] leading-tight text-[#18201C]">Chats</h1>
              <div className="flex items-center gap-1">
                <button onClick={() => setSearchQuery(searchQuery ? '' : ' ')} className="grid h-9 w-9 place-items-center rounded-full text-[#18201C] hover:bg-[#F7F6F1] transition-colors" aria-label="Search chats">
                  <Search className="h-[18px] w-[18px]" />
                </button>
                <Link href="/dashboard/people" className="grid h-9 w-9 place-items-center rounded-full text-[#18201C] hover:bg-[#F7F6F1] transition-colors" aria-label="New chat">
                  <ExternalLink className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </div>
            {searchQuery !== '' && (
              <div className="relative">
                <Search className="w-4 h-4 text-[#69736D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={searchQuery.trim()} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chats..." autoFocus className="aptivo-input w-full min-h-10 rounded-xl pl-9 pr-3 text-[13px]" />
              </div>
            )}
          </div>

          {/* Conversation rows */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-[13px] text-[#69736D]">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-5 py-10 text-center space-y-2">
                <p className="text-[13px] font-semibold text-[#18201C]">No conversations yet</p>
                <p className="text-[12px] text-[#69736D] font-sans">Find people through Campus or Build to start chatting.</p>
                <Link href="/dashboard/people" className="inline-block mt-2 px-4 py-2 rounded-full bg-[#174D3A] text-white text-[12px] font-semibold font-sans">Discover People</Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = getOtherParticipant(conv);
                const displayName = partner?.fullName || partner?.name || 'Builder';
                const isSelected = activeConv?._id === conv._id;
                return (
                  <button key={conv._id} onClick={() => selectConversation(conv)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors border-b border-[#E4E7E2]/60 ${isSelected ? 'bg-[#E4EEE8]/50' : 'hover:bg-[#F7F6F1]'}`}
                  >
                    <Avatar src={partner?.profilePhoto || partner?.avatarUrl} name={displayName} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold text-[#18201C] font-sans">{displayName}</span>
                        <span className="shrink-0 text-[11px] text-[#69736D] font-sans">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-[#69736D] font-sans">{conv.lastMessage || 'Start a conversation'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── ACTIVE CHAT AREA ── */}
        <main className={`flex-1 flex flex-col bg-white ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv && activePartner ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between gap-3 border-b border-[#E4E7E2] bg-white px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => { if (searchParams.get('conv')) backToChats(); else setActiveConv(null); }} className="md:hidden p-1.5 rounded-full text-[#69736D] hover:bg-[#F7F6F1]">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar src={activePartner.profilePhoto || activePartner.avatarUrl} name={activePartner.fullName || activePartner.name} size={38} />
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold text-[#18201C] font-sans">{activePartner.fullName || activePartner.name}</h3>
                    <p className="truncate text-[11px] text-[#69736D] font-sans">{activePartner.university || activePartner.organization || activePartner.jobTitle || 'Aptivo Connect'}</p>
                  </div>
                </div>
                <Link href={`/profile/${activePartner._id}`} className="grid h-9 w-9 place-items-center rounded-full text-[#69736D] hover:bg-[#F7F6F1] transition-colors" aria-label="View profile">
                  <User className="h-[18px] w-[18px]" />
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#F7F6F1] p-4 sm:p-5">
                {messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <Sparkles className="w-7 h-7 text-[#287A5B] mx-auto" />
                    <p className="text-[13px] font-semibold text-[#18201C] font-sans">Start your conversation</p>
                    <p className="text-[12px] text-[#69736D] font-sans">Say hello or propose a collaboration.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId || (msg.senderId as any)?._id?.toString() === currentUserId;
                    return (
                      <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed font-sans ${
                          isMine ? 'bg-[#E4EEE8] text-[#18201C] rounded-br-md' : 'bg-white border border-[#E4E7E2] text-[#18201C] rounded-bl-md'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-[#69736D] mt-1 px-1 font-sans">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-[#E4E7E2] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Message…" className="aptivo-input min-h-11 flex-1 rounded-full px-5 text-[14px] font-sans" />
                <button type="submit" disabled={!inputText.trim() || sending} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#174D3A] text-white transition hover:bg-[#287A5B] disabled:opacity-40">
                  <Send className="w-[18px] h-[18px]" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E4EEE8] text-[#174D3A]"><MessageSquare className="h-6 w-6" /></div>
              <h3 className="font-serif font-normal text-[22px] text-[#18201C]">Start a conversation</h3>
              <p className="max-w-sm text-[13px] text-[#69736D] font-sans">Find someone through Campus, Connections or Build.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
