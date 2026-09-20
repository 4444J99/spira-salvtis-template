# SOP-SS-TRK-001_001-ontology_issue_tracking

<!-- markdownlint-disable MD060 -->

**Title:** Issue Tracking Matrix
**Domain:** Sovereign Systems Issue Management
**Ordinal:** 001
**Version:** 002
**Status:** ACTIVE
**Created:** 2026-04-03
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Provide a single **read-only view** of project issue state. This table is **auto-generated** from the GitHub Project board (project #5), which is the single source of truth.

**Do not edit this table by hand.** Run `bash scripts/sync-tracking-table.sh --write` to regenerate.

## Authority Model

```
GitHub Project Board (#5)  ← EDIT HERE (via transition-issue.sh only)
       │
       ├── written by → scripts/transition-issue.sh (the gatekeeper)
       ├── audited by → scripts/audit-board.sh (the drift detector)
       ├── generates → this tracking table (read-only view)
       ├── referenced by → spec files in docs/superpowers/specs/
       └── referenced by → IRF entries (pointers, not copies)
```

- **Unique ID:** The GitHub issue number (e.g., #13). One number, one record, everywhere.
- **Config:** `board.config.json` — all instance-specific IDs. Scripts are the portable process.
- **Edit location:** Via `scripts/transition-issue.sh` only. This file is regenerated, never hand-edited.

## Tracking Table

<!-- GENERATED:START — do not edit below this line -->
| Issue # | Phase | Priority | Type | Status | Gate Met | Notes |
|---------|-------|----------|------|--------|----------|-------|
| #5 | α | P0-blocker | DECISION | GATED |  | NEXT SESSION: draft one-paragraph revenue confirmation ; Ext: admin |
| #13 | α | P0-blocker | DECISION | CLOSED | ✅ | Node architecture decision from admin (blocks #15, #8,; Ext: admin |
| #36 | α | P0-blocker | WORK | CLOSED |  | Closed; admin walkthrough delivered and row normalized |
| #49 | α | P0-blocker | BLOCKER | GATED |  | Populate approved Anespa/K8 affiliate URLs before reven; Ext: admin/4jp |
| #58 | α | P0-blocker | BLOCKER | GATED |  | Populate hub quizFormUrl before assessment funnel routi; Ext: admin/4jp |
| #3 | α | P1-high | DECISION | GATED |  | DNS access from admin/domain registrar; Ext: admin |
| #4 | α | P1-high | DECISION | CLOSED | ✅ | Complete — intake returned 2026-04-02 |
| #14 | α | P1-high | DECISION | GATED |  | Test video asset access links; Ext: admin |
| #38 | α | P1-high | WORK | GATED |  | Payment-rail decision required before subscription coll; Ext: admin/4jp |
| #206 | α | P2-medium | DECISION | GATED |  | Decision-card selection needed for node-to-pillar mappi; Ext: admin/4jp |
| #210 | α | P2-medium | WORK | GATED |  | Stripe-vs-GHL payment-rail decision required before $99; Ext: admin/4jp |
| #62 | β | P0-blocker | BLOCKER | GATED |  | admin sends water-report badge state plus ZIP; reprodu; Ext: admin |
| #6 | β | P1-high | WORK | CLOSED |  | Begin physical sovereignty node build |
| #8 | β | P1-high | WORK | CLOSED |  | Spiral interaction target (blocked by #13) |
| #9 | β | P1-high | WORK | CLOSED |  | Quiz routing + GHL integration (blocked by #14) |
| #15 | β | P1-high | WORK | CLOSED |  | Merge V5/V6 prototypes (blocked by #13) |
| #16 | β | P1-high | WORK | CLOSED |  | Editorial review of flagged Spiral claims |
| #23 | β | P1-high | WORK | CLOSED |  | Phase A static UI after #13 unlocks |
| #24 | β | P1-high | WORK | CLOSED |  | Add merge_group field to atom registry, begin grouping |
| #25 | β | P1-high | WORK | CLOSED |  | Review 104 FLAGGED atoms — verify/reframe/remove |
| #28 | β | P1-high | WORK | CLOSED |  | Closed; historical semantic clustering row normalized f |
| #29 | β | P1-high | WORK | CLOSED |  | Closed; historical EWG API row normalized for board par |
| #30 | β | P1-high | DECISION | GATED |  | admin decision needed on astrology/cycle/human-design ; Ext: admin |
| #7 | β | P2-medium | DECISION | GATED |  | Subscription boundary model decision; Ext: admin |
| #17 | β | P2-medium | DECISION | CLOSED |  | Water Hub placement decision from admin; Ext: admin |
| #18 | β | P2-medium | DECISION | GATED |  | Video hosting strategy decision; Ext: admin |
| #22 | β | P2-medium | WORK | CLOSED |  | Triage atoms into buckets |
| #26 | β | P2-medium | WORK | CLOSED |  | Route SCRIPT atoms to social calendar files |
| #27 | β | P2-medium | WORK | CLOSED |  | Closed; historical content enrichment row normalized fo |
| #31 | β | P2-medium | WORK | CLOSED |  | Closed; historical downloadable product pipeline row no |
| #32 | β | P2-medium | WORK | CLOSED |  | Closed; historical research integration row normalized  |
| #51 | β | P2-medium | WORK | GATED |  | Provision CF_ANALYTICS_TOKEN/analytics destination befo; Ext: 4jp |
| #61 | β | P2-medium | WORK | GATED |  | admin reviews A1 live spiral distinctness; then decide; Ext: admin |
| #63 | β | P2-medium | WORK | GATED |  | Land schema/externalization; wait for admin store pric; Ext: admin |
| #64 | β | P2-medium | WORK | GATED |  | admin/client approval on bottled-water claim set and c; Ext: admin |
| #184 | β | P2-medium | WORK | GATED |  | Post-feedback tuning only after admin responds to visu; Ext: admin |
| #211 | β | P2-medium | BLOCKER | GATED |  | Provision GHL_WEBHOOK_URL Worker secret before GHL lead; Ext: 4jp/admin |
| #65 | β | P3-backlog | WORK | GATED |  | After W-069 stabilizes, add water-personalized-plan cap; Ext: admin |
| #98 | β | P3-backlog | WORK | GATED |  | admin selects node-picker/admin direction before one-a; Ext: admin |
| #207 | β | P3-backlog | BLOCKER | GATED |  | Client reproduction details needed before changing quiz; Ext: admin |
| #10 | γ | P3-backlog | WORK | GATED |  | Store scaffold is live; product/pricing/payment-rail in; Ext: admin/4jp |
| #11 | γ | P3-backlog | WORK | CLOSED |  | Keystatic CMS setup |
| #19 | γ | P3-backlog | DECISION | GATED |  | Inner Child Book packaging decision; Ext: admin |
| #20 | γ | P3-backlog | DECISION | GATED |  | admin confirms creature-selves packaging/content scope; Ext: admin |
| #39 | γ | P3-backlog | DECISION | GATED |  | admin nonprofit/donation model decision required befor; Ext: admin |
| #100 | γ | P3-backlog | WORK | GATED |  | admin/nonprofit visual identity decision required befo; Ext: admin |
| #33 | ω | P1-high | WORK | CLOSED |  | Closed; board view creation row normalized for board pa |
| #35 | ω | P2-medium | WORK | CLOSED |  | Closed; CLAUDE.md vacuum refresh row normalized for boa |
| #12 | ω | P3-backlog | WORK | CLOSED | ✅ | Complete — citation corrected 2026-04-04 |
| #34 | ω | P3-backlog | WORK | CLOSED |  | Closed; source-bundle naming row normalized for board p |
| #1 | IRF | P3-backlog | WORK | CLOSED |  | Legacy IRF — Keystatic OAuth setup |
<!-- GENERATED:END -->

## Metrics

| Metric | Value |
|--------|-------|
| Total Issues | 51 |
| GATED | 26 |
| SPEC | 0 |
| WIP | 0 |
| DONE | 0 |
| CLOSED | 25 |

## Status Legend

| Status | Meaning |
|--------|---------|
| GATED | Waiting on external decision (client) |
| SPEC | Specification complete, ready for work |
| WIP | Work actively in progress |
| DONE | All work complete, awaiting gate verification |
| CLOSED | Gate met, issue resolved |

## Type Legend

| Type | Meaning |
|------|---------|
| DECISION | Requires external input before work |
| WORK | Can be executed once spec complete |
| BLOCKER | P0 item blocking multiple downstream |

## Phase Legend

| Phase | Description |
|-------|-------------|
| α | Blocking / foundational decisions |
| β | Core build / implementation |
| γ | Future-phase / deferred decisions |
| ω | Content fix / maintenance |
| IRF | Legacy IRF items |

## Blocking Issues

- #13 (node architecture): Blocks #15, #8, #6
- #5 (revenue): Blocks all revenue work
- #3 (domains): Blocks production deployment

## Update Protocol

All updates via gatekeeper. Then regenerate:

```bash
bash scripts/transition-issue.sh <issue#> --status <STATUS> --reason "why"
bash scripts/sync-tracking-table.sh --write
```

## Related SOPs

- SOP-SS-ISS-001_001-ontology_issue_specification.md
- SOP-SS-PRC-001_001-ontology_meta_process.md
- SOP-SS-CLT-001_001-ontology_client_decisions.md
- SOP-SS-QAB-001_001-project-board-qa.md

---

**Last Synced:** 2026-06-06T14:39:57Z
**Config:** `board.config.json`
**Generated by:** `scripts/sync-tracking-table.sh --write`
