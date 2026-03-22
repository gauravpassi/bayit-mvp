'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, RotateCcw, MapPin, Bed, Bath, Maximize2, Tag, TrendingUp, Home } from 'lucide-react';
import Image from 'next/image';
import { useChatContext } from '@/contexts/ChatContext';
import type { ChatMessage, Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import clsx from 'clsx';

// ── Welcome message ────────────────────────────────────────────────────────────
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `مرحباً! I'm **Karim**, your Bayit real estate advisor for Morocco. 🏡\n\nI'm not a search tool — I'm here to have a real conversation and help you find the right property for your situation.\n\nAre you looking to **buy a home to live in**, or more interested in **investment and rental income**?`,
  timestamp: new Date(),
};

// ── Type badge colour map ──────────────────────────────────────────────────────
const TYPE_COLOURS: Record<string, { bg: string; text: string }> = {
  Riad:       { bg: 'bg-amber-100',   text: 'text-amber-800'  },
  Villa:      { bg: 'bg-emerald-100', text: 'text-emerald-800'},
  Apartment:  { bg: 'bg-blue-100',    text: 'text-blue-800'   },
  Studio:     { bg: 'bg-purple-100',  text: 'text-purple-800' },
  Penthouse:  { bg: 'bg-rose-100',    text: 'text-rose-800'   },
  House:      { bg: 'bg-orange-100',  text: 'text-orange-800' },
};

