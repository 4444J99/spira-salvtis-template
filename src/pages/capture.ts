/**
 * /capture — universal form-capture sink for the Spira salvtis site.
 *
 * Astro-native APIRoute (replaces the prior Cloudflare Pages Function at
 * functions/capture.ts, which was being intercepted by the Astro SSR
 * worker because Astro's _worker.js takes precedence over Pages
 * Functions in the same project — this route is reachable in both
 * `npm run dev` and `wrangler pages dev` contexts).
 *
 * Multi-sink dispatch (additive; each sink is optional and isolated):
 *   1. KV (`SUBMISSIONS` namespace)  — primary durable sink for the site.
 *      Key: `submission:{ISO timestamp}:{random base36 id}`
 *      Value: full payload JSON + receivedAt + ipHint (last octet only)
 *      If the KV namespace isn't bound (e.g. local dev without wrangler
 *      bindings, or production before the KV is provisioned), we log a
 *      one-line warning and skip — never block the response.
 *   2. GHL webhook (`GHL_WEBHOOK_URL` env var)  — preserved sink for
 *      admin's GoHighLevel pipeline. If the env var is set, we POST
 *      a flat JSON envelope to it; if not, we skip silently.
 *   3. Future sinks (D1, email, etc.) plug in here as additional
 *      branches; they should follow the same isolation rule (any sink
 *      failure must not affect the client response).
 *
 * The endpoint always returns 200 `{success: true}` for valid email
 * submissions. The quiz UX treats this as fire-and-forget — the user
 * sees their result panel before this network call completes, so the
 * flow never blocks on capture latency or webhook availability.
 */
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

type Phase = 'INITIATE' | 'INTEGRATE' | 'ACTIVATE';
type NonprofitPath = 'donor' | 'host' | 'volunteer' | 'reset-candidate';

