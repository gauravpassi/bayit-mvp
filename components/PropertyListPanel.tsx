'use client';

import { useRef, useEffect } from 'react';
import { MapPin, Bed, Bath, Maximize2, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import clsx from 'clsx';

// Unified warm parchment badge
const TYPE_BADGE = 'bg-[#F5EFE3] text-[#7C6336] border border-[#E8DDD0]';

interface PropertyListPanelProps {
  properties:    Property[];
  selectedId:    string | null;
  highlightIds?: string[];
  onSelect:      (id: string) => void;
}

export default function PropertyListPanel({
  properties,
  selectedId,
  highlightIds = [],
  onSelect,
}: PropertyListPanelProps) {
  const { openModal } = usePropertyModal();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-bayit-border shrink-0 bg-white">
        <p className="text-bayit-dark font-bold text-sm">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </p>
        {highlightIds.length > 0 && (
          <p className="text-bayit-blue text-xs mt-0.5">
            {highlightIds.length} matched from your search
          </p>
        )}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-bayit-muted text-sm py-16">
            <MapPin size={28} className="mb-3 opacity-30" />
            No properties to display
          </div>
        ) : (
          <div>
            {properties.map(p => {
              const isSelected    = selectedId === String(p.id);
              const isHighlighted = highlightIds.includes(String(p.id));

              return (
                <div
                  key={p.id}
                  ref={el => { itemRefs.current[String(p.id)] = el; }}
                  onClick={() => onSelect(String(p.id))}
                  className={clsx(
                    'group relative flex flex-col cursor-pointer border-b border-bayit-border transition-all duration-150',
                    isSelected
                      ? 'bg-bayit-blue-softer border-l-[3px] border-l-bayit-blue'
                      : 'hover:bg-bayit-bg border-l-[3px] border-l-transparent'
                  )}
                >
                  {/* "From search" banner */}
                  {isHighlighted && (
                    <div className="bg-bayit-blue px-4 py-1 flex items-center gap-1.5">
                      <span className="text-white text-[10px] font-semibold tracking-wide uppercase">
                        ✦ Matched from your search
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="relative w-[88px] h-[72px] shrink-0 rounded-xl overflow-hidden bg-bayit-bg">
                      <Image
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=70&auto=format&fit=crop'}
                        alt={p.title}
                        fill
                        sizes="88px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

                      {/* Top row: type badge */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', TYPE_BADGE)}>
                          {p.type}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-bayit-dark font-semibold text-[13px] leading-snug line-clamp-2 mb-1">
                        {p.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-bayit-muted text-[11px]">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{p.neighborhood}, {p.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: price + specs */}
                  <div className={clsx(
                    'flex items-center justify-between px-3 pb-3',
                    isSelected ? '' : ''
                  )}>
                    <div>
                      <p className="text-bayit-blue font-extrabold text-[15px] leading-none">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-bayit-gray text-[11px]">
                      {p.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed size={11} className="text-bayit-muted" />
                          {p.bedrooms}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Bath size={11} className="text-bayit-muted" />
                        {p.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 size={11} className="text-bayit-muted" />
                        {p.areaSqm} m²
                      </span>
                    </div>
                  </div>

                  {/* "View Details" — expands on selected */}
                  {isSelected && (
                    <div className="px-3 pb-3">
                      <button
                        onClick={e => { e.stopPropagation(); openModal(p); }}
                        className="w-full flex items-center justify-center gap-1.5 bg-bayit-blue hover:bg-bayit-blue-dark text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        View Full Details
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
