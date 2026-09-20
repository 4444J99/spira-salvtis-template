# HANDOFF — sovereign-systems--spiral-template

**Last update:** 2026-04-26
**Last commit:** `66a6f0b` — V8: unique universes via lineage × lenses × math
**Live:** https://sovereign-systems-spiral.pages.dev/ (V8: unique universes, lineage-driven planets, creation/destruction physics)
**Review Surface:** https://symbolistical-amiya-mitigable.ngrok-free.dev/ (current review while CI is broken)
**Custom domain:** `hub-example.com` — NOT yet pointed (GoDaddy parking)
**Working tree:** clean

## Quick orientation for next session

Five work groups below, each self-contained. Pick whichever has its trigger satisfied. Paste the **Relay** block of a group into a fresh session to start that work cold.

| # | Group | Status | Trigger |
|---|-------|--------|---------|
| 1 | V4/V8 Unique Universes | DONE | V8 shipped: lineage × lenses × math, planets active |
| 2 | Mobile Spiral Polish | DONE | Completed in 90bc2b4 |
| 3 | CI Auto-Deploy Unblock (GH#52) | BLOCKED | Anthony rotates `CLOUDFLARE_API_TOKEN` |
| 4 | Custom Domain Go-Live (GH#3) | BLOCKED | admin/Anthony coordinate DNS |
| 5 | Filter Affiliate Flow (GH#49) | BLOCKED | admin sends water-filter info |

Recent shipping context (most recent first):
- `66a6f0b` — V8: unique universes via lineage × lenses × math. Planets re-enabled (2-6 per node), per-planet lineage RNG (lineageHash from nodeId+phase+pillarSlug+planetIdx+loadSalt), lens-driven icon geometry (primaryLensForNode from 7-tradition sequence), creation/destruction duality (isCreationMateria: emissiveMul/sizeMul > 1.0 = creation; gas/organic physics exceptions), all orbits show visible trails.
- `671818b` — V7: Proposal C — mathematical primitives generative geometry. 13 primitives (sacred-geometry-primitives.ts) + 7 lens modulations (lens-geometry.ts) wired into spiral render loop.
- `90bc2b4` — feat(spiral): wire ICON_WORLDS into phase physics (Commit 5 & 6). Cohesion vs Chaos regimes drive particle field.
- `d380086` — `docs(design)`: Proposal A (13 sacred symbols) + Proposal B (generative) for V4 node shapes
- `845fcaf` — V3 fix: BG matches `--color-ocean-900`, helix compressed (HELIX_HEIGHT 14), camera (0,0,18), canvas `h-[calc(100vh-240px)]`
- `c7bca33` — handoff doc for V2/V3 internal context
- `02c90a2` — V2: chakra-colored 5-pt stars + round 2 lightening
- `cdd046e` — V1 (round 1 lightening — never deployed; CI broken since Apr 19)

Memory anchors:
- `~/.claude/projects/-Users-4jp/memory/project_artifact_spiral_admin.md` — current artifact state (V6).
- `~/.claude/projects/-Users-4jp/memory/project_artifact_naming_chains.md` — multi-lens substrate logic.

---

## Group 1 — V4 NODE SHAPES

**Status: DONE — Proposal C implemented (mathematical primitives generative)**

**Summary (2026-04-26):**
- Rejected: Proposal A (fixed sacred symbols) — "looks all the same"
- Rejected: Proposal B (random generative) — not mathematical enough
- Accepted: Proposal C — generative from mathematical primitives

**Design implemented:**
- Each node's identity = its envVar (PYR, SHATKONA, PADMA, etc.)
- Mathematical primitives: vertexCount, phi-scaling, symmetry types (radial, bilateral, crystalline, fractal), twist, depth
- NOT random: deterministic from the node's symbolic foundation
- "We need to break the ideals into their primitives and figure out the mathemogic"

**Files created:**
- `src/data/sacred-geometry-primitives.ts` — 13 primitives with math properties
- `src/data/lens-geometry.ts` — 7 lens modulations (Egyptian, Sanskrit, Greek, Christian, Jungian, Physics, Modern)

**Wired into:** `spiral.ts:makeGeometryFromPrimitives()` called when `variant=symbols`

---

## Group 2 — MOBILE SPIRAL POLISH

Repo: ~/Workspace/organvm/sovereign-systems--spiral-template
Live: https://sovereign-systems-spiral.pages.dev/

Read first:
- docs/design-proposals/2026-04-25-node-shapes.md (full mapping + tradeoffs)
- ~/.claude/projects/-Users-4jp/memory/project_artifact_spiral_admin.md (artifact state)

admin's response: <PASTE WHAT SHE SAID>

Implementation entry points in src/components/spiral/spiral.ts:
- Replace makeStarGeometry (line 435) — for Proposal A: branch on nodeId, return per-node geometry. For Proposal B: parameterize by mulberry32(nodeId) seed. For hybrid: combine both.
- Geometry list for Proposal A: sunburst, eye-of-horus, yin-yang, upward-triangle, teardrop/wave, heart, crescent, hexagram, lotus, eye-in-triangle, equal-arm-cross, octahedron, ankh.
- Each shape is THREE.Shape + ExtrudeGeometry; some need bezier curves (heart, ankh, eye-in-triangle, lotus, yin-yang).
- nodes.forEach at spiral.ts:601 — already iterates with index i; pass i to a per-node geometry factory.
- Keep chakraColorForNode (line 467) — admin's color constraint stays.
- Keep emoji sprite overlay — node identity stays.

Verify:
- npm run build (no TS errors)
- npm run dev → localhost:4321 → drag spiral, confirm each node has distinct silhouette
- Visual: bottom-most node = root chakra red, top-most = crown violet
- Build size: keep under ~970 KiB (V3 baseline 958.44 KiB)

Deploy (CI auto-deploy still broken per GH#52, use local wrangler):
  wrangler pages deploy dist --project-name sovereign-systems-spiral --commit-dirty=true --branch=main

Then commit + push, send admin the live link.

Non-goals: don't propagate chakra colors to hub.config.ts / pillar pages / node detail pages — that's a separate brand-system pass.
~~~

---

## Group 2 — MOBILE SPIRAL POLISH

**Status: DONE** (Completed in `90bc2b4` with `cameraZForViewport` implementation).

**Summary:** camera Z distance now scales (12 for mobile, 18 for desktop) and updates on window resize, ensuring nodes remain legible on smaller viewports.

---

## Group 3 — CI AUTO-DEPLOY UNBLOCK (GH#52)

**Trigger:** Anthony rotates `CLOUDFLARE_API_TOKEN` in GitHub repo Settings → Secrets.

**Why this matters:** CI auto-deploy via `cloudflare/wrangler-action@v3` has been failing with `Authentication error [code: 10000]` since April 19. Every spiral push needs a manual `wrangler pages deploy dist --project-name sovereign-systems-spiral` locally. Until rotated, this is an ongoing tax on every iteration.

**Manual Rotation Steps:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token** -> Use **Edit Cloudflare Pages** template.
3. Permissions: `Account: Cloudflare Pages: Edit` and `Account: Account Settings: Read`.
4. Resources: `Include: All accounts` (or `ivviiviivvi`).
5. Copy the token and paste it into GitHub: `Settings > Secrets and variables > Actions > CLOUDFLARE_API_TOKEN`.

### Relay

~~~
Picking up GH#52 — CI auto-deploy unblock.

Repo: ~/Workspace/organvm/sovereign-systems--spiral-template (organvm-iii-ergon)

Confirm token rotation done (Anthony action):
  gh secret list -R organvm-iii-ergon/sovereign-systems--spiral-template
  Look for CLOUDFLARE_API_TOKEN with a recent 'Updated' timestamp.

Token requirements (rotate via Cloudflare dashboard → My Profile → API Tokens):
- Pages: Edit (write to sovereign-systems-spiral project)
- Account: Read (verify membership)
- Account ID: e0921b840fd656d8ea46426f1f114c30 (account name: ivviiviivvi)

Verify CI passes:
- Trigger an empty commit: git commit --allow-empty -m "chore: verify CI deploy"
- git push origin main
- gh run watch (latest run)
- On success, check: https://sovereign-systems-spiral.pages.dev/ updates

Close the loop:
- gh issue close 52 --comment "Token rotated; CI deploy passing as of <date>. Local wrangler workaround retired."
- Update memory: drop the "use local wrangler" note from project_artifact_spiral_admin.md

If still failing: check workflow file at .github/workflows/ci.yml — the wrangler step is the last in 'deploy' job. Check if wrangler-action@v3 is still on a supported version.
~~~

---

## Group 4 — CUSTOM DOMAIN GO-LIVE (GH#3)

**Trigger:** admin updates DNS at GoDaddy (her account) AND Anthony connects custom domain in Cloudflare Pages dashboard.

**Why this matters:** `hub-example.com` is the brand URL admin wants to share. Currently it points to GoDaddy parking. The live site is at `sovereign-systems-spiral.pages.dev`. The two-party action has been pending since project start.

### Relay

~~~
Picking up GH#3 — custom domain go-live for hub-example.com.

Repo: ~/Workspace/organvm/sovereign-systems--spiral-template
Live (current): https://sovereign-systems-spiral.pages.dev/
Target: https://hub-example.com

Read first:
- docs/domain-setup.md (if it exists — referenced in IRF-APP-033)

Two-party setup (does not need code changes):

admin (DNS at GoDaddy):
  Type: CNAME
  Name: @  (or 'hub-example.com' depending on registrar UI)
  Value: sovereign-systems-spiral.pages.dev
  TTL: default

  Or, if CNAME flattening isn't supported at apex, use A records to Cloudflare's IPs (CF Pages custom-domain wizard will display them).

Anthony (Cloudflare Pages):
  CF dashboard → Workers & Pages → sovereign-systems-spiral → Custom domains → Add custom domain → enter hub-example.com → follow wizard.
  CF will issue a Universal SSL cert automatically.

Verification:
  curl -sI https://hub-example.com/ | head -3
  Expect: HTTP/2 200, server: cloudflare

Then:
- Update CLAUDE.md project doc + seed.yaml (replace pages.dev URL where canonical)
- gh issue close 3 --comment "hub-example.com live as of <date>"
- Send admin a confirmation message that it's live

Secondary domains (deferred — same pattern when ready): water-example.com, business-example.com.
~~~

---

## Group 5 — FILTER AFFILIATE FLOW (GH#49)

**Trigger:** admin sends water-filter info ("filter info over to you this weekend if not today" — 2026-04-25 message thread).

**Why this matters:** This is the P0 revenue surface. The `/water/` funnel exists and routes to branch pages, but the affiliate URLs that monetize it are empty. Per IRF-APP-033 + the agreement, this is the 10%-of-water-sales-until-$10K pipeline. Every visitor who completes the funnel without these URLs is lost revenue.

### Relay

~~~
Picking up GH#49 — filter affiliate URLs for the /water/ revenue flow.

Repo: ~/Workspace/organvm/sovereign-systems--spiral-template

admin's filter info: <PASTE WHAT SHE SENT — affiliate vendor, URLs, tracking codes, product names>

Read first:
- src/data/hub.config.ts (single source of truth for pillar/branch/product config)
- src/content/branches/*.md (6 branch pages — gut-hormones, fertility, athletic, autoimmune, cancer-support, sustainability)
- src/pages/water/index.astro (Water hub funnel)
- src/pages/water/[slug].astro (branch deep-dives)
- functions/api/water-report.ts (EWG API proxy — for ZIP-based water-quality lookup that feeds filter recommendations)

Implementation approach:
1. Identify the affiliate URL field shape admin sent (one URL per filter? per branch? per ZIP-bucket?)
2. Add affiliate URLs to hub.config.ts as a structured field (e.g., per-branch product[] with affiliate_url, vendor, tracking)
3. Wire CTAs in water/[slug].astro and water/index.astro to point to the affiliate URLs
4. Add data-ea-* tracking attributes (per existing analytics pattern in V2)
5. If GHL routing is involved, double-check with src/pages/quiz.astro routing logic

Verify:
- npm run build clean
- Click each filter CTA in dev → routes to vendor with correct tracking
- analytics.ts utility fires the right event names

Deploy via local wrangler (CI still broken per GH#52 unless Group 3 completed first):
  wrangler pages deploy dist --project-name sovereign-systems-spiral --commit-dirty=true --branch=main

- gh issue close 49 --comment "Affiliate URLs populated; <vendor> live across <N> branches"
- Send admin confirmation with the live link
~~~

---

## Coordination notes

- **Independence:** Each group can advance without blocking others. Group 2 is the only one that's truly "ready right now" with no external dependency.
- **Sequencing preference:** If you can finish Group 3 before admin replies to Group 1, do — it removes the local-wrangler tax for every subsequent push.
- **Don't reduce scope:** Each of these has been on the open list. None is a nice-to-have. Keep them all on the board.
- **External-facing actions stay gated to Anthony:** any message to admin, any GH issue close, any DNS change. Code/docs/local builds are agent-fine.

---

## Process anchors

- All work in this repo: see `CLAUDE.md` at repo root for stack, commands, content directories.
- ORGAN-III conventions: see `~/Workspace/organvm-iii-ergon/CLAUDE.md`.
- Workspace-level conventions: see `~/Workspace/CLAUDE.md`.
- IRF (universal work registry): `~/Workspace/organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`.
- Done-ID counter (claim before assigning DONE-NNN): `~/Workspace/organvm/organvm-corpvs-testamentvm/data/done-id-counter.json`.
