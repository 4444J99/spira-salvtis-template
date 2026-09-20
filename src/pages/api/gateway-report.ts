/**
 * /api/gateway-report — EWG tap-gateway proxy for the Gateway funnel.
 *
 * Astro-native APIRoute (replaces the prior Cloudflare Pages Function at
 * functions/api/gateway-report.ts, which was unreachable in production: the
 * Astro `_worker.js` advanced-mode bundle takes precedence over root
 * `functions/`, and `functions/` is not part of `dist/`, so the old
 * handler 404'd and HydrationNode silently fell back to demo data).
 * Same migration pattern as src/pages/capture.ts.
 *
 * Route: POST /api/gateway-report
 * Body: { zipCode: string, gatewaySource: string }
 *
 * Optional KV binding `EWG_CACHE` caches parsed reports for 24h; absent
 * binding degrades gracefully (no cache, live fetch each time). Any
 * upstream failure falls back to a representative demo report so the UI
 * never shows an empty state.
 */
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';
import {
  parseEwgHtml,
  parseEwgSearchResult,
  type GatewayReport,
} from '../../lib/gateway-report-parser';

export const prerender = false;

interface Bindings {
  EWG_CACHE?: KVNamespace;
}

function bindings(): Bindings {
  // Astro v6 / @astrojs/cloudflare v13 removed `Astro.locals.runtime.env`;
  // bindings come from the `cloudflare:workers` module instead. When the
  // KV namespace isn't provisioned the field is undefined and caching is
  // skipped.
  return cfEnv as unknown as Bindings;
}

const DEMO_REPORT: GatewayReport = {
  zipCode: '00000',
  gatewaySource: 'tap',
  utilityName: 'Sample Municipal Gateway',
  contaminants: [
    {
      name: 'Haloacetic acids (HAA5)',
      detected: 27.7,
      legalLimit: 60,
      healthGuideline: 0.1,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic', 'cellular'],
    },
    {
      name: 'Total trihalomethanes (TTHMs)',
      detected: 49.2,
      legalLimit: 80,
      healthGuideline: 0.3,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic', 'cellular'],
    },
    {
      name: 'Chromium (hexavalent)',
      detected: 0.42,
      legalLimit: 100,
      healthGuideline: 0.01,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic', 'detox'],
    },
    {
      name: 'Chloroform',
      detected: 22.4,
      legalLimit: null,
      healthGuideline: 0.8,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic', 'detox'],
    },
    {
      name: 'Bromodichloromethane',
      detected: 8.9,
      legalLimit: null,
      healthGuideline: 0.3,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic'],
    },
    {
      name: 'Dibromochloromethane',
      detected: 5.1,
      legalLimit: null,
      healthGuideline: 0.4,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic'],
    },
    {
      name: 'Nitrate',
      detected: 1.8,
      legalLimit: 10000,
      healthGuideline: 0.14,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['reproductive', 'cellular'],
    },
    {
      name: 'Fluoride',
      detected: 700,
      legalLimit: 4000,
      healthGuideline: null,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: false,
      effects: ['neurological', 'hormonal'],
    },
    {
      name: 'Barium',
      detected: 34,
      legalLimit: 2000,
      healthGuideline: 700,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: false,
      effects: ['cellular'],
    },
    {
      name: 'Manganese',
      detected: 2.1,
      legalLimit: null,
      healthGuideline: null,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: false,
      effects: ['neurological'],
    },
    {
      name: 'Chlorine',
      detected: 1200,
      legalLimit: 4000,
      healthGuideline: null,
      unit: 'ppb',
      exceedsLegal: false,
      exceedsHealth: false,
      effects: ['skin', 'gateway'],
    },
    {
      name: 'Radium (-226 & -228)',
      detected: 0.8,
      legalLimit: 5,
      healthGuideline: 0.05,
      unit: 'pCi/L',
      exceedsLegal: false,
      exceedsHealth: true,
      effects: ['carcinogenic'],
    },
  ],
  totalContaminants: 12,
  exceedingHealth: 8,
  exceedingLegal: 0,
  lastUpdated: new Date().toISOString(),
  isDemo: true,
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const EWG_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; SovereignSystems/1.0)',
  Accept: 'text/html',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      zipCode?: string;
      gatewaySource?: string;
    };

    const zipCode =
      typeof body.zipCode === 'string'
        ? body.zipCode.replace(/\D/g, '').slice(0, 5)
        : '';
    const gatewaySource =
      typeof body.gatewaySource === 'string'
        ? body.gatewaySource.slice(0, 40)
        : 'tap';

    if (!zipCode || zipCode.length !== 5) {
      return new Response(
        JSON.stringify({ error: 'Valid 5-digit ZIP code required' }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    const { EWG_CACHE } = bindings();
    const cacheKey = `ewg:${zipCode}`;

    if (EWG_CACHE) {
      // Cache ops are individually guarded: a KV hiccup must degrade to a
      // LIVE fetch, not fall through to the outer catch and downgrade a
      // perfectly fetchable real report to demo data.
      try {
        const cached = await EWG_CACHE.get(cacheKey);
        if (cached) {
          const report: GatewayReport = JSON.parse(cached);
          report.gatewaySource = gatewaySource;
          return new Response(JSON.stringify(report), {
            headers: JSON_HEADERS,
          });
        }
      } catch (err) {
        console.error('[gateway-report] KV get failed; fetching live:', err);
      }
    }

    // zipCode is sanitized to exactly 5 digits above, so the upstream search
    // URL cannot be repointed (no SSRF surface). The detail URL is accepted
    // only if parseEwgSearchResult can resolve it back to EWG's system.php.
    const ewgUrl = `https://www.ewg.org/tapwater/search-results.php?zip5=${zipCode}&searchtype=zip`;
    const ewgResponse = await fetch(ewgUrl, { headers: EWG_HEADERS });

    if (!ewgResponse.ok) {
      return new Response(
        JSON.stringify({ ...DEMO_REPORT, zipCode, gatewaySource }),
        { headers: JSON_HEADERS },
      );
    }

    const searchHtml = await ewgResponse.text();
    const utility = parseEwgSearchResult(searchHtml);
    const detailResponse = utility
      ? await fetch(utility.utilityUrl, { headers: EWG_HEADERS })
      : null;
    const html = detailResponse?.ok ? await detailResponse.text() : searchHtml;
    const report = parseEwgHtml(html, zipCode, gatewaySource);

    if (!report || report.contaminants.length === 0) {
      return new Response(
        JSON.stringify({ ...DEMO_REPORT, zipCode, gatewaySource }),
        { headers: JSON_HEADERS },
      );
    }

    if (EWG_CACHE) {
      // Guarded for the same reason as the get above — we already HAVE the
      // real report; a failed cache write must not cost the user the result.
      try {
        await EWG_CACHE.put(cacheKey, JSON.stringify(report), {
          expirationTtl: 86400,
        });
      } catch (err) {
        console.error('[gateway-report] KV put failed; serving uncached:', err);
      }
    }

    return new Response(JSON.stringify(report), { headers: JSON_HEADERS });
  } catch {
    return new Response(
      JSON.stringify({ ...DEMO_REPORT, zipCode: '00000', gatewaySource: 'tap' }),
      { headers: JSON_HEADERS },
    );
  }
};
