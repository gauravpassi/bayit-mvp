import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin } from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import { usePropertyModal } from '@/contexts/PropertyModalContext';
import clsx from 'clsx';

// Unified warm parchment badge — restrained, not rainbow
const TYPE_BADGE = 'bg-[#F5EFE3] text-[#7C6336] border border-[#E8DDD0]';

interface PropertyCardProps {
  property: Property;
  /** compact = smaller card suitable for chat embed */
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const { title, city, neighborhood, price, type, bedrooms, bathrooms, areaSqm, imageUrl } = property;
  const { openModal } = usePropertyModal();

  return (
    <div
      onClick={() => openModal(property)}
      className={clsx(
        'property-card bg-white rounded-xl overflow-hidden border border-bayit-border shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
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
            'absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full',
            TYPE_BADGE
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
        <div className="text-bayit-blue font-bold text-lg mb-3">
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
