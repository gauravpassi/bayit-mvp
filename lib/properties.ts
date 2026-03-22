import type { Property } from '@/types';

// ─── Sample property data (used as fallback when Google Sheets is not configured) ───
export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Authentic Riad in Marrakech Medina',
    description:
      'A beautifully restored traditional riad nestled in the heart of Marrakech\'s ancient medina. Features an enchanting central courtyard with mosaic fountain, lush garden, and hand-crafted zellige tilework throughout.',
    price: 2500000,
    city: 'Marrakech',
    neighborhood: 'Medina',
    type: 'Riad',
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 280,
    imageUrl:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80&auto=format&fit=crop',
    lat: 31.6295,
    lng: -7.9811,
    features: ['Courtyard', 'Rooftop Terrace', 'Hammam', 'Parking', 'Fully Restored'],
    available: true,
  },
  {
    id: '2',
    title: 'Modern Apartment in Casablanca Business District',
    description:
      'Sleek, fully furnished apartment in the vibrant Maarif district. Floor-to-ceiling windows offer panoramic city views. Walking distance to major corporate offices, restaurants, and shopping centers.',
    price: 1800000,
    city: 'Casablanca',
    neighborhood: 'Maarif',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
    lat: 33.5788,
    lng: -7.6356,
    features: ['City View', 'Parking', 'Security', 'Gym', 'Elevator'],
    available: true,
  },
  {
    id: '3',
    title: 'Beachfront Villa in Agadir',
    description:
      'Stunning oceanfront villa with private pool and direct beach access. Contemporary Moroccan architecture blends seamlessly with resort-style amenities. Perfect for luxury living or premium rental investment.',
    price: 4500000,
    city: 'Agadir',
    neighborhood: 'Secteur Balnéaire',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 420,
    imageUrl:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop',
    lat: 30.4202,
    lng: -9.5982,
    features: ['Private Pool', 'Beach Access', 'Garden', 'Parking 3 cars', 'Staff Quarters'],
    available: true,
  },
  {
    id: '4',
    title: 'Studio Apartment in Rabat Agdal',
    description:
      'Bright and modern studio in Rabat\'s upscale Agdal neighbourhood. Ideal for young professionals or as a buy-to-let investment. Close to embassies, ministries, and Agdal\'s lively café scene.',
    price: 650000,
    city: 'Rabat',
    neighborhood: 'Agdal',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 48,
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop',
    lat: 33.9716,
    lng: -6.8498,
    features: ['Furnished', 'Balcony', 'Secure Building', 'Near Metro'],
    available: true,
  },
  {
    id: '5',
    title: 'Traditional Dar in Fes El Bali',
    description:
      'Charming traditional house (dar) located in the UNESCO-listed old medina of Fes. Intricate stucco ceilings, cedarwood carvings, and a sun-drenched terrace make this a rare cultural gem.',
    price: 950000,
    city: 'Fes',
    neighborhood: 'Fes El Bali',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 185,
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    lat: 34.0645,
    lng: -4.9759,
    features: ['Rooftop Terrace', 'Traditional Architecture', 'Near Medina Souks'],
    available: true,
  },
  {
    id: '6',
    title: 'Luxury Penthouse in Casablanca Anfa',
    description:
      'Exclusive duplex penthouse in the prestigious Anfa district. Private rooftop terrace with pool and breathtaking Atlantic Ocean views. Premium finishes, smart home system, and concierge service included.',
    price: 5200000,
    city: 'Casablanca',
    neighborhood: 'Anfa',
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 360,
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop',
    lat: 33.5892,
    lng: -7.6534,
    features: ['Rooftop Pool', 'Ocean View', 'Smart Home', 'Concierge', 'Private Garage'],
    available: true,
  },
];

/**
 * Format a price in MAD for display
 * e.g. 2500000 → "2,500,000 MAD"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} MAD`;
}

/**
 * Simple keyword-based property filter used in mock/fallback chat mode
 */
export function filterProperties(
  properties: Property[],
  query: string
): Property[] {
  const q = query.toLowerCase();

  // Extract city mentions
  const cities = ['marrakech', 'casablanca', 'rabat', 'agadir', 'fes', 'tangier', 'meknes'];
  const mentionedCity = cities.find((c) => q.includes(c));

  // Extract type mentions
  const typeMap: Record<string, Property['type']> = {
    apartment: 'Apartment', villa: 'Villa', riad: 'Riad',
    studio: 'Studio', penthouse: 'Penthouse', house: 'House',
  };
  const typeKey = Object.keys(typeMap).find((t) => q.includes(t));
  const mentionedType: Property['type'] | undefined = typeKey ? typeMap[typeKey] : undefined;

  // Extract budget hints
  const budgetMatch = q.match(/(\d[\d\s,]*)\s*(mad|dh|dirham)/i);
  const maxBudget = budgetMatch
    ? parseInt(budgetMatch[1].replace(/[\s,]/g, ''), 10)
    : null;

  // Extract bedroom hints
  const bedroomMatch = q.match(/(\d)\s*(bed|bedroom|chambre)/i);
  const minBedrooms = bedroomMatch ? parseInt(bedroomMatch[1], 10) : null;

  return properties.filter((p) => {
    if (!p.available) return false;
    if (mentionedCity && p.city.toLowerCase() !== mentionedCity) return false;
    if (mentionedType && p.type !== mentionedType) return false;
    if (maxBudget && p.price > maxBudget * 1.1) return false;
    if (minBedrooms && p.bedrooms < minBedrooms) return false;
    return true;
  });
}