interface CapturePayload {
  email?: string;
  name?: string;
  source?: string;
  // Gateway personalized-plan extension — present when the call comes from
  // the "send me a personalized filter plan" CTA on /gateway/ (W-070). The
  // simplified path admin described: a visitor leaves email + address,
  // she runs the EWG lookup manually and replies with a tailored plan.
  // `address` is free text (ZIP or street address) and optional — the
  // email alone is enough to start the conversation.
  address?: string;
  // Quiz extension — present when the call comes from the
  // node-placement quiz at /quiz (or any successor that uses
  // the same affinity-scoring contract).
  quizNodeId?: number; // 1..13
  quizPreviewNodeId?: number; // 1..13, when the strongest match is still gated
  quizScore?: number; // 0..100 (normalized affinity for top node)
  quizPath?: string; // serialized answers e.g. "INTEGRATE|system|3,5,2,4,5"
  selectedPillar?: string; // pillar slug
  selectedPhase?: Phase;
  // Decision-board extension — present when the call comes from
  // /decisions option clicks. Each click captures (a) which decision
  // was answered, (b) which option was chosen, (c) whether the chosen
  // option was the studio's recommendation, and (d) the suggestion
  // text itself so KV preserves what was proposed alongside the answer.
  decisionId?: string;
  chosenOptionLabel?: string;
  chosenOptionRecommended?: boolean;
  studioSuggestion?: string;
  decisionCategory?: string;
  decisionOwner?: string;
  // DP sign-up extension — present when the call comes from the
  // $99 Distributor Position interest form. The payment itself is
  // intentionally not accepted until the Stripe-vs-GHL rail decision clears.
  offerId?: string;
  offerAmountUsd?: number;
  paymentRail?: string;
  checkoutEnabled?: boolean;
  // Nonprofit arm extension — present when the call comes from the
  // Cind & Sol / GH#39 donation + farm-to-reset interest surface.
  nonprofitPath?: NonprofitPath;
  donationIntentUsd?: number;
  donationRailStatus?: 'held' | 'ready';
  resetDurationDays?: number;
  instagramHandle?: string;
  supportNote?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Decision-board source uses a known constant identifier so admin's
// click-throughs land in KV without requiring her to retype her email
// on every option. She's the only client of /decisions; if a 4jp click
// is captured via the same endpoint, the decisionOwner field distinguishes.
const DECISION_BOARD_SOURCE = 'decision-board';
const DECISION_BOARD_DEFAULT_EMAIL = 'decisions@spira-salvtis.local';
const DP_SIGNUP_SOURCE = 'dp-signup-interest';
const GATEWAY_PERSONALIZED_PLAN_SOURCE = 'gateway-personalized-plan';
const NONPROFIT_ARM_SOURCE = 'nonprofit-arm-interest';

function randomId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

function ipHintFromHeaders(headers: Headers): string {
  // Cloudflare provides the connecting IP via CF-Connecting-IP. We keep
  // only a coarse fragment — enough to de-duplicate aggressive resubmits,
  // not enough to identify. For IPv4 that's the last octet; for IPv6 it's
  // the FIRST hextet (part of the shared routing prefix) — never the
  // trailing interface identifier, which would single out a host.
  const ip = headers.get('CF-Connecting-IP') ?? '';
  if (!ip) return '';
  if (ip.includes(':')) {
    return ip.split(':').find((seg) => seg.length > 0) ?? '';
  }
  return ip.split('.').pop() ?? '';
}

interface Bindings {
  GHL_WEBHOOK_URL?: string;
  SUBMISSIONS?: KVNamespace;
}

// Rate-limit window: a single connecting IP may submit at most
// RATE_LIMIT_MAX times per RATE_LIMIT_WINDOW_SECONDS. The counter lives
// in the SUBMISSIONS KV under an `rl:<ip>` key with a matching TTL, so
// the window self-expires without a sweep. Modest cap — the legitimate
// flow (quiz result, one decision click) never approaches it; the cap
// only blunts scripted resubmits against the always-200 endpoint.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

async function isRateLimited(
  env: Bindings,
  headers: Headers,
): Promise<boolean> {
  // No KV binding (e.g. `astro dev` without wrangler bindings) means no
  // counter store — degrade gracefully to no throttling, exactly like the
  // KV persistence sink skips when unbound.
  if (!env.SUBMISSIONS) return false;
  const ip = headers.get('CF-Connecting-IP') ?? '';
  // Without a connecting IP we can't key a counter; don't throttle.
  if (!ip) return false;
  const key = `rl:${ip}`;
  try {
    const current = Number((await env.SUBMISSIONS.get(key)) ?? '0');
    if (Number.isFinite(current) && current >= RATE_LIMIT_MAX) {
      return true;
    }
    // Re-assert the TTL each write so a steady stream stays windowed.
    await env.SUBMISSIONS.put(key, String(current + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });
    return false;
  } catch (err) {
    // A KV hiccup must not convert into a denial — fail open.
    console.error('[capture] rate-limit check failed; allowing:', err);
    return false;
  }
}

function bindings(): Bindings {
  // Astro v6 / @astrojs/cloudflare v13 removed `Astro.locals.runtime.env`
  // (accessing it now throws); bindings come from the `cloudflare:workers`
  // module instead. When a binding isn't provisioned (e.g. `astro dev`
  // without wrangler bindings), the field is simply undefined and the
  // matching sink degrades gracefully.
  return cfEnv as unknown as Bindings;
}

async function persistToKv(
  env: Bindings,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!env.SUBMISSIONS) {
    console.warn(
      '[capture] SUBMISSIONS KV not bound; skipping persistent sink',
    );
    return;
  }
  const key = `submission:${new Date().toISOString()}:${randomId()}`;
  try {
    await env.SUBMISSIONS.put(key, JSON.stringify(payload));
  } catch (err) {
    console.error('[capture] KV put failed:', err);
  }
}

