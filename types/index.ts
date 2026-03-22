export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;          // in MAD
  city: string;
  neighborhood: string;
  type: 'Apartment' | 'Villa' | 'Riad' | 'Studio' | 'Penthouse' | 'House';
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  imageUrl: string;
  lat: number;
  lng: number;
  features: string[];
  available: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
  propertyNotes?: Record<string, string>;
  timestamp: Date;
}

export interface ChatApiRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatApiResponse {
  message: string;
  properties?: Property[];
  propertyNotes?: Record<string, string>;
  readyToSearch?: boolean;
}
