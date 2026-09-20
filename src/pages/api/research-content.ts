/**
 * /api/research-content — gated payload for the /research bibliography.
 *
 * Astro-native APIRoute (same SSR-worker pattern as src/pages/capture.ts
 * and src/pages/api/gateway-report.ts). The /research page ships only a
 * teaser server-side; the full annotated bibliography never appears in the
 * initial HTML. After the EmailGate capture succeeds (or its deliberate
 * unlock-on-network-failure fallback fires), the client POSTs here to
 * retrieve the bibliography data and renders it in the browser. This makes
 * the gate honest — the protected body is not view-source readable before
 * unlock.
 *
 * Method: POST (a captured email is the entry condition; GET is rejected so
 * the payload isn't trivially crawlable as a static asset). Body is optional
 * `{ email?: string }`; the email is not required to be re-validated here
 * because /capture already owns capture/validation — this endpoint only
 * serves the content the gate has decided to reveal.
 *
 * Response: `{ sources: Citation[] }` — the same array `/research` would
 * have inlined, split client-side into Sacred (S-) and Biomedical (B-).
 */
import type { APIRoute } from 'astro';
import { citations } from '../../data/citations';

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ sources: citations }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // The bibliography is studio content (client IP); discourage CDN/proxy
      // caching of the gated payload as if it were a public static asset.
      'Cache-Control': 'no-store',
    },
  });
};
