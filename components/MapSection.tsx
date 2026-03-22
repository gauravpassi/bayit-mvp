'use client';

import dynamic from 'next/dynamic';
import { useMemo, useEffect, useState } from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { SAMPLE_PROPERTIES } from '@/lib/properties';
import { useChatContext } from '@/contexts/ChatContext';
import type { Property } from '@/types';

// Dynamic import — Leaflet cannot run server-side
const MapWithNoSSR = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-2xl bg-bayit-blue/8 flex items-center justify-center">
      <div className="text-bayit-gray text-sm animate-pulse flex items-center gap-2">
        <MapPin size={18} /> Loading map…
      </div>
    </div>
  ),
});

export default function MapSection() {
  const { openChat } = useChatContext();
  const properties: Property[] = useMemo(() => SAMPLE_PROPERTIES, []);

  // Read ?highlight=id1,id2 from URL (set by chat "View on Map" button)
  const [highlightIds, setHighlightIds] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('highlight');
    if (raw) {
      setHighlightIds(raw.split(',').map(s => s.trim()).filter(Boolean));
    }
  }, []);

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
              {highlightIds.length > 0
                ? `Showing ${highlightIds.length} propert${highlightIds.length === 1 ? 'y' : 'ies'} from your search — click any marker for details.`
                : 'Click any marker to see details. Ask our AI to narrow by location.'}
            </p>
          </div>
          <button
            onClick={openChat}
            className="shrink-0 flex items-center gap-2 bg-bayit-blue hover:bg-bayit-blue-dark text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={16} />
            Search This Area
          </button>
        </div>

        {/* Leaflet map */}
        <MapWithNoSSR properties={properties} highlightIds={highlightIds} />

        {/* City quick-links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {['Marrakech', 'Casablanca', 'Agadir', 'Rabat', 'Fes'].map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 bg-bayit-bg border border-bayit-border text-bayit-gray text-sm px-4 py-1.5 rounded-full"
            >
              <MapPin size={12} className="text-bayit-blue" />
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
