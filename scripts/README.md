# scripts/

Build tools and governance scripts. All governance scripts are config-driven — they read from `.config/board.config.json`.

## Governance (portable across projects)

| Script | Role | Usage |
|--------|------|-------|
| `transition-issue.sh` | **Gatekeeper** — validates state transitions, writes to board, logs to audit trail | `bash scripts/transition-issue.sh 13 --status SPEC --reason "confirmed"` |
| `sync-tracking-table.sh` | **Materializer** — generates tracking table from board state | `bash scripts/sync-tracking-table.sh --write` |
| `audit-board.sh` | **Drift detector** — compares expected vs actual board state | `bash scripts/audit-board.sh --fix` |
| `detect-redundancy.sh` | **Analyst** — finds duplicate issues | `bash scripts/detect-redundancy.sh` |
| `setup-board.sh` | **Instantiator** — creates fields + prints view specs from config | `bash scripts/setup-board.sh --dry-run` |

## Content Genome

| Script | Purpose |
|--------|---------|
| `build-atom-registry.sh` | Parses ATM comment fences from extracted markdown, generates `atom-registry.yaml` |
| `link-atoms-to-issues.py` | Enriches registry with `github_issues` field — routes atoms to work items |
| `excavate-atoms.py` | Extracts atoms from raw source files |
| `grade-atoms.py` | Assigns SIGNAL/CONTEXT/NOISE tier |
| `build-content-units.py` | Groups atoms into deployable content units |
| `generate-coverage-strikes.py` | Generates coverage reports and strike plans |

## Other

| Script | Purpose |
|--------|---------|
| `generate-citations-json.js` | Converts citations.ts to JSON (prebuild step) |
| `parse-citations.js` | Citation parser utility |
| `count-files.cjs` | File counting for system variables |
| `atomize-mindset.py` | Legacy mindset-domain atomizer |

## Config

All governance scripts read from `.config/board.config.json`. Override with `BOARD_CONFIG` env var:

```bash
BOARD_CONFIG=/path/to/other/board.config.json bash scripts/audit-board.sh
```
