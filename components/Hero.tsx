'use client';

import { MessageCircle, Search, ChevronDown } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

const STATS = [
  { value: '2,400+', label: 'Properties Listed' },
  { value: '12',     label: 'Cities Covered' },
  { value: '98%',    label: 'Client Satisfaction' },
];

export default function Hero() {
  const { openChat } = useChatContext();

  const scrollDown = () => {
    const el = document.querySelector('#how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1800&q=80&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-bayit opacity-90" />

      {/* Subtle geometric overlay */}
      <div className="absolute inset-0 moroccan-pattern opacity-40" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="max-w-3xl">

          {/* Badge */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <span className="section-badge mb-6 inline-block">
              AI-Powered Real Estate · Morocco
            </span>
          </div>

          {/* Heading */}
          <h1
            className="animate-slide-up text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            Find Your Perfect{' '}
            <span className="text-gradient-gold">Property</span>
            <br />
            with AI
          </h1>

          {/* Sub-heading */}
          <p
            className="animate-slide-up text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-xl"
            style={{ animationDelay: '0.35s', opacity: 0 }}
          >
            Just describe what you&apos;re looking for: budget, city, and style, and our intelligent
            assistant will match you with the perfect property across Morocco.
          </p>

          {/* CTA group */}
          <div
            className="animate-slide-up flex flex-col sm:flex-row gap-4"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            {/* Primary: Open chat */}
            <button
              onClick={openChat}
              className="group flex items-center justify-center gap-3 bg-bayit-gold hover:bg-bayit-gold-light text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-xl"
            >
              <MessageCircle size={20} className="group-hover:animate-bounce-subtle" />
              Start Your Search
            </button>

            {/* Secondary: Scroll to properties */}
            <button
              onClick={() => {
                const el = document.querySelector('#properties');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-3 border-2 border-white/40 hover:border-bayit-gold text-white hover:text-bayit-gold font-semibold text-lg px-8 py-4 rounded-2xl transition-all"
            >
              <Search size={18} />
              Browse Properties
            </button>
          </div>

          {/* Chat prompt hint */}
          <div
            className="animate-fade-in mt-8 flex items-center gap-3"
            style={{ animationDelay: '0.7s', opacity: 0 }}
          >
            <div className="flex -space-x-1">
              {['🏠', '🌇', '🏡'].map((e, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm">
              Try: <span className="text-white/85 italic">&quot;I need a 3-bedroom apartment in Casablanca under 2M MAD&quot;</span>
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="animate-slide-up mt-16 flex flex-wrap gap-8 sm:gap-16"
          style={{ animationDelay: '0.65s', opacity: 0 }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-bayit-gold">{value}</div>
              <div className="text-white/60 text-sm mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll down caret */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 hover:text-bayit-gold transition-colors animate-bounce-subtle"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
