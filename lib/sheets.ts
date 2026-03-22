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
