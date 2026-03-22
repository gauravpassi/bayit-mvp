'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, MapPin, Bed, Bath, Maximize2, TrendingUp, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useChatContext } from '@/contexts/ChatContext';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import type { ChatMessage, Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import clsx from 'clsx';

// ── Welcome message factory (avoids SSR hydration mismatch) ───────────────────
const WELCOME_CONTENT = `**Welcome to Bayit!** 👋\n\nHere to help you find your ideal home in Morocco. What are you looking for today?`;

function makeWelcomeMessage(): ChatMessageExt {
  return { id: 'welcome', role: 'assistant', content: WELCOME_CONTENT, timestamp: new Date() };
}

// ── Detect quick-reply context from the last assistant message ────────────────
function getQuickReplies(content: string): string[] {
  const lower = content.toLowerCase();
  if (lower.includes('live in') || lower.includes('investment') || (lower.includes('invest') && lower.includes('live'))) {
    return ['Live in 🏠', 'Investment 📈', 'Not sure'];
  }
  if (lower.includes('which city') || lower.includes('what city') || lower.includes('which moroccan city')) {
    return ['Marrakech', 'Casablanca', 'Rabat', 'Agadir'];
  }
  if (lower.includes('budget') && (lower.includes('mad') || lower.includes('number') || lower.includes('range'))) {
    return ['Under 1M MAD', '1–2M MAD', '2–4M MAD', '4M+ MAD'];
  }
  if (lower.includes('riad') && (lower.includes('villa') || lower.includes('apartment'))) {
    return ['Riad', 'Villa', 'Apartment', 'Studio'];
  }
  if (lower.includes('shall i show') || lower.includes('want to see') || lower.includes('show you my recommendation')) {
    return ['Yes, show me! ✨', 'Not yet'];
  }
  return [];
}

