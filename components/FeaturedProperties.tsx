'use client';

import Link from 'next/link';
import { SAMPLE_PROPERTIES } from '@/lib/properties';
import PropertyCard from './PropertyCard';

// Show first 3 on landing page
const FEATURED = SAMPLE_PROPERTIES.slice(0, 3);
const TOTAL    = SAMPLE_PROPERTIES.length;

export default function FeaturedProperties() {
  return (
    <section id="properties" className="py-24 bg-bayit-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="section-badge mb-4">Curated Listings</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-bayit-dark mt-3">
              Featured Properties
            </h2>
            <p className="text-bayit-gray mt-3 text-lg max-w-md">
              Hand-picked properties across Morocco&apos;s most sought-after cities.
            </p>
          </div>
          <Link
            href="/properties"
            className="shrink-0 text-bayit-blue hover:text-bayit-blue-dark text-sm font-semibold transition-colors underline-offset-2 hover:underline"
          >
            View all {TOTAL} properties →
          </Link>
        </div>

        {/* 3-column grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 border border-bayit-border text-bayit-gray hover:text-bayit-blue hover:border-bayit-blue text-sm font-medium px-8 py-3 rounded-full transition-all"
          >
            View all {TOTAL} properties →
          </Link>
        </div>
      </div>
    </section>
  );
}
