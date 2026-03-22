'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import PropertyListPanel from '@/components/PropertyListPanel';
import { SAMPLE_PROPERTIES } from '@/lib/properties';
import { useChatContext } from '@/contexts/ChatContext';

// Dynamic import — Leaflet cannot run server-side
const MapWithNoSSR = dynamic(() => import('@/components/MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-bayit-blue-soft flex items-center justify-center">
      <div className="text-bayit-gray text-sm animate-pulse flex items-center gap-2">
        <MapPin size={18} /> Loading map…
      </div>
    </div>
  ),
});

// ── Inner page (needs useSearchParams, must be inside Suspense) ───────────────
function PropertiesPageInner() {
  const searchParams     = useSearchParams();
  const { openChat }     = useChatContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);

  // Read ?highlight= from URL on mount
  useEffect(() => {
    const raw = searchParams.get('highlight');
    if (raw) {
      const ids = raw.split(',').map(s => s.trim()).filter(Boolean);
      setHighlightIds(ids);
      // Auto-select the first highlighted property in the list panel
      if (ids.length > 0) setSelectedId(ids[0]);
    }
  }, [searchParams]);

  // Sort: highlighted properties first, then rest
  const sortedProperties = useMemo(() => {
    if (highlightIds.length === 0) return SAMPLE_PROPERTIES;
    const highlighted = SAMPLE_PROPERTIES.filter(p => highlightIds.includes(String(p.id)));
    const rest        = SAMPLE_PROPERTIES.filter(p => !highlightIds.includes(String(p.id)));
    return [...highlighted, ...rest];
  }, [highlightIds]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bayit-bg">
      <Header />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-bayit-border bg-white mt-[57px] shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-bayit-muted hover:text-bayit-blue text-sm transition-colors">
            Home
          </Link>
          <span className="text-bayit-border">/</span>
          <span className="text-bayit-dark text-sm font-medium">Properties</span>
        </div>

        <div className="flex items-center gap-3">
          {highlightIds.length > 0 && (
            <span className="text-bayit-blue text-xs font-semibold bg-bayit-blue-soft px-3 py-1 rounded-full">
              {highlightIds.length} from your search
            </span>
          )}
          <button
            onClick={() => openChat()}
            className="flex items-center gap-1.5 bg-bayit-blue hover:bg-bayit-blue-dark text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            <MessageCircle size={14} />
            Search with AI
          </button>
        </div>
      </div>

      {/* Map + List split */}
      <div className="flex flex-1 overflow-hidden">

        {/* List panel — left, scrollable */}
        <div className="w-full sm:w-[340px] lg:w-[380px] shrink-0 border-r border-bayit-border bg-white flex flex-col overflow-hidden">
          <PropertyListPanel
            properties={sortedProperties}
            selectedId={selectedId}
            highlightIds={highlightIds}
            onSelect={handleSelect}
          />
        </div>

        {/* Map — fills remaining space */}
        <div className="flex-1 relative hidden sm:block">
          <MapWithNoSSR
            properties={sortedProperties}
            highlightIds={highlightIds}
            selectedId={selectedId}
            onSelect={handleSelect}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}

// ── Page export (Suspense boundary for useSearchParams) ───────────────────────
export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-bayit-gray animate-pulse flex items-center gap-2">
          <MapPin size={20} /> Loading properties…
        </div>
      </div>
    }>
      <PropertiesPageInner />
    </Suspense>
  );
}
