'use client';

/**
 * CacheWarmer
 *
 * Invisible component that pre-loads the Google Sheets property data
 * when the page first renders in the browser. By the time the user opens
 * the chat and types their first message, the property index is already
 * warm in the Vercel serverless function's module-level cache — so there
 * is no Sheets API round-trip delaying Karim's first response.
 */

import { useEffect } from 'react';

export default function CacheWarmer() {
  useEffect(() => {
    // Fire and forget — we don't need to wait for or handle the result.
    // On success: cache is warm. On failure: chat still works, just cold.
    fetch('/api/warmup', { method: 'GET' })
      .then(r => r.json())
      .then(data => {
        if (data?.ok) {
          console.log(
            `[Bayit] Property cache warm: ${data.available}/${data.total} available ` +
            `across ${data.cities?.length ?? '?'} cities`
          );
        }
      })
      .catch(() => {
        // Silent — warmup is a best-effort optimisation
      });
  }, []); // empty deps → runs once on mount, never again

  return null; // renders nothing
}
