import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin } from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import clsx from 'clsx';

const TYPE_COLORS: Record<string, string> = {
  Apartment: 'bg-blue-100 text-blue-700',
  Villa:     'bg-emerald-100 text-emerald-700',
  Riad:      'bg-amber-100 text-amber-700',
  Studio:    'bg-purple-100 text-purple-700',
  Penthouse: 'bg-rose-100 text-rose-700',
  House:     'bg-teal-100 text-teal-700',
};

interface PropertyCardProps {
  property: Property;
  /** compact = smaller card suitable for chat embed */
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const { title, city, neighborhood, price, type, bedrooms, bathrooms, areaSqm, imageUrl } = property;

  return (
    <div
      className={clsx(
        'property-card bg-white rounded-xl overflow-hidden border border-bayit-border shadow-sm',
        compact ? 'w-64 shrink-0' : 'w-full'
      )}
    >
      {/* Image */}
      <div className={clsx('relative overflow-hidden', compact ? 'h-40' : 'h-52')}>
        <Image
          src={imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=75&auto=format&fit=crop'}
          alt={title}
          fill
          sizes={compact ? '256px' : '(max-width: 768px) 100vw, 400px'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Type badge over image */}
        <span
          className={clsx(
            'absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full',
            TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'
          )}
        >
          {type}
        </span>
      </div>

      {/* Body */}
      <div className={clsx('p-4', compact && 'p-3')}>
        {/* Location */}
        <div className="flex items-center gap-1 text-bayit-gray text-xs mb-1">
          <MapPin size={11} />
          <span>{neighborhood}, {city}</span>
        </div>

        {/* Title */}
        <h3
          className={clsx(
            'font-semibold text-bayit-dark leading-snug mb-2',
            compact ? 'text-sm line-clamp-2' : 'text-base'
          )}
        >
          {title}
        </h3>

        {/* Price */}
        <div className="text-bayit-gold font-bold text-lg mb-3">
          {formatPrice(price)}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-bayit-gray text-xs border-t border-bayit-border pt-3">
          <span className="flex items-center gap-1">
            <Bed size={13} />
            {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} />
            {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} />
            {areaSqm} m²
          </span>
        </div>
      </div>
    </div>
  );
}
