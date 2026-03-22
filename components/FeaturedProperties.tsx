'use client';

import { MessageCircle } from 'lucide-react';
import { SAMPLE_PROPERTIES } from '@/lib/properties';
import { useChatContext } from '@/contexts/ChatContext';
import PropertyCard from './PropertyCard';

// Show first 6 for the landing page
const FEATURED = SAMPLE_PROPERTIES.slice(0, 6);

export default function FeaturedProperties() {
  const { openChat } = useChatContext();

  return (
    <section id="properties" className="py-24 bg-bayit-cream moroccan-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="section-badge mb-4">Curated Listings</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-bayit-dark mt-3">
              Featured Properties
            </h2>
            <p className="text-bayit-gray mt-3 text-lg max-w-md">
              Hand-picked properties across Morocco&apos;s most sought-after cities.
            </p>
          </div>

          <button
            onClick={openChat}
            className="shrink-0 flex items-center gap-2 bg-bayit-blue hover:bg-bayit-blue-light text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={16} />
            Find My Match
          </button>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-bayit-gray mb-4">
            These are sample listings. The AI finds properties matching{' '}
            <span className="font-semibold text-bayit-dark">your exact criteria</span>.
          </p>
          <button
            onClick={openChat}
            className="inline-flex items-center gap-2 border-2 border-bayit-blue text-bayit-blue hover:bg-bayit-blue hover:text-white font-semibold px-8 py-3 rounded-full transition-all"
          >
            <MessageCircle size={16} />
            Search with AI
          </button>
        </div>
      </div>
    </section>
  );
}