async function dispatchToGhl(
  env: Bindings,
  payload: Record<string, unknown>,
): Promise<void> {
  const url = env.GHL_WEBHOOK_URL;
  if (!url) return;
  // Bound the outbound call so a slow/hanging GHL endpoint can't pin the
  // worker open — the client response should never wait on a flaky webhook.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    console.error('[capture] GHL webhook failed:', err);
  } finally {
    clearTimeout(timeout);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let data: CapturePayload;
  try {
    data = (await request.json()) as CapturePayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawEmail =
    typeof data.email === 'string' ? data.email.trim().slice(0, 254) : '';
  const name =
    typeof data.name === 'string' ? data.name.trim().slice(0, 120) : '';
  const source =
    typeof data.source === 'string' ? data.source.slice(0, 60) : 'unknown';

  // Decision-board submissions are self-attributing — synthesize an email
  // if one wasn't provided so KV writes still succeed.
  const email =
    rawEmail ||
    (source === DECISION_BOARD_SOURCE ? DECISION_BOARD_DEFAULT_EMAIL : '');

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const quiz: Partial<CapturePayload> = {};
  if (
    typeof data.quizNodeId === 'number' &&
    data.quizNodeId >= 1 &&
    data.quizNodeId <= 13
  ) {
    quiz.quizNodeId = data.quizNodeId;
  }
  if (
    typeof data.quizPreviewNodeId === 'number' &&
    data.quizPreviewNodeId >= 1 &&
    data.quizPreviewNodeId <= 13
  ) {
    quiz.quizPreviewNodeId = data.quizPreviewNodeId;
  }
  if (typeof data.quizScore === 'number' && Number.isFinite(data.quizScore)) {
    quiz.quizScore = Math.max(0, Math.min(100, data.quizScore));
  }
  if (typeof data.quizPath === 'string')
    quiz.quizPath = data.quizPath.slice(0, 200);
  if (typeof data.selectedPillar === 'string')
    quiz.selectedPillar = data.selectedPillar.slice(0, 60);
  if (
    data.selectedPhase === 'INITIATE' ||
    data.selectedPhase === 'INTEGRATE' ||
    data.selectedPhase === 'ACTIVATE'
  ) {
    quiz.selectedPhase = data.selectedPhase;
  }

  const decision: Partial<CapturePayload> = {};
  if (source === DECISION_BOARD_SOURCE) {
    if (typeof data.decisionId === 'string')
      decision.decisionId = data.decisionId.slice(0, 80);
    if (typeof data.chosenOptionLabel === 'string')
      decision.chosenOptionLabel = data.chosenOptionLabel.slice(0, 120);
    if (typeof data.chosenOptionRecommended === 'boolean')
      decision.chosenOptionRecommended = data.chosenOptionRecommended;
    if (typeof data.studioSuggestion === 'string')
      decision.studioSuggestion = data.studioSuggestion.slice(0, 1000);
    if (typeof data.decisionCategory === 'string')
      decision.decisionCategory = data.decisionCategory.slice(0, 40);
    if (typeof data.decisionOwner === 'string')
      decision.decisionOwner = data.decisionOwner.slice(0, 40);
  }

  const offer: Partial<CapturePayload> = {};
  if (source === DP_SIGNUP_SOURCE) {
    if (typeof data.offerId === 'string')
      offer.offerId = data.offerId.slice(0, 80);
    if (
      typeof data.offerAmountUsd === 'number' &&
      Number.isFinite(data.offerAmountUsd)
    ) {
      offer.offerAmountUsd = Math.max(0, Math.min(100000, data.offerAmountUsd));
    }
    if (
      data.paymentRail === 'undecided' ||
      data.paymentRail === 'stripe' ||
      data.paymentRail === 'ghl'
    ) {
      offer.paymentRail = data.paymentRail;
    }
    if (typeof data.checkoutEnabled === 'boolean') {
      offer.checkoutEnabled = data.checkoutEnabled;
    }
  }

  const plan: Partial<CapturePayload> = {};
  if (source === GATEWAY_PERSONALIZED_PLAN_SOURCE) {
    // Free-text location (ZIP or street address) for admin's manual EWG
    // lookup. Capped, but not de-identified the way `ipHint` is — the
    // visitor volunteered it precisely so a plan can be mailed back.
    const address =
      typeof data.address === 'string' ? data.address.trim().slice(0, 200) : '';
    // Only attach when present — the email alone is enough to start the
    // conversation, and an empty `address` would just clutter KV.
    if (address) plan.address = address;
  }

  const nonprofit: Partial<CapturePayload> = {};
  if (source === NONPROFIT_ARM_SOURCE) {
    if (
      data.nonprofitPath === 'donor' ||
      data.nonprofitPath === 'host' ||
      data.nonprofitPath === 'volunteer' ||
      data.nonprofitPath === 'reset-candidate'
    ) {
      nonprofit.nonprofitPath = data.nonprofitPath;
    }
    if (
      typeof data.donationIntentUsd === 'number' &&
      Number.isFinite(data.donationIntentUsd)
    ) {
      nonprofit.donationIntentUsd = Math.max(
        0,
        Math.min(100000, data.donationIntentUsd),
      );
    }
    if (
      data.donationRailStatus === 'held' ||
      data.donationRailStatus === 'ready'
    ) {
      nonprofit.donationRailStatus = data.donationRailStatus;
    }
    if (
      typeof data.resetDurationDays === 'number' &&
      Number.isFinite(data.resetDurationDays)
    ) {
      nonprofit.resetDurationDays = Math.max(
        1,
        Math.min(180, Math.round(data.resetDurationDays)),
      );
    }
    if (typeof data.instagramHandle === 'string') {
      nonprofit.instagramHandle = data.instagramHandle.trim().slice(0, 80);
    }
    if (typeof data.supportNote === 'string') {
      nonprofit.supportNote = data.supportNote.trim().slice(0, 1200);
    }
  }

  const enriched = {
    email,
    name,
    source,
    ...quiz,
    ...decision,
    ...offer,
    ...plan,
    ...nonprofit,
    receivedAt: new Date().toISOString(),
    ipHint: ipHintFromHeaders(request.headers),
  };

  const env = bindings();

  // Per-IP throttle: reject bursts before fanning out to KV/GHL. The
  // always-200 success contract still holds for every non-throttled valid
  // email; only a request that has exceeded the window gets a 429.
  if (await isRateLimited(env, request.headers)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await Promise.all([persistToKv(env, enriched), dispatchToGhl(env, enriched)]);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
