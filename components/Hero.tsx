'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, ChevronDown, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useChatContext } from '@/contexts/ChatContext';

// Real Leaflet map rendered as background — loaded client-side only
const HeroMapBg = dynamic(() => import('./HeroMapBg'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-bayit-blue-soft" />,
});

const PROPERTY_TYPES = ['Any type', 'Apartment', 'Villa', 'Riad', 'Studio', 'Penthouse'];
const PRICE_RANGES   = ['Any price', 'Under 500K', '500K–1M', '1M–2M', '2M–5M', '5M+'];

export default function Hero() {
  const { openChat } = useChatContext();
  const [tab,          setTab]          = useState<'buy' | 'rent'>('buy');
  const [city,         setCity]         = useState('');
  const [propertyType, setPropertyType] = useState('Any type');
  const [priceRange,   setPriceRange]   = useState('Any price');

  const handleSearch = () => {
    const query = `I'm ${tab === 'rent' ? 'looking to rent' : 'looking to buy'} ${propertyType !== 'Any type' ? 'a ' + propertyType.toLowerCase() : 'a property'}${city.trim() ? ' in ' + city.trim() : ''}${priceRange !== 'Any price' ? ', budget ' + priceRange + ' MAD' : ''}`;
    openChat(query);
  };

  const scrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-20">

      {/* Real Leaflet map as background */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroMapBg />
      </div>
      {/* Gradient overlay — fades the map and keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/20 pointer-events-none" />

      {/* Decorative floating price chips */}
      <div className="absolute top-28 right-8 sm:right-16 lg:right-32 z-10 hidden sm:flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-card border border-bayit-border">
        <div className="w-2 h-2 rounded-full bg-bayit-blue" />
        <span className="text-bayit-blue font-bold text-sm">2,500,000</span>
        <span className="text-bayit-gray text-sm">MAD</span>
      </div>
      <div className="absolute bottom-40 right-12 sm:right-24 z-10 hidden lg:flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-card border border-bayit-border">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-bayit-dark font-bold text-sm">4,200,000</span>
        <span className="text-bayit-gray text-sm">MAD</span>
      </div>
      <div className="absolute top-1/2 right-4 sm:right-10 z-10 hidden lg:flex items-center gap-2 bg-bayit-blue rounded-xl px-4 py-2.5 shadow-card">
        <span className="text-white font-bold text-sm">1,850,000 MAD</span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-16 w-full">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-semibold text-bayit-dark leading-[1.15] mb-4">
            Discover your place
            <br />
            <span className="text-bayit-blue italic">in Morocco</span>
          </h1>
          <p className="text-lg text-bayit-gray max-w-md leading-relaxed">
            Tell bAytI what feels right — and let it guide you to a home that truly belongs to you.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-card border border-bayit-border overflow-hidden max-w-2xl">
          {/* Buy / Rent tabs */}
          <div className="flex border-b border-bayit-border px-1 pt-1">
            {(['buy', 'rent'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors capitalize ${
                  tab === t
                    ? 'bg-bayit-blue text-white'
                    : 'text-bayit-gray hover:text-bayit-dark'
                }`}
              >
                {t === 'buy' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-bayit-border">

            {/* City input */}
            <div className="flex items-center gap-2 px-4 py-3 flex-1 min-w-0">
              <MapPin size={16} className="text-bayit-muted shrink-0" />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="City or area…"
                className="flex-1 text-sm text-bayit-dark placeholder-bayit-muted bg-transparent outline-none min-w-0"
              />
            </div>

            {/* Property type */}
            <div className="relative flex items-center px-4 py-3 min-w-[150px]">
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full text-sm text-bayit-dark bg-transparent outline-none appearance-none cursor-pointer pr-5"
              >
                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 text-bayit-muted pointer-events-none" />
            </div>

            {/* Price range */}
            <div className="relative flex items-center px-4 py-3 min-w-[140px]">
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="w-full text-sm text-bayit-dark bg-transparent outline-none appearance-none cursor-pointer pr-5"
              >
                {PRICE_RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 text-bayit-muted pointer-events-none" />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-bayit-blue hover:bg-bayit-blue-dark text-white font-semibold text-sm px-7 py-3.5 transition-colors sm:rounded-none sm:rounded-br-2xl"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* CTA row — solid Chat button + ghost Browse link */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-bayit-blue hover:bg-bayit-blue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm transition-colors"
          >
            <MessageSquare size={15} />
            Chat with bAytI
          </Link>
          <button
            onClick={scrollToProperties}
            className="inline-flex items-center gap-1.5 text-bayit-gray hover:text-bayit-dark text-sm font-medium border border-bayit-border bg-white/80 hover:bg-white px-5 py-2.5 rounded-full transition-colors"
          >
            Browse all properties
            <span className="text-bayit-blue">→</span>
          </button>
        </div>

        {/* Feature bubbles — SVG icons, no emoji */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            {
              label: 'AI-matched results',
              svg: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5L12 5.5l-2.5 2.5.6 3.5L7 9.8 3.9 11.5l.6-3.5L2 5.5l3.5-1z" stroke="#C9A96E" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
            },
            {
              label: 'Understands your needs',
              svg: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C3.96 1.5 1.5 3.69 1.5 6.4c0 1.44.67 2.73 1.75 3.63L3 12l2.1-1.05A6.1 6.1 0 0 0 7 11.3c3.04 0 5.5-2.19 5.5-4.9S10.04 1.5 7 1.5z" stroke="#C9A96E" strokeWidth="1.3"/></svg>,
            },
            {
              label: 'Deep local knowledge',
              svg: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a4 4 0 0 1 4 4c0 3-4 7-4 7S3 8.5 3 5.5a4 4 0 0 1 4-4z" stroke="#C9A96E" strokeWidth="1.3"/><circle cx="7" cy="5.5" r="1.2" stroke="#C9A96E" strokeWidth="1.1"/></svg>,
            },
            {
              label: 'Trusted & confidential',
              svg: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l4.5 2v4c0 2.5-2 4.5-4.5 5C4.5 12 2.5 10 2.5 7.5v-4L7 1.5z" stroke="#C9A96E" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7l1.3 1.5L9 5.5" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
          ].map(({ svg, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-bayit-border/50 rounded-full pl-3 pr-4 py-1.5 shadow-sm"
            >
              <span className="shrink-0">{svg}</span>
              <span className="text-xs font-medium text-bayit-gray whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
