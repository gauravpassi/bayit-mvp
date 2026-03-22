/**
 * Google Sheets integration for Bayit property listings
 *
 * Sheet column layout (Row 1 = headers, data starts at Row 2):
 * A:id  B:title  C:description  D:price  E:city  F:neighborhood
 * G:type  H:bedrooms  I:bathrooms  J:area_sqm  K:image_url
 * L:lat  M:lng  N:features (comma-sep)  O:available (TRUE/FALSE)
 */

import type { Property } from '@/types';
import { SAMPLE_PROPERTIES } from './properties';

type SheetRow = string[];

// ── Pre-computed property index (the "vectorised" layer) ──────────────────────
// Built once when properties are loaded; lets route handlers do O(1) lookups
// instead of scanning the full array on every chat message.
export interface PropertyIndex {
  all:        Property[];
  available:  Property[];
  byCity:     Record<string, Property[]>;   // city.toLowerCase() → properties
  byType:     Record<string, Property[]>;   // type.toLowerCase() → properties
  byCityType: Record<string, Property[]>;   // `${city}|${type}` → properties
  priceRange: { min: number; max: number; avg: number };
  cities:     string[];
  types:      string[];
}

function buildIndex(properties: Property[]): PropertyIndex {
  const available = properties.filter(p => p.available);

  const byCity:     Record<string, Property[]> = {};
  const byType:     Record<string, Property[]> = {};
  const byCityType: Record<string, Property[]> = {};

  for (const p of available) {
    const city = p.city.toLowerCase();
    const type = p.type.toLowerCase();
    const key  = `${city}|${type}`;

    if (!byCity[city])     byCity[city]     = [];
    if (!byType[type])     byType[type]     = [];
    if (!byCityType[key])  byCityType[key]  = [];

    byCity[city].push(p);
    byType[type].push(p);
    byCityType[key].push(p);
  }

  const prices    = available.map(p => p.price).filter(Boolean);
  const priceRange = prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices), avg: prices.reduce((a, b) => a + b, 0) / prices.length }
    : { min: 0, max: 0, avg: 0 };

  return {
    all:        properties,
    available,
    byCity,
    byType,
    byCityType,
    priceRange,
    cities:     [...new Set(available.map(p => p.city))].sort(),
    types:      [...new Set(available.map(p => p.type))].sort(),
  };
}

// ── Module-level cache (persists across warm Vercel invocations) ──────────────
// TTL: 5 minutes — fresh enough for a demo, fast enough to not slow chat.
let _cache:          PropertyIndex | null = null;
let _cacheTimestamp  = 0;
const CACHE_TTL_MS   = 5 * 60 * 1_000;

function rowToProperty(row: SheetRow): Property | null {
  try {
    const [
      id, title, description, price, city, neighborhood,
      type, bedrooms, bathrooms, areaSqm, imageUrl,
      lat, lng, features, available,
    ] = row;

    if (!id || !title) return null;

    return {
      id: id.trim(),
      title: title.trim(),
      description: description?.trim() ?? '',
      price: parseFloat(price) || 0,
      city: city?.trim() ?? '',
      neighborhood: neighborhood?.trim() ?? '',
      type: (type?.trim() as Property['type']) ?? 'Apartment',
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 0,
      areaSqm: parseFloat(areaSqm) || 0,
      imageUrl: imageUrl?.trim() ?? '',
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      features: features ? features.split(',').map((f) => f.trim()).filter(Boolean) : [],
      available: available?.trim().toUpperCase() === 'TRUE',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch properties from Google Sheets.
 * Falls back gracefully to sample data if credentials are not configured.
 */
export async function fetchPropertiesFromSheets(): Promise<Property[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // ── Fallback to sample data ──────────────────────────────────────────────
  if (!sheetId) {
    console.warn('[Bayit] GOOGLE_SHEET_ID not set – using sample property data.');
    return SAMPLE_PROPERTIES;
  }

  // ── Option A: Service Account ────────────────────────────────────────────
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (serviceAccountEmail && privateKey) {
    try {
      const { google } = await import('googleapis');
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Properties!A2:O',
      });

      const rows: SheetRow[] = response.data.values ?? [];
      const properties = rows.map(rowToProperty).filter(Boolean) as Property[];
      return properties.length > 0 ? properties : SAMPLE_PROPERTIES;
    } catch (err) {
      console.error('[Bayit] Google Sheets (Service Account) error:', err);
      return SAMPLE_PROPERTIES;
    }
  }

  // ── Option B: API Key (public sheets) ───────────────────────────────────
  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Properties!A2:O?key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Sheets API responded ${res.status}`);

      const data = await res.json();
      const rows: SheetRow[] = data.values ?? [];
      const properties = rows.map(rowToProperty).filter(Boolean) as Property[];
      return properties.length > 0 ? properties : SAMPLE_PROPERTIES;
    } catch (err) {
      console.error('[Bayit] Google Sheets (API Key) error:', err);
      return SAMPLE_PROPERTIES;
    }
  }

  console.warn('[Bayit] No Google Sheets credentials found – using sample data.');
  return SAMPLE_PROPERTIES;
}

/**
 * getPropertyIndex()
 *
 * Returns a pre-built, indexed, cached snapshot of all properties.
 * First call fetches from Sheets; subsequent calls within the TTL window
 * return instantly from the module-level cache — no Sheets API round-trip.
 *
 * This is called:
 *   1. From /api/warmup on page load (pre-warms the cache)
 *   2. From /api/chat on every message (hits cache, not Sheets)
 */
export async function getPropertyIndex(): Promise<PropertyIndex> {
  const now = Date.now();
  if (_cache && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    return _cache;
  }
  const fresh = await fetchPropertiesFromSheets();
  _cache = buildIndex(fresh);
  _cacheTimestamp = now;
  console.log(`[Bayit] Property index built: ${_cache.available.length} available of ${fresh.length} total`);
  return _cache;
}

/** Convenience wrapper — just returns the flat array (most callers only need this) */
export async function getProperties(): Promise<Property[]> {
  const index = await getPropertyIndex();
  return index.all;
}
