# Debt-Clearance Ledger — 2026-06-05

Full-corpus completion sweep: every open issue re-verified against current
code, every 4jp directive and every historical admin message reviewed for
unfulfilled asks, every code-fixable item fixed. This ledger is the single
answer to "what is done, what remains, and why."

Method: audit fan-out (5 issue-verifier batches + adversarial re-check of
every close-candidate + 4 corpus sweeps) → 6-cluster implementation →
single verification gate. PR #208.

2026-06-19 update: #207 is no longer client-gated. The repo-local best
hypothesis was accepted and fixed defensively in `/quiz`: selected-answer
retaps now deselect, cancel pending auto-advance, and cannot expose the
result/email capture panel until every quiz step is answered. Closure proof:
`docs/proofs/quiz-flow/2026-06-19-GH207-deselect-guard.md`.

## 1. Completed this sweep

### Code fixes (PR #208 — 38 issues)

| Cluster | Issues fixed |
| --- | --- |
| Spiral renderer | #127 #128 #129 #144 #146 #147 #148 #149 #150 #151 #152 |
| Components/layout | #124 #125 #132 #145 #154 #155 #157 #163 #175 |
| Data/config | #126 #131 #138 #139 #140 #141 #143 #156 #158 #159 #160 #162 |
| Pages/API | #133 #137 #168 (all 9 sub-items) |
| Scripts/infra | #134 #135, markdoc dead-dep removal |
| Docs/critique | #136 (fresh manifest), #184 write-up half |

Highlights: honest email gate (gated content no longer ships in initial
HTML), citation-tooltip XSS sink removed, /capture rate-limited, personal
email PII removed from /decisions, vacuum gate hardened to import real
modules, `/nodes/5` ghost route eliminated, zero explicit `any` remaining.

### Stale issues closed with evidence (premise-false / already-fixed)

- #130 (MAX_SCORE reachable), #153 (?nav=/?variant= docs fixed), #94
  (Astro 6 migration already shipped the demanded bumps) — closed.
- #142 (capture source registry documented) and #161 (no hardcoded
  accountId remains) — closed with evidence after explicit per-session
  authorization, same day. _(An earlier revision of this ledger carried
  paste-ready commands for these; they were executed.)_
- #113 (the audit parent tracker) — closed once all 40 sub-issues
  (#124–#163) resolved: 36 fixed in PR #208, 4 premise-false/already-fixed.

### Triangulation issues filed

- #206 — D-005 node→pillar mapping discrepancy (locked-arch vs code)
- #207 — admin's 2026-05-16 "deselect → email" bug-report loop
- #209 — site + branches conversion audit (her 2026-05-25 ask, studio-owed)
- #210 — W-032 $99 DP sign-up flow (blocked on the payment-rail decision)
- #211 — GHL_WEBHOOK_URL Worker secret wiring (client-gated on her URL)

### Docs truth-reconciliation

GEMINI.md (was claiming Netlify AND Cloudflare Pages), CLAUDE.md page map
(+ /spiral, 19 files), AGENTS.md (markdoc), pragma.md, ROADMAP.md,
PROJECT-MAP.md, README LOC — all reconciled to disk reality.

## 2. Remaining open — strictly gated, nothing silently hanging

### Client-gated (the ball is in admin's court — one consolidated ask)

See `docs/admin/2026-06-05-final-pending-inputs.md` (iMessage-ready).

| Issue | Needs from admin |
| --- | --- |
| #62 (P0) | Fluoride repro: badge state ("Sample Data" vs ZIP) + her ZIP |
| #49 | Affiliate confirms: Multipure link choice, Anespa keep/drop, K8 page, Coldstream |
| #63 | Real bottle prices (per bottle / case / size) |
| #64 | Her bottled-water brand notes (M1 dual-citation gated) |
| #58 | GHL quiz form URL — or confirm built-in quiz stays |
| #61 | Visual check: do the 13 nodes read as distinct |
| #51 | CF Web Analytics token (code already wired in Base.astro) |
| #3 | DNS CNAME step for hub-example.com (then studio connects CF) |
| — | GHL webhook URL (optional; capture sink is code-complete) |
| — | Catch-up call: pick a time |

### Needs a 4jp decision (not client, not code)

- **Payment rail** — Stripe vs GHL (MD-5); blocks #38 subscriptions and the
  W-032 $99 DP flow.
- **#206** — D-005 mapping discrepancy: codify code reality vs change code
  vs ask admin.
- **Conversion-audit timing** — baseline now vs after her pages are dialed
  in (committed in the 2026-06-03 outbound; now tracked as #209).

### Intentional roadmap (open by design, not debt)

Issues #65, #98, #99, issue #100, #38, #39, #10, #19, #20, and #184
(post-feedback tuning on her decision-card responses). #113 closed —
see above.

### Cross-stream (not this repo)

AI-dashboard commitment (2026-06-03 outbound) — lives in the multi-client
orchestration stream (`.private/` boundary); track there, not here.

## 3. Corpus-sweep verdicts (the "review everything" result)

- **admin messages** (all 10 iMessage PDF threads, both ChatGPT exports,
  intent register, hold-messages, all outbound drafts): ~95% pre-captured
  finding holds; residue = the items above. The 2026-05-16 content-leak
  HOLD was confirmed released (CLEAR).
- **4jp prompts** (all plans, handoffs, intakes, strikes, timelines,
  3 memory scopes): spiral-rebuild directive fully shipped (PR #205);
  prod-SSR migration resolved and live; hover-names (#1 ask) shipped;
  residue = payment-rail decision + the conversion audit above.
- **Untracked debt**: repo verified clean of TODO/FIXME/dead modules
  beyond items fixed in PR #208; `.config/netlify.toml` intentionally
  retained as documented legacy.
