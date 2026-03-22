/**
 * GET /api/warmup
 *
 * Called automatically on every page load (via CacheWarmer component).
 * Pre-fetches and indexes the Google Sheets property data so it's already
 * in the module-level cache before the user types their first chat message.
 *
 * Without this: the first chat message waits ~2s for Sheets + ~1s for indexing.
 * With this:    the first chat message hits the in-memory index instantly.
 */

import { NextResponse } from 'next/server';
import { getPropertyIndex } from '@/lib/sheets';

export async function GET() {
  try {
    const index = await getPropertyIndex();
    return NextResponse.json({
      ok:        true,
      total:     index.all.length,
      available: index.available.length,
      cities:    index.cities,
      types:     index.types,
      priceRange: {
        min: Math.round(index.priceRange.min / 1_000) * 1_000,
        max: Math.round(index.priceRange.max / 1_000) * 1_000,
        avg: Math.round(index.priceRange.avg / 1_000) * 1_000,
      },
      cached: true,
    });
  } catch (err) {
    console.error('[Bayit] Warmup error:', err);
    return NextResponse.json({ ok: false, error: 'warmup failed' }, { status: 500 });
  }
}
