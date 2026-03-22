'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { SAMPLE_PROPERTIES, formatPrice } from '@/lib/properties';
import { useChatContext } from '@/contexts/ChatContext';
import type { Property } from '@/types';

// Dynamic import (Leaflet cannot run on the server)
const MapWithNoSSR = dynamic(() => import('./MapInner'), { ssr: false, loading: () => (
  <div className="w-full h-[480px] rounded-2xl bg-bayit-blue/10 flex items-center justify-center">
    <div className="text-bayit-gray text-sm animate-pulse flex items-center gap-2">
      <MapPin size={18} /> Loading map…
    </div>
  </div>
)});

export default function MapSection() {
  const { openChat } = useChatContext();
  const properties: Property[] = useMemo(() => SAMPLE_PROPERTIES, []);

  return (
    <section id="map" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="section-badge mb-4">Property Map</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-bayit-dark mt-3">
              Explore Across Morocco
            </h2>
            <p className="text-bayit-gray mt-3 text-lg max-w-md">
              Click any marker to see property details. Ask our AI to narrow by location.
            </p>
          </div>
          <button
            onClick={openChat}
            className="shrink-0 flex items-center gap-2 bg-bayit-gold hover:bg-bayit-gold-light text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={16} />
            Search This Area
          </button>
        </div>

        {/* Map */}
        <MapWithNoSSR properties={properties} />

        {/* City quick-links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {['Marrakech', 'Casablanca', 'Agadir', 'Rabat', 'Fes'].map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 bg-bayit-cream border border-bayit-border text-bayit-gray text-sm px-4 py-1.5 rounded-full"
            >
              <MapPin size={12} className="text-bayit-gold" />
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
