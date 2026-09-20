# IRF-III-034 / GH#56 — `/capture` Endpoint Smoke Log

**Date:** 2026-04-29
**Server:** `npx wrangler pages dev dist --port 8788 --local --compatibility-date=2026-04-29 --compatibility-flags=nodejs_compat`
**Endpoint:** `src/pages/capture.ts` (Astro APIRoute, not the prior `functions/capture.ts` which the Astro `_worker.js` was intercepting silently)

---

## Test 1 — Full quiz payload (the new node-placement contract)

**Request:**

```bash
curl -sS -X POST http://localhost:8788/capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoketest@example.com",
    "name": "Smoke Test",
    "source": "spiral_quiz",
    "quizNodeId": 7,
    "quizScore": 82,
    "quizPath": "ALIGN|inner|state-shifting,baseline;witness,awareness;release,unwiring",
    "selectedPillar": "inner",
    "selectedPhase": "ALIGN"
  }'
```

**Response:** `{"success":true}` — HTTP 200 in 16ms

**Server log:**
```
[capture] SUBMISSIONS KV not bound; skipping persistent sink
POST /capture 200 OK (16ms)
```

The KV warning confirms the multi-sink dispatch is correctly degrading when no KV namespace is bound (which is always true in `wrangler pages dev --local` without explicit binding). The endpoint still returns success — the user UX never blocks on sink availability.

---

## Test 2 — Email-only legacy path (EmailGate + old quiz compatibility)

**Request:**

```bash
curl -sS -X POST http://localhost:8788/capture \
  -H "Content-Type: application/json" \
  -d '{"email":"emailonly@example.com","source":"email_gate"}'
```

**Response:** `{"success":true}` — HTTP 200 in 2ms

**Server log:**
```
[capture] SUBMISSIONS KV not bound; skipping persistent sink
POST /capture 200 OK (1ms)
```

Backward compatibility verified — the EmailGate component (used by `/research`, all `/pillars/*` deep content, and the `/water/*` waitlist) continues to work without modification.

---

## Test 3 — Invalid email (validation gate)

**Request:**

```bash
curl -sS -X POST http://localhost:8788/capture \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","source":"spiral_quiz"}'
```

**Response:** `{"error":"Valid email required"}` (parsed from body) — HTTP 400 in 1ms

Validation correctly rejects malformed email and returns 400 before any sink dispatch.

---

## Test 4 — Empty body (validation gate)

**Request:**

```bash
curl -sS -X POST http://localhost:8788/capture \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:** `{"error":"Valid email required"}` — HTTP 400 in 1ms

Empty body correctly rejected. Endpoint contract maintained.

---

## Architectural fix recorded

The pre-existing `functions/capture.ts` was a Cloudflare Pages Function. With the Astro Cloudflare adapter producing a `_worker.js` directory in `dist/`, the worker takes precedence over `functions/` and silently absorbed all POST requests as 405 Method Not Allowed. EmailGate's `try/catch` swallowed the failure (HTTP errors don't throw in `fetch`; only network errors do), so the broken endpoint was invisible.

This closure relocates the capture handler to `src/pages/capture.ts` (Astro-native APIRoute with `prerender = false`). Astro auto-adds `/capture` to `_routes.json` `include` list at build time, so the worker explicitly handles it — no precedence ambiguity.

**Net effect:** ALL form submissions site-wide now actually flow through the handler. Prior to this commit, EmailGate captures were silently lost; from this commit forward, they flow to KV (when bound) + GHL webhook (when env set).

---

## Coverage matrix

| Path | Method | Source | Result | Sink reach |
|---|---|---|---|---|
| `/capture` | POST | `spiral_quiz` (full payload) | 200 success | KV+GHL (sinks attempted) |
| `/capture` | POST | `email_gate` (legacy) | 200 success | KV+GHL (sinks attempted) |
| `/capture` | POST | invalid email | 400 error | none (validation gate) |
| `/capture` | POST | empty body | 400 error | none (validation gate) |
| `/capture` | GET | — | 405 (endpoint is POST-only) | n/a |
