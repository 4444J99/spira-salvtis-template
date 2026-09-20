# SOP-SS-QAB-001_001-project-board-qa

**Title:** Project Board Quality Assurance
**Domain:** Sovereign Systems Governance
**Ordinal:** 001
**Version:** 003
**Status:** ACTIVE
**Created:** 2026-04-04
**Updated:** 2026-04-04
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Define QA rituals for the GitHub Project Board. The board is the **single source of truth** for all issue metadata. Local tracking and IRF are derived views, not independent records.

## Authority Model

```
GitHub Project Board (#5)  ← THE canonical record
       │
       ├── written by → scripts/transition-issue.sh (the gatekeeper)
       ├── audited by → scripts/audit-board.sh (the drift detector)
       ├── generates → SOP-SS-TRK-001 tracking table (via sync-tracking-table.sh)
       ├── referenced by → spec files (docs/superpowers/specs/)
       └── referenced by → IRF entries (pointers only)
```

**No direct writes to the record.** All state changes flow through the transition script.

### Write Discipline

1. **No direct board edits.** Do not open the GitHub board UI and change a field manually.
2. **Two valid write paths:**
   - **Transition:** `bash scripts/transition-issue.sh <issue#> --status <STATUS> --reason "why"` — validates the transition is legal, writes to the board, logs to the audit trail.
   - **Field update:** `bash scripts/transition-issue.sh <issue#> --field <FIELD> --value <VALUE>` — sets a field value and logs the change.
3. **Audit log** (`docs/audit/transitions.log`) is append-only. Every accepted and rejected transition is recorded with timestamp and reason.
4. **Drift detection:** `bash scripts/audit-board.sh` compares expected state (from audit log) against live board state. Any discrepancy means someone edited the board directly.

### Unique ID

- The GitHub issue number is the unique ID everywhere.
- Board fields (Phase, Issue Type, Status, Priority, Gate Met, Next Action, External Party) are the metadata.
- The local tracking table is regenerated, never hand-edited.
- IRF entries are pointers (`See organvm-iii-ergon#N`), not metadata copies.

## Scope

- **Canonical:** GitHub Project Board [organvm-iii-ergon/projects/5](https://github.com/orgs/organvm-iii-ergon/projects/5)
- **Derived:** `docs/sops/SOP-SS-TRK-001_001-ontology_issue_tracking.md` (auto-generated)
- **Referenced:** `meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md` (pointers)
- **Linked:** Spec files in `docs/superpowers/specs/` (bidirectional via issue body)

## Rituals

### 1. Pre-Close Audit (Every Session)

Before closing a session, the agent MUST:

1. **Issue Coverage**: Every new finding that implies work must have a GitHub Issue on the board with all required fields filled:
   - Phase (α/β/γ/ω/IRF)
   - Issue Type (DECISION/WORK/BLOCKER)
   - Status (GATED/SPEC/WIP/DONE/CLOSED)
   - Priority (P0-P3)
   - Next Action (concrete next step)
   - External Party (if GATED — who is it waiting on?)

2. **Spec Linkage**: Every issue on the board has a corresponding spec file in `docs/superpowers/specs/`. Issue body links to the spec.

3. **Run Audit**:
   ```bash
   bash scripts/audit-board.sh
   ```
   Fix any drift or missing fields via `transition-issue.sh`.

4. **Regenerate Tracking Table**:
   ```bash
   bash scripts/sync-tracking-table.sh --write
   ```

### 2. Weekly Sync (Weekly/Milestone)

1. **IRF Promotion**: Any P0/P1 item in the IRF for Organ III → create GitHub Issue on the board.
2. **IRF Pointer Update**: Any CLOSED issue on the board → ensure IRF has a pointer entry (`See organvm-iii-ergon#N`).
3. **Vacuum Check**: Identify any empty required fields on the board and fill them.
4. **Regenerate**: Run `sync-tracking-table.sh --write` after all updates.

## QA Checklists

### Board Completeness Check
- [ ] Every active issue has Phase, Issue Type, Status, Priority filled
- [ ] Every GATED issue has External Party and Next Action filled
- [ ] Every issue body links to its spec file
- [ ] No issue has Status = empty/unset
- [ ] Gate Met = Yes only for issues that have passed their gate criterion

### Spec Linkage Check
- [ ] Every issue on the board has a spec file in `docs/superpowers/specs/`
- [ ] Every spec file references its issue number
- [ ] No orphan specs (spec exists but issue was deleted/closed without CLOSED status)

### Derived View Check
- [ ] Run `bash scripts/sync-tracking-table.sh` (stdout) — output matches board state
- [ ] No hand-edits in SOP-SS-TRK-001 between the `GENERATED:START` and `GENERATED:END` markers

## Corrective Actions

- **Missing board field**: Fill it on the board directly. Regenerate tracking table.
- **Missing spec file**: Create spec using SOP-SS-ISS-001 process. Link from issue body.
- **Missing GitHub issue for known work**: Create issue on the board with all required fields.
- **Stale IRF entry**: Update IRF pointer to reference the canonical GitHub issue.
- **Tracking table out of date**: Run `bash scripts/sync-tracking-table.sh --write`. Never hand-edit.

## Related SOPs

- SOP-SS-TRK-001_001-ontology_issue_tracking.md (derived view)
- SOP-SS-ISS-001-001-ontology-issue-specification.md (spec creation)
- SOP-SS-CLT-001_001-ontology_client_decisions.md (client gating)
- meta-organvm/INST-INDEX-RERUM-FACIENDARUM.md (cross-organ pointers)

---

**End of SOP**
