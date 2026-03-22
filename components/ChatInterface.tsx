'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, RotateCcw, MapPin, Bed, Bath, Maximize2, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import type { ChatMessage, Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import clsx from 'clsx';

// ── bAytI brand mark ──────────────────────────────────────────────────────────
function BaytiMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-base' : 'text-2xl';
  return (
    <span className={`font-bold tracking-tight ${cls}`}>
      <span className="text-bayit-dark">b</span>
      <span className="text-bayit-blue">A</span>
      <span className="text-bayit-dark">yt</span>
      <span className="text-bayit-blue">I</span>
    </span>
  );
}

// ── Example prompts (empty state) ─────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  "I'm looking for something modern and calm in Casablanca",
  "What's the best area in Marrakech for investment?",
  "Something cozy under 1.5M MAD, open to different cities",
  "I want a traditional riad but with modern comforts",
];

// ── Type badge colours ────────────────────────────────────────────────────────
const TYPE_COLOURS: Record<string, { bg: string; text: string }> = {
  Riad:      { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  Villa:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Apartment: { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Studio:    { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  Penthouse: { bg: 'bg-rose-100',    text: 'text-rose-700'    },
  House:     { bg: 'bg-teal-100',    text: 'text-teal-700'    },
};

// ── Inline property card (full-page version — slightly larger) ────────────────
function PropertyCard({ property: p }: { property: Property }) {
  const { openModal } = usePropertyModal();
  const tc = TYPE_COLOURS[p.type] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <div
      onClick={() => openModal(p)}
      className="shrink-0 w-72 rounded-2xl overflow-hidden bg-white border border-bayit-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative h-44 w-full">
        <Image
          src={p.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
          alt={p.title} fill sizes="288px" className="object-cover"
        />
        <span className={clsx('absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full', tc.bg, tc.text)}>
          {p.type}
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        <p className="font-semibold text-bayit-dark text-sm leading-snug line-clamp-2">{p.title}</p>
        <p className="flex items-center gap-1 text-bayit-gray text-xs">
          <MapPin size={10} className="shrink-0" /> {p.neighborhood}, {p.city}
        </p>
        <p className="text-bayit-blue font-bold text-base">{formatPrice(p.price)}</p>
        <div className="flex items-center gap-3 text-xs text-bayit-gray pt-1.5 border-t border-bayit-border">
          {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms} bed</span>}
          <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms} bath</span>
          <span className="flex items-center gap-1"><Maximize2 size={11} />{p.areaSqm} m²</span>
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center h-5 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-bayit-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function RenderContent({ content }: { content: string }) {
  if (!content?.trim()) return null;
  return (
    <div className="space-y-1.5 text-[15px] leading-relaxed text-bayit-dark">
      {content.split('\n').map((line, i) => {
        if (line === '') return <div key={i} className="h-1" />;
        const segs = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i}>
            {segs.map((s, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold">{s}</strong>
                : s
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Context-aware quick replies ───────────────────────────────────────────────
function getQuickReplies(content: string): string[] {
  const lower = content.toLowerCase();
  if (lower.includes('live in') || (lower.includes('invest') && lower.includes('live')))
    return ['To live in 🏠', 'As an investment 📈', "I'm not sure yet"];
  if (lower.includes('which city') || lower.includes('what city') || lower.includes('what region'))
    return ['Marrakech', 'Casablanca', 'Rabat', 'Agadir'];
  if (lower.includes('budget') || lower.includes('range') || lower.includes('price point'))
    return ['Under 1M MAD', '1–2M MAD', '2–4M MAD', '4M+ MAD'];
  if ((lower.includes('riad') || lower.includes('apartment')) && lower.includes('villa'))
    return ['Riad', 'Villa', 'Apartment', 'Studio'];
  if (lower.includes('shall i show') || lower.includes('ready to see') || lower.includes('show you'))
    return ['Yes, show me ✨', 'Not yet'];
  return [];
}

type ChatMessageExt = ChatMessage & { propertyNotes?: Record<string, string> };

// ── Inner chat (needs useSearchParams — wrapped in Suspense by parent) ────────
function ChatInterfaceInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [messages, setMessages] = useState<ChatMessageExt[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [autoSent, setAutoSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    // Auto-send the query from URL on first mount
    if (initialQuery && !autoSent) {
      setAutoSent(true);
      sendMessage(initialQuery);
    } else if (!initialQuery) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Include property data in history so AI can answer follow-up questions
      // about specific listings ("tell me more about this neighbourhood", etc.)
      const history = messages
        .slice(-20)
        .map(({ role, content, properties }) => {
          if (role === 'assistant' && properties && properties.length > 0) {
            const propSummary = properties
              .map(p =>
                `• ${p.title} — ${p.type} in ${p.neighborhood}, ${p.city} | ${formatPrice(p.price)} | ${p.bedrooms > 0 ? `${p.bedrooms}bed/` : ''}${p.bathrooms}bath | ${p.areaSqm}m²${p.description ? ` | "${p.description.slice(0, 80)}..."` : ''}`
              )
              .join('\n');
            return {
              role,
              content: `${content}\n\n[Properties shown to user:\n${propSummary}]`,
            };
          }
          return { role, content };
        });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: trimmed }] }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.message?.trim() || "Let me find the right options for you.",
        properties: data.properties,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'Something went wrong. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setAutoSent(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Navigate to /properties page, highlighting the last shown properties on the map
  const handleViewOnMap = () => {
    const lastWithProps = [...messages].reverse().find(
      m => m.properties && m.properties.length > 0
    );
    if (lastWithProps?.properties?.length) {
      const ids = lastWithProps.properties.map(p => p.id).join(',');
      window.location.href = `/properties?highlight=${encodeURIComponent(ids)}`;
    } else {
      window.location.href = '/properties';
    }
  };

  const lastAssistant = messages.filter(m => m.role === 'assistant').slice(-1)[0];
  const quickReplies  = (!loading && lastAssistant) ? getQuickReplies(lastAssistant.content) : [];
  const showEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* ── Minimal header ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-bayit-border shrink-0 bg-white">
        <Link href="/" className="flex items-center gap-2 text-bayit-gray hover:text-bayit-dark transition-colors text-sm">
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <Link href="/" aria-label="Go to homepage">
          <BaytiMark size="md" />
        </Link>

        <button
          onClick={resetChat}
          title="Start new conversation"
          className="flex items-center gap-1.5 text-bayit-muted hover:text-bayit-gray text-xs transition-colors py-1.5 px-3 rounded-full hover:bg-bayit-bg"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </header>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 min-h-full flex flex-col">

          {/* Empty state */}
          {showEmpty && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="mb-4 opacity-90">
                <BaytiMark size="lg" />
              </div>
              <p className="text-bayit-gray text-base mb-12 max-w-xs leading-relaxed">
                Real estate advisor for Morocco. Tell me what you&apos;re looking for.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {EXAMPLE_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-sm text-bayit-gray border border-bayit-border rounded-2xl px-4 py-3.5 hover:border-bayit-blue/40 hover:text-bayit-dark hover:bg-bayit-blue-50/40 transition-all duration-200 leading-snug"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {!showEmpty && (
            <div className="space-y-6 flex-1">
              {messages.map(msg => (
                <div key={msg.id} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={clsx(
                    'max-w-[85%] rounded-2xl px-5 py-3.5',
                    msg.role === 'user'
                      ? 'bg-bayit-blue text-white rounded-br-sm'
                      : 'bg-bayit-bg text-bayit-dark rounded-bl-sm',
                    msg.properties && msg.properties.length > 0 ? 'w-full max-w-full' : ''
                  )}>
                    {msg.role === 'user'
                      ? <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      : <RenderContent content={msg.content} />
                    }

                    {/* Property cards carousel */}
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-bayit-gray mb-3 font-medium">
                          {msg.properties.length} {msg.properties.length === 1 ? 'property' : 'properties'} matched
                        </p>
                        <div
                          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
                          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
                        >
                          {msg.properties.map(p => <PropertyCard key={p.id} property={p} />)}
                        </div>

                        {/* Post-results actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {[
                            { label: 'More options',    msg: 'Can you show me more options?' },
                            { label: 'Adjust budget',   msg: 'What if I adjust my budget?' },
                            { label: 'Different city',  msg: 'What about a different city?' },
                            { label: 'Start over',      msg: '__reset__' },
                          ].map(({ label, msg: actionMsg }) => (
                            <button
                              key={label}
                              onClick={() => {
                                if (actionMsg === '__reset__') { resetChat(); return; }
                                sendMessage(actionMsg);
                              }}
                              className="quick-reply-chip flex items-center gap-1 text-xs"
                            >
                              {label} <ChevronRight size={10} />
                            </button>
                          ))}
                          <button
                            onClick={handleViewOnMap}
                            className="quick-reply-chip flex items-center gap-1 text-xs !border-bayit-blue/30 !text-bayit-blue"
                          >
                            <MapPin size={10} /> View on Map
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-bayit-bg rounded-2xl rounded-bl-sm px-5 py-3.5">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Quick reply chips ── */}
      {quickReplies.length > 0 && !loading && (
        <div className="border-t border-bayit-border bg-white px-4 py-3">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="quick-reply-chip text-sm"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="border-t border-bayit-border bg-white px-4 py-4 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask bAytI anything about property in Morocco…"
            disabled={loading}
            className="flex-1 bg-bayit-bg border border-bayit-border rounded-2xl px-5 py-3 text-[15px] text-bayit-dark placeholder-bayit-muted focus:outline-none focus:border-bayit-blue focus:ring-1 focus:ring-bayit-blue/15 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-2xl bg-bayit-blue hover:bg-bayit-blue-dark disabled:bg-bayit-muted text-white flex items-center justify-center transition-colors shrink-0 shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="max-w-2xl mx-auto text-center text-[11px] text-bayit-muted mt-2.5">
          bAytI may occasionally make mistakes. Always verify details before making decisions.
        </p>
      </div>
    </div>
  );
}

// ── Export: wrap in Suspense for useSearchParams ──────────────────────────────
export default function ChatInterface() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="text-bayit-muted text-sm animate-pulse">Loading…</div>
      </div>
    }>
      <ChatInterfaceInner />
    </Suspense>
  );
}
