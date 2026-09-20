# SOP Registry — Sovereign Systems

| ID | Title | Domain | Version | Status | Created |
|----|-------|--------|---------|--------|---------|
| SOP-SS-CLT-001 | Client Decision Tracker | Client Management | 001 | ACTIVE | 2026-04-03 |
| SOP-SS-ISS-001 | Issue Specification Ontology | Issue Management | 001 | ACTIVE | 2026-04-03 |
| SOP-SS-PRC-001 | Meta-Process: SOP Creation | Process Engineering | 001 | ACTIVE | 2026-04-03 |
| SOP-SS-TRK-001 | Issue Tracking Matrix (auto-generated) | Issue Management | 002 | ACTIVE | 2026-04-03 |
| SOP-SS-QAB-001 | Project Board Quality Assurance | Governance | 002 | ACTIVE | 2026-04-04 |
| SOP-SS-CNT-001 | Content Extraction & Node Injection | Content Operations | 001 | ACTIVE | 2026-04-03 |
| SOP-SS-ATM-001 | Atomic Decomposition & Coverage Proof | Content Analysis | 001 | ACTIVE | 2026-04-03 |
| SOP-SS-REV-001 | Evaluation-to-Growth Review Chain | Review and Refinement | 001 | ACTIVE | 2026-04-30 |

## ID Schema

`SOP-SS-{DOMAIN}-{SEQ}_{VER}`

| Prefix | Domain |
|--------|--------|
| CLT | Client Management |
| ISS | Issue Management |
| PRC | Process Engineering |
| TRK | Issue Tracking |
| QAB | Quality Assurance / Board |
| CNT | Content Operations |
| ATM | Content Analysis |
| REV | Review and Refinement |

## Versioning

- Version increments on structural changes (new sections, modified process steps)
- Additive updates (change log entries, related SOP links) do not increment version
- Superseded versions archived to `docs/sops/archive/`

## Authority Model (2026-04-04)

GitHub Project Board (#5) is the **single source of truth** for all issue metadata.
SOP-SS-TRK-001 is auto-generated from the board via `scripts/sync-tracking-table.sh`.
IRF entries are pointers, not copies. See SOP-SS-QAB-001 for the full authority model.

**Last Updated:** 2026-04-30
