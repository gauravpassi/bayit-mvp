'use client';

import { useEffect } from 'react';
import { X, MapPin, Bed, Bath, Maximize2, MessageSquare, Check } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/properties';
import type { Property } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  Apartment: 'bg-blue-100 text-blue-700',
  Villa:     'bg-emerald-100 text-emerald-700',
  Riad:      'bg-amber-100 text-amber-700',
  Studio:    'bg-purple-100 text-purple-700',
  Penthouse: 'bg-rose-100 text-rose-700',
  House:     'bg-teal-100 text-teal-700',
};

interface PropertyModalProps {
  property: Property;
  onClose:  () => void;
}

export default function PropertyModal({ property: p, onClose }: PropertyModalProps) {

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Navigate to chat — use window.location so navigation isn't
  // swallowed by the modal unmount triggered by onClose()
  const handleChatAbout = () => {
    const q = encodeURIComponent(
      `Tell me more about "${p.title}" in ${p.city}. Is it a good option for me?`
    );
    onClose();
    window.location.href = `/chat?q=${q}`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative bg-white w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Hero image ─────────────────────────────────────────────────── */}
        <div className="relative h-56 sm:h-64 shrink-0">
          <Image
            src={p.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
            alt={p.title}
            fill
            sizes="600px"
            className="object-cover"
          />
          {/* Dark gradient at bottom so price text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {/* Type badge */}
          <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${TYPE_COLORS[p.type] ?? 'bg-gray-100 text-gray-700'}`}>
            {p.type}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>

          {/* Price */}
          <p className="absolute bottom-4 left-5 text-white font-extrabold text-xl drop-shadow-md">
            {formatPrice(p.price)}
          </p>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-6 space-y-4">

            {/* Location */}
            <div className="flex items-center gap-1.5 text-bayit-gray text-sm">
              <MapPin size={13} className="shrink-0 text-bayit-blue" />
              <span>{p.neighborhood}, {p.city}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-bayit-dark leading-snug -mt-1">
              {p.title}
            </h2>

            {/* Specs */}
            <div className="flex items-center gap-5 text-sm text-bayit-gray py-4 border-y border-bayit-border">
              {p.bedrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed size={15} className="text-bayit-blue" />
                  {p.bedrooms} {p.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Bath size={15} className="text-bayit-blue" />
                {p.bathrooms} {p.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize2 size={15} className="text-bayit-blue" />
                {p.areaSqm} m²
              </span>
            </div>

            {/* Description */}
            {p.description && (
              <p className="text-bayit-gray text-sm leading-relaxed">
                {p.description}
              </p>
            )}

            {/* Features */}
            {p.features && p.features.length > 0 && (
              <div>
                <p className="text-bayit-dark font-semibold text-sm mb-3">Features</p>
                <div className="flex flex-wrap gap-2">
                  {p.features.map(f => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 text-xs bg-bayit-blue-soft text-bayit-blue border border-bayit-blue/20 px-3 py-1.5 rounded-full font-medium"
                    >
                      <Check size={10} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CTA footer ─────────────────────────────────────────────────── */}
        <div className="px-5 pt-3 pb-5 border-t border-bayit-border shrink-0 bg-white">
          <button
            onClick={handleChatAbout}
            className="w-full flex items-center justify-center gap-2 bg-bayit-blue hover:bg-bayit-blue-dark text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            <MessageSquare size={16} />
            Ask bAytI about this property
          </button>
        </div>
      </div>
    </div>
  );
}
