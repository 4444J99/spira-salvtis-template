# admin Asks — Stream A Close-Out (2026-04-29)

This memo consolidates every decision/answer needed from admin that surfaced during Stream A's "generative-maximalist" build of the spiral, quiz, nav, and capture infrastructure. Each item is **non-blocking** (the work shipped without it) — admin's input promotes one variant to the build-time default or unlocks an optional sink.

All variants are **live now** at https://sovereign-systems-spiral.pages.dev (alias of latest deploy `https://efce9fbe.sovereign-systems-spiral.pages.dev`). Picking is done by visiting the URLs and feeling the difference.

---

## A) Spiral vessel mode — pick the default

Four modes are wired and reachable via querystring. Walk through each in order and pick the one that should ship as the homepage default:

| Mode | URL | What you'll see |
|---|---|---|
| invisible (current) | https://sovereign-systems-spiral.pages.dev/?vessel=invisible | Particle field is the icon; no outline mesh |
| visible | https://sovereign-systems-spiral.pages.dev/?vessel=visible | Solid icon shapes (texture-mapped) |
| refracted-star | https://sovereign-systems-spiral.pages.dev/?vessel=refracted-star | Prismatic refractive star geometry; glassy |
| hybrid | https://sovereign-systems-spiral.pages.dev/?vessel=hybrid | Solid icon outline + dimmed particle field inside |

**To promote your pick:** edit `src/data/hub.config.ts` line ~93 — change `ui.spiralVesselMode` to one of `'invisible' | 'visible' | 'refracted-star' | 'hybrid'`. The other three modes stay accessible via `?vessel=` after the change.

Closure tracker: IRF-III-033 / GH#57. Full design memo: `docs/proofs/spiral-vessel-variants/2026-04-29-IRF-III-033-comparison.md`.

---

## B) Nav variant — pick the default

| Variant | URL | What you'll see |
|---|---|---|
| pillar-first (current) | https://sovereign-systems-spiral.pages.dev/?nav=pillar-first | Gateway · System · Structure · Business · Research |
| spiral-first | https://sovereign-systems-spiral.pages.dev/?nav=spiral-first | Spiral · Elevate · Align · Unlock · Research |

Same item count (5). Different mental model: pillar-first foregrounds the 4-pillar structure; spiral-first foregrounds the 13-node phase journey. Mobile drawer mirrors the choice (spiral-first opens a phase-grouped list of all 13 nodes).

**To promote your pick:** edit `src/data/hub.config.ts` line ~98 — change `ui.navVariant` to `'pillar-first'` or `'spiral-first'`.

Closure tracker: IRF-III-032. Full memo: `docs/proofs/nav-variants/2026-04-29-IRF-III-032-comparison.md`.

---

## C) Quiz copy review

The new node-placement quiz at https://sovereign-systems-spiral.pages.dev/quiz works end-to-end (5 questions → result panel → optional capture). The 5 question prompts and their option phrasings are written in your voice (terse, frank, no apology), but you should review:

- Q1 "Where does your energy want to start?"
- Q2 "Which pillar feels most alive in you right now?"
- Q3 "What does your system most need right now?"
- Q4 "What feels foundational to address?"
- Q5 "Where do you sense your growth edge?"

Plus the result panel copy ("Your starting node: Node N — [name]" + "Why this node?" + CTA). Edits to copy are zero-risk — `src/pages/quiz.astro` is the file; tell us which phrasings to change and we ship.

Closure tracker: IRF-III-034 / GH#56. Full memo: `docs/proofs/quiz-flow/2026-04-29-IRF-III-034-comparison.md`.

---

## D) GoHighLevel webhook (when ready)

The capture endpoint at `/capture` works without GHL — the quiz currently captures to nothing-durable in production (until KV is bound, see E below). When you finalize the GHL form/webhook URL, set it as a Cloudflare Pages env var:

- Cloudflare dashboard → Workers & Pages → `sovereign-systems-spiral` → Settings → Environment variables → Production → Add `GHL_WEBHOOK_URL` = your URL
- No code change needed; the next deploy will route quiz + email-gate submissions to GHL automatically

---

## E) KV namespace for durable submission storage

To persist quiz/email submissions independently of GHL, provision Cloudflare KV:

- Cloudflare dashboard → Workers & Pages → Storage → KV → Create namespace named `sovereign-systems-submissions`
- Bind to the `sovereign-systems-spiral` Pages project: Settings → Bindings → KV namespace → variable name `SUBMISSIONS`

Once bound, every `/capture` POST will store the full payload under key `submission:{ISO timestamp}:{random base36}`. Until then, the multi-sink dispatch logs a one-line warning per submission and skips persistence (UX is unaffected).

---

## F) Custom domain `hub-example.com`

Memory says this is one CF dashboard action away (Cloudflare → Pages → `sovereign-systems-spiral` → Custom Domains → Add `hub-example.com`, follow DNS instructions). When connected, all the above URLs work at the hub-example.com origin.

---

## G) CI deploy auth recovery (GH#52, separate vacuum)

The auto-deploy workflow has been broken since 2026-04-19 (CF API token expired). I have been deploying via local `wrangler pages deploy dist` (the `npm run deploy` script), which works but is manual.

To restore auto-deploys on push:

1. Cloudflare dashboard → My Profile → API Tokens → Create Token
   - Permissions: Account > Cloudflare Pages > Edit
   - Account: your Cloudflare account
   - TTL: never expire (recommended) or longest you'll tolerate
2. `gh secret set CLOUDFLARE_API_TOKEN -R organvm-iii-ergon/sovereign-systems--spiral-template` and paste the new token

Next push to `main` will trigger CI build + auto-deploy. Until then, every change ships via local `npm run deploy`.

---

## H) Gateway affiliate URLs (verify)

Three gateway-filter recommendations now route to live affiliate links per `src/data/gateway.config.ts`:

- IonFaucet → `https://ionfaucet.com/admin-spiral`
- Multipure → `https://www.multipure.com/admin-wired`
- PureHome → `https://purehome.co/admin`

These look like real admin-tagged affiliate paths. Confirm they're correct (or supply replacements) and we're done.

---

## I) Untracked client docs in `docs/`

Five untracked client-deliverable files exist locally but were not committed pending your confidentiality review:

- `docs/client-deliverables/2026-04-27-revenue-agreement-final.md`
- `docs/client-orchestration-showcase.md`
- `docs/reports/2026-04-27-admin-case-study.md`
- `docs/reports/2026-04-27-admin-launch-checklist.md`
- `docs/reports/2026-04-27-prompt-atom-registry.md`

Tell us which (if any) are safe to commit to the public repo, vs. which need to move to a private location.

---

## What's already shipped (no admin input needed)

| Closure | Tracker | Status |
|---|---|---|
| Working-tree hygiene (10 atomic commits, .gitignore) | — | ✅ shipped |
| Proof scaffold (`docs/proofs/`) | — | ✅ shipped |
| Vessel mode wire-through (4 modes accessible) | IRF-III-033 GH#57 / DONE-504 | ✅ shipped |
| Quiz redesign + multi-sink capture | IRF-III-034 GH#56 / DONE-505 | ✅ shipped |
| Dual nav variants | IRF-III-032 / DONE-506 | ✅ shipped |
| Live deploy verified | docs/proofs/2026-04-29-stream-a-deploy-diff.md | ✅ shipped |

The Reconciliation Gate (Stream H) will independently verify each closure against the proof artifacts and DONE counter increments. No further code change is needed from this stream until you weigh in on items A–I above.
