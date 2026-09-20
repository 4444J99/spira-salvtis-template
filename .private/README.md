# `.private/` — Local-Only Cross-Client Artifacts

This directory is **gitignored** (see root `.gitignore`).

## Purpose

Holds artifacts that satisfy two competing constraints:

1. **Local persistence required** — the 1:1 "soul persists" rule means anything generated must survive disk failure, so it can't simply live in `/tmp`.
2. **Public-history exclusion required** — the artifact references cross-client IP, pre-publication client material, or studio-internal capability decks that don't belong in this client's repo history.

The compromise: keep it on disk, never push it to remote.

## What lives here

- Multi-client capability showcases (e.g., parallel-lane orchestration decks naming clients other than this repo's owner)
- Pre-publication client deliverables awaiting client approval before commit
- Studio-internal notes that reference inter-client coordination

## What doesn't belong here

- This client's own deliverables (commit them — that's their IP)
- Generic studio process docs (commit them at studio level, not in a client repo)
- Anything intended to be shared with the client (use `docs/client-deliverables/`)

## Backup discipline

Because this directory is gitignored, it has zero remote parity. If your machine dies, this is gone. Mirror critical contents to a separate vault (1Password, encrypted external, studio-internal repo) when added.
