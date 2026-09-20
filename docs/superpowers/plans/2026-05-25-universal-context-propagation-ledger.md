# Universal-Context Propagation Ledger — 2026-05-25 session

**Why this file exists:** this session ran in a container holding ONLY
`sovereign-systems--spiral-template`. The universal work registry
(`meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`) and
the `organvm` CLI are NOT reachable here, so the IRF + 10-index propagation could
not be performed. This ledger captures the exact payload so a workspace-meta
session can apply it — the "log the vacuum so nothing is lost" recovery. All
work below is already committed + pushed to this repo's `main` (1:1 parity).

## What shipped to `origin/main` this session (`93f83fe`..`81b8114`)

- **Astro 5→6 migration** (`dfbb08e`,`63723d9`): astro ^6, `@astrojs/cloudflare`
  13, `@astrojs/markdoc` 1.x, `wrangler` peer, Keystatic→Pages CMS; `npm audit`
  12→0; vite deduped (cloudflare v13 build crash). Canonical docs updated
  (`93f83fe`).
- **v13 regression fixes**: `/capture` 500→200 via `cloudflare:workers` env
  (`6e09e12`); `/library` 404→render via build-manifest (`def6f50`); IMAGES/SESSION
  binding defaults dropped + session factory + Node≥22.18 engine
  (`def6f50`,`f1536f9`,`35a547c`).
- **Hygiene/docs** (`02dc2a1`,`17158f8`,`81b8114`): CI Node-24 bump merged (#106);
  analytics beacon gated on token; stale KEYSTATIC env ref removed; migration
  scope, roadmap, and free/paid-boundary proposal docs; admin outbound draft.

## IRF propagation (apply from workspace-meta)

- **Move to `## Completed`:** the Astro-6 / dependabot major-bump item (maps to
  GH#94, now resolved) and the Keystatic-handover item (maps to GH#1, obsolete).
- **Add new items** (discovered this session — file with proper IRF-XXX-NNN IDs):
  - Free/email-gated/paid boundary decision (GH#7) — keystone; proposal at
    `docs/design-proposals/2026-05-25-free-paid-boundary-proposal.md`.
  - Roadmap tracks scoped at
    `docs/superpowers/plans/2026-05-25-outstanding-roadmap-and-product-scope.md`.
  - Audit findings (GH#112) needing triage: hardcoded personal email in
    `decisions.astro:27` (PII + M2 vacuum), unescaped citation-tooltip `innerHTML`
    in `Base.astro:671` (XSS sink, studio-data), `VideoEmbed` iframe hardening,
    `: any` policy erosion, spiral teardown wired to a never-firing event.
- **Update stats:** decrement open by the items moved to Completed.

## 10-index propagation checklist

- **GitHub issues** — #94 (resolved), #1 (obsolete): close via
  `scripts/transition-issue.sh <n> --status DONE` (needs `gh`; not runnable here).
  Resolution comments already posted. #106 merged. #103/#105/#112 open (owner's
  call).
- **seed.yaml** — APPLICABLE: tech stack changed (Astro 5→6, Keystatic→Pages CMS,
  added wrangler/prettier). Update the stack metadata + `Last synced`.
- **CLAUDE.md / AGENTS.md / README / GEMINI** — DONE in-repo (`93f83fe`,`02dc2a1`).
- **omega scorecard** — APPLICABLE if migration/security completion is scored;
  reflect `npm audit` 12→0 + Astro 6.
- **concordance** — N/A (no new ID type introduced).
- **inquiry-log.yaml** — N/A (no SGO work this session).
- **INST-INDEX-LOCORUM / INST-INDEX-NOMINUM** — APPLICABLE if new doc artifacts
  (this ledger, the roadmap, the proposals) are indexed by locus/name.

## Vacuums logged (Constitutional Axiom #1)

- `decisions.astro:27` personal email — a hardcoded-dynamic-data vacuum (M2);
  needs an env var (`DECISIONS_NOTIFY_EMAIL`) — value is the owner's call.
- Pending client-gated vacuums unchanged: GH#58 (quizFormUrl), GH#49 (Anespa/K8
  affiliate URLs) — still TRACKED in `vacuum-gate.mjs`.

## Triple-reference status

New work items are at 1/3–2/3 (GH issue and/or doc present; `W-###` + IRF entries
to be filed from workspace-meta when pulled into a build cycle).