// ── Type badge colour map ──────────────────────────────────────────────────────
const TYPE_COLOURS: Record<string, { bg: string; text: string }> = {
  Riad:      { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  Villa:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Apartment: { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Studio:    { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  Penthouse: { bg: 'bg-rose-100',    text: 'text-rose-700'    },
  House:     { bg: 'bg-orange-100',  text: 'text-orange-700'  },
};

// ── Single compact property card (chat embed) ─────────────────────────────────
function ChatPropertyCard({ property: p, isTop }: { property: Property; isTop?: boolean }) {
  const { openModal } = usePropertyModal();
  const typeColor = TYPE_COLOURS[p.type] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div
      onClick={() => openModal(p)}
      className={clsx(
        'shrink-0 w-64 rounded-xl overflow-hidden bg-white flex flex-col border shadow-sm',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        isTop ? 'border-bayit-blue/40' : 'border-bayit-border'
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative h-36 w-full">
        <Image
          src={p.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'}
          alt={p.title} fill sizes="256px" className="object-cover"
        />
        {isTop && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-bayit-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <TrendingUp size={8} /> Top Pick
          </span>
        )}
        <span className={clsx('absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full', typeColor.bg, typeColor.text)}>
          {p.type}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p className="font-semibold text-bayit-dark text-[12px] leading-snug line-clamp-2">{p.title}</p>
        <p className="flex items-center gap-1 text-bayit-gray text-[10px]">
          <MapPin size={9} className="shrink-0" />{p.neighborhood}, {p.city}
        </p>
        <p className="text-bayit-blue font-bold text-sm leading-none">{formatPrice(p.price)}</p>
        <div className="flex items-center gap-2.5 text-[10px] text-bayit-gray pt-1 border-t border-bayit-border">
          {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={10} />{p.bedrooms} bed</span>}
          <span className="flex items-center gap-0.5"><Bath size={10} />{p.bathrooms} bath</span>
          <span className="flex items-center gap-0.5"><Maximize2 size={10} />{p.areaSqm} m²</span>
        </div>
      </div>
    </div>
  );
}

// ── Property card carousel ─────────────────────────────────────────────────────
function ChatPropertyCards({ properties }: { properties: Property[] }) {
  return (
    <div className="mt-3 -mx-3 px-3">
      <p className="text-[11px] text-bayit-gray mb-2 font-medium">
        {properties.length} {properties.length === 1 ? 'property' : 'properties'} matched for you
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {properties.map((p, idx) => (
          <ChatPropertyCard key={p.id} property={p} isTop={idx === 0 && properties.length > 1} />
        ))}
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-bayit-blue-50 border border-bayit-border flex items-center justify-center shrink-0">
        <span className="text-bayit-blue font-bold text-xs">K</span>
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
  if (!content?.trim()) return null;
  return (
    <div className="space-y-1">
      {content.split('\n').map((line, i) => {
        if (line === '') return <div key={i} className="h-0.5" />;
        const segments = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed">
            {segments.map((seg, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold text-bayit-dark">{seg}</strong>
                : seg
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Extended ChatMessage type ──────────────────────────────────────────────────
type ChatMessageExt = ChatMessage & { propertyNotes?: Record<string, string> };

// ── Main ChatWidget ────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const { isOpen, openChat, closeChat } = useChatContext();
  const [messages,   setMessages]   = useState<ChatMessageExt[]>(() => [makeWelcomeMessage()]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  // Listen for bayit-prefill events (from Hero search bar or PropertyModal)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.text) {
        setInput(detail.text);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('bayit-prefill', handler);
    return () => window.removeEventListener('bayit-prefill', handler);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([makeWelcomeMessage()]);
    setInput('');
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Special reset action
    if (trimmed === '__reset__') { resetChat(); return; }

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
        content: data.message?.trim() || 'Let me help you find the right property.',
        properties: data.properties,
        propertyNotes: data.propertyNotes,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'Something went wrong. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, resetChat]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  // Scroll to the map section and close the chat panel
  const handleViewOnMap = () => {
    closeChat();
    setTimeout(() => {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Quick replies for the last assistant message
  const lastAssistant = messages.filter(m => m.role === 'assistant').slice(-1)[0];
  const quickReplies  = (!loading && lastAssistant) ? getQuickReplies(lastAssistant.content) : [];

  return (
    <>
      {/* ── FAB (floating chat bubble) ── */}
      {!isOpen && (
        <button
          onClick={openChat}
          aria-label="Chat with our AI property advisor"
          className="fixed bottom-6 right-6 z-50 flex items-end gap-2 group"
        >
          <div className="hidden sm:block bg-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-card border border-bayit-border text-sm text-bayit-dark max-w-[200px] text-right leading-snug group-hover:shadow-card-hover transition-shadow">
            Hi! I&apos;m here to help you find your ideal home. Feel free to ask me.
          </div>
          <div className="chat-fab w-14 h-14 rounded-full bg-bayit-blue flex items-center justify-center shadow-lg text-white font-bold text-lg shrink-0">
            K
          </div>
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 md:bg-transparent" onClick={closeChat} />

          <div
            className={clsx(
              'fixed z-50 flex flex-col',
              'inset-x-0 bottom-0 rounded-t-3xl',
              'md:inset-x-auto md:right-4 md:bottom-4 md:top-auto md:w-[380px] md:max-h-[85vh] md:rounded-2xl',
              'bg-white shadow-chat animate-slide-up'
            )}
            style={{ maxHeight: '92dvh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bayit-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-bayit-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  K
                </div>
                <div>
                  <p className="font-semibold text-bayit-dark text-sm">Karim</p>
                  <p className="text-bayit-gray text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Morocco Real Estate Advisor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetChat} title="Start new conversation"
                  className="text-bayit-muted hover:text-bayit-gray p-1.5 rounded-lg hover:bg-bayit-bg transition-colors">
                  <RotateCcw size={14} />
                </button>
                <button onClick={closeChat}
                  className="text-bayit-muted hover:text-bayit-gray p-1.5 rounded-lg hover:bg-bayit-bg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-bayit-bg flex flex-col gap-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    'flex items-end gap-2 mb-2',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-bayit-blue flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
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
                      <ChatPropertyCards properties={msg.properties} />
                    )}

                    {/* Post-results quick actions */}
                    {msg.properties && msg.properties.length > 0 && msg.role === 'assistant' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['More options', 'Adjust budget', 'Different city', 'Start over'].map((label) => (
                          <button
                            key={label}
                            onClick={() => sendMessage(
                              label === 'Start over' ? '__reset__' :
                              label === 'More options' ? 'Can you show me more options?' :
                              label === 'Adjust budget' ? 'What if I increase my budget slightly?' :
                              'Can you suggest properties in a different city?'
                            )}
                            className="quick-reply-chip flex items-center gap-1"
                          >
                            {label} <ChevronRight size={10} />
                          </button>
                        ))}
                        {/* View on Map chip */}
                        <button
                          onClick={handleViewOnMap}
                          className="quick-reply-chip flex items-center gap-1 !border-bayit-blue/30 !text-bayit-blue"
                        >
                          <MapPin size={10} /> View on Map
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply chips */}
            {quickReplies.length > 0 && !loading && (
              <div className="px-4 py-2.5 bg-bayit-bg border-t border-bayit-border flex flex-wrap gap-2 shrink-0">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="quick-reply-chip"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 bg-white border-t border-bayit-border flex items-center gap-2 shrink-0 rounded-b-2xl"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                className="flex-1 bg-bayit-bg border border-bayit-border rounded-xl px-4 py-2.5 text-sm text-bayit-dark placeholder-bayit-muted focus:outline-none focus:border-bayit-blue focus:ring-1 focus:ring-bayit-blue/20 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-bayit-blue hover:bg-bayit-blue-dark disabled:bg-bayit-muted text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