// ── Single property card ───────────────────────────────────────────────────────
function PropertyCard({ property: p, note, isTop }: { property: Property; note?: string; isTop?: boolean }) {
  const typeColor = TYPE_COLOURS[p.type] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div
      className={clsx(
        'shrink-0 w-72 rounded-2xl overflow-hidden bg-white flex flex-col',
        'border transition-shadow hover:shadow-lg',
        isTop ? 'border-bayit-gold shadow-md' : 'border-bayit-border shadow-sm'
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* ── Image ── */}
      <div className="relative h-40 w-full">
        <Image
          src={p.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
          alt={p.title}
          fill
          sizes="288px"
          className="object-cover"
        />
        {/* Top pick ribbon */}
        {isTop && (
          <div className="absolute top-0 left-0 right-0 flex justify-end p-2">
            <span className="flex items-center gap-1 bg-bayit-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
              <TrendingUp size={9} /> Top Pick
            </span>
          </div>
        )}
        {/* Type badge */}
        <span className={clsx('absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full', typeColor.bg, typeColor.text)}>
          {p.type}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">

        {/* Title + location */}
        <div>
          <p className="font-bold text-bayit-dark text-[13px] leading-snug line-clamp-2">{p.title}</p>
          <p className="flex items-center gap-1 text-bayit-gray text-[11px] mt-0.5">
            <MapPin size={10} className="shrink-0" />
            {p.neighborhood}, {p.city}
          </p>
        </div>

        {/* Price */}
        <p className="text-bayit-gold font-extrabold text-base leading-none">{formatPrice(p.price)}</p>

        {/* Description */}
        <p className="text-bayit-gray text-[11px] leading-relaxed line-clamp-2">{p.description}</p>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-[11px] text-bayit-dark font-medium pt-1 border-t border-bayit-border">
          {p.bedrooms > 0 && (
            <span className="flex items-center gap-1"><Bed size={11} className="text-bayit-blue" />{p.bedrooms} bed</span>
          )}
          <span className="flex items-center gap-1"><Bath size={11} className="text-bayit-blue" />{p.bathrooms} bath</span>
          <span className="flex items-center gap-1"><Maximize2 size={11} className="text-bayit-blue" />{p.areaSqm} m²</span>
        </div>

        {/* Feature tags */}
        {p.features && p.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.features.slice(0, 4).map((f) => (
              <span key={f} className="flex items-center gap-0.5 bg-bayit-cream text-bayit-blue text-[10px] px-2 py-0.5 rounded-full border border-bayit-border">
                <Tag size={8} />{f}
              </span>
            ))}
            {p.features.length > 4 && (
              <span className="text-[10px] text-bayit-gray px-1">+{p.features.length - 4} more</span>
            )}
          </div>
        )}

        {/* Advisor note */}
        {note && (
          <div className="mt-1 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
            <Sparkles size={10} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed italic">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Property card carousel ─────────────────────────────────────────────────────
function ChatPropertyCards({
  properties,
  propertyNotes,
}: {
  properties: Property[];
  propertyNotes?: Record<string, string>;
}) {
  return (
    <div className="mt-3 -mx-4 px-4">
      <p className="text-[11px] text-bayit-gray mb-2.5 font-medium flex items-center gap-1.5">
        <Home size={11} />
        {properties.length} {properties.length === 1 ? 'property' : 'properties'} matched for you
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-3"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {properties.map((p, idx) => (
          <PropertyCard
            key={p.id}
            property={p}
            note={propertyNotes?.[p.id]}
            isTop={idx === 0 && properties.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-bayit-gold flex items-center justify-center shrink-0">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="bubble-assistant px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

// ── Markdown-lite renderer ─────────────────────────────────────────────────────
function RenderContent({ content }: { content: string }) {
  return (
    <div className="space-y-1.5">
      {content.split('\n').map((line, i) => {
        if (line === '') return <div key={i} className="h-1" />;
        const segments = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed">
            {segments.map((seg, j) =>
              j % 2 === 1 ? <strong key={j} className="font-semibold text-bayit-dark">{seg}</strong> : seg
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Quick action chips ─────────────────────────────────────────────────────────
function QuickActions({ onNewSearch, onSendMessage }: {
  onNewSearch: () => void;
  onSendMessage: (t: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => onSendMessage('What other options do you have?')}
        className="text-xs text-bayit-blue border border-bayit-blue/30 bg-bayit-blue/5 hover:bg-bayit-blue hover:text-white px-3 py-1.5 rounded-full transition-colors"
      >
        🔍 More options
      </button>
      <button
        onClick={() => onSendMessage('Can you suggest something with better investment potential?')}
        className="text-xs text-bayit-gold border border-bayit-gold/30 bg-bayit-gold/5 hover:bg-bayit-gold hover:text-white px-3 py-1.5 rounded-full transition-colors"
      >
        📈 Investment picks
      </button>
      <button
        onClick={() => onSendMessage('What if I increase my budget slightly?')}
        className="text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-full transition-colors"
      >
        💰 Higher budget
      </button>
      <button
        onClick={onNewSearch}
        className="text-xs text-bayit-gray border border-bayit-border bg-white hover:bg-bayit-cream px-3 py-1.5 rounded-full transition-colors"
      >
        🔄 Start over
      </button>
    </div>
  );
}

// ── Extended ChatMessage type (with propertyNotes) ─────────────────────────────
type ChatMessageExt = ChatMessage & { propertyNotes?: Record<string, string> };

// ── Main ChatWidget ────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const { isOpen, openChat, closeChat } = useChatContext();
  const [messages,   setMessages]   = useState<ChatMessageExt[]>([WELCOME_MESSAGE]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  const resetChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setSearchDone(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessageExt = {
      id: Date.now().toString(), role: 'user',
      content: trimmed, timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-20)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: trimmed }] }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const aiMsg: ChatMessageExt = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.message ?? 'Let me help you find the right property.',
        properties: data.properties,
        propertyNotes: data.propertyNotes,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (data.readyToSearch) setSearchDone(true);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'Something went wrong. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="chat-fab fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-bayit-gold hover:bg-bayit-gold-light text-white flex items-center justify-center shadow-2xl transition-colors"
          aria-label="Chat with Karim, your Morocco property advisor"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:bg-transparent" onClick={closeChat} />

          <div
            className={clsx(
              'fixed z-50 flex flex-col',
              'inset-x-0 bottom-0 rounded-t-3xl',
              'md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[440px] md:rounded-none md:rounded-l-2xl',
              'bg-white animate-slide-right shadow-2xl'
            )}
            style={{ maxHeight: '100dvh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-bayit rounded-t-3xl md:rounded-t-none md:rounded-tl-2xl shrink-0">
              <div className="flex items-center gap-3">
                {/* Karim avatar */}
                <div className="w-10 h-10 rounded-full bg-bayit-gold flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  K
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Karim</p>
                  <p className="text-white/60 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Morocco Real Estate Advisor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="text-white/55 hover:text-white p-1.5 transition-colors"
                  title="Start new conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <button onClick={closeChat} className="text-white/55 hover:text-white p-1.5 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Thin gold accent bar */}
            <div className="h-0.5 bg-bayit-gold/30 shrink-0" />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F5F7FA] flex flex-col gap-1">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={clsx(
                    'flex items-end gap-2 mb-2',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Karim avatar on assistant messages */}
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-bayit-gold flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
                      K
                    </div>
                  )}

                  <div className={clsx(
                    'text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bubble-user max-w-[80%] px-4 py-2.5'
                      : 'bubble-assistant px-4 py-3',
                    msg.properties && msg.properties.length > 0 && msg.role === 'assistant'
                      ? 'w-full max-w-full'
                      : msg.role === 'assistant' ? 'max-w-[88%]' : ''
                  )}>
                    <RenderContent content={msg.content} />

                    {/* Property cards */}
                    {msg.properties && msg.properties.length > 0 && (
                      <ChatPropertyCards
                        properties={msg.properties}
                        propertyNotes={msg.propertyNotes}
                      />
                    )}

                    {/* Quick actions on last message with results */}
                    {msg.properties && msg.properties.length > 0 && msg.role === 'assistant' && idx === messages.length - 1 && (
                      <QuickActions onNewSearch={resetChat} onSendMessage={(t) => sendMessage(t)} />
                    )}
                  </div>
                </div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 bg-white border-t border-bayit-border flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tell Karim what you're looking for…"
                disabled={loading}
                className="flex-1 bg-bayit-cream border border-bayit-border rounded-xl px-4 py-2.5 text-sm text-bayit-dark placeholder-bayit-gray/60 focus:outline-none focus:border-bayit-blue focus:ring-1 focus:ring-bayit-blue/20 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-bayit-gold hover:bg-bayit-gold-light disabled:bg-bayit-gold/40 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
