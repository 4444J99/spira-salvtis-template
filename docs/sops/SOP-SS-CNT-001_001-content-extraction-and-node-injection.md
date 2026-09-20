# SOP-SS-CNT-001_001: Content Extraction & Node Injection

**Title:** Content Extraction & Node Injection Pipeline
**Domain:** Sovereign Systems Content Operations
**Ordinal:** 001
**Version:** 001
**Status:** ACTIVE
**Created:** 2026-04-03
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Define a reproducible pipeline for receiving raw client content (Drive exports, iMessage threads, screenshots, text chains), archiving it to persistent storage, extracting it to structured Markdown, measuring it against the current build state, and injecting build-ready content into Astro content collections.

This SOP was generated during its first execution — the act of triaging produces the SOP for triaging.

## Scope

- Client content drops from any source (Google Drive, iMessage, email, screenshots)
- All file formats: .docx, .txt, .md, .png, .jpg, .pdf
- Content destined for `src/content/` Astro collections (branches, pillars)
- Excludes: code changes, configuration, infrastructure work

## Prerequisites

- `pandoc` installed (for .docx → Markdown conversion)
- Handoff document with file-by-file inventory (or create one during this process)
- Access to source files (local Download, Drive link, or forwarded messages)

---

## Phase 1: Archive

**Goal:** Move raw content from ephemeral locations to persistent project storage.

### Steps

1. Create `docs/archive/source-bundle/` if it doesn't exist
2. Copy ALL source files preserving directory structure:
   ```bash
   cp -R "<source-path>/"* docs/archive/source-bundle/
   ```
3. Archive any screenshots or iMessage images:
   ```bash
   for f in ~/Desktop/Screenshot*<date>*; do cp "$f" docs/archive/source-bundle/; done
   ```
4. Create/update `docs/archive/.gitignore` to exclude binaries:
   ```
   source-bundle/**/*.docx
   source-bundle/**/*.png
   source-bundle/**/*.jpg
   source-bundle/**/*.pdf
   source-bundle/**/*.zip
   ```
5. Verify file count matches expected:
   ```bash
   find docs/archive/source-bundle/ -type f | wc -l
   ```

### Output

- All raw files in `docs/archive/source-bundle/` (persistent, local)
- Binary files gitignored; text files tracked
- Count verification logged

### Quality Gate

- File count matches source count
- No files left in ephemeral location only
- `.gitignore` covers all binary extensions present

---

## Phase 2: Convert

**Goal:** Transform all binary documents (.docx) to Markdown.

### Steps

1. Create `docs/archive/extracted/` directory
2. For each `.docx` file:
   ```bash
   pandoc "<file>.docx" -t markdown --wrap=none -o docs/archive/extracted/<kebab-name>.md
   ```
3. Verify conversion:
   ```bash
   wc -l docs/archive/extracted/<file>.md
   ```
4. Log conversion in the extraction manifest (Phase 3)

### Naming Convention

| Source | Extracted |
|--------|----------|
| `1a. Master spiral backend breakdown.docx` | `1a-master-spiral-backend-breakdown.md` |
| `Hormones & Healing.docx` | `health/hormones-and-healing.md` |

- Kebab-case all filenames
- Prefix removed (e.g., `ChatGPT-` prefix stripped from topic name)
- Subdirectory matches source folder

### Quality Gate

- Every .docx has a corresponding .md
- Line count > 0 for each extraction
- No pandoc errors in conversion

---

## Phase 3: Extract & Frontmatter

**Goal:** Process all .txt/.md source files into structured Markdown with YAML frontmatter.

### Steps

1. Create subdirectories in `docs/archive/extracted/` matching source structure:
   ```
   extracted/health/
   extracted/mindset/
   extracted/business/
   extracted/water/
   extracted/time-astro/
   extracted/concepts/
   ```

2. For each source file, create an extracted version with frontmatter:

   ```yaml
   ---
   title: "<topic from handoff inventory>"
   source_file: "<original filename>"
   source_folder: "<category>"
   nodes: [<node numbers from handoff>]
   readiness: "<Ready|Partial|Raw|Empty>"
   pillar: "<Physical|Inner|Identity|Financial|Cross-cutting>"
   extracted: <date>
   ---
   ```

3. Preserve original content verbatim below frontmatter. Do NOT edit, improve, or rewrite client content.

4. For Empty/duplicate files: create a stub with `readiness: Empty` or `readiness: Duplicate` and a note.

### Frontmatter Field Definitions

| Field | Source | Values |
|-------|--------|--------|
| `title` | Handoff inventory "Topic" column | Free text |
| `source_file` | Original filename | Exact match |
| `source_folder` | Parent directory | health, mindset, business, water, time-astro, concepts |
| `nodes` | Handoff inventory "Node(s)" column | Array of integers [1-13] |
| `readiness` | Handoff inventory "Ready?" column | Ready, Partial, Raw, Empty, Duplicate |
| `pillar` | Derived from node range | Physical (1-5), Inner (6-9), Identity (10-12), Financial (13), Cross-cutting |
| `extracted` | Date of extraction | YYYY-MM-DD |

### Quality Gate

- Every source .txt/.md has a corresponding extracted .md
- All frontmatter fields populated (no blanks except intentional N/A)
- Content preserved verbatim (diff check: original vs extracted body)

---

## Phase 4: Build Alignment Audit

**Goal:** Measure every extracted atom against the current build state.

### Steps

1. Read current `src/content/` collections:
   - `src/content/branches/*.md` — individual branch pages
   - `src/content/pillars/*.md` — pillar overview pages

2. For each extracted file, determine Build State:

   | State | Meaning |
   |-------|---------|
   | `EXISTS` | Content topic is fully covered in an existing src/content/ file |
   | `PARTIAL` | Some coverage exists but doesn't match the depth of the source |
   | `MISSING` | No corresponding content in src/content/ |
   | `N/A` | Empty/utility file, no build target |

3. Record in the extraction manifest:

   ```markdown
   | # | Source File | Category | Nodes | Readiness | Build State | Gap |
   ```

4. The "Gap" column describes what's missing:
   - "No branch page for this topic"
   - "Branch exists but doesn't reference this source material"
   - "Pillar page mentions this but lacks depth"
   - "N/A — empty source"

### Quality Gate

- Every file has a Build State assignment
- EXISTS claims verified by reading the target file
- Gap descriptions are actionable (not vague)

---

## Phase 5: Inject

**Goal:** Move build-ready content into Astro content collections.

### Injection Criteria

A file qualifies for injection when ALL of:
1. `readiness: Ready` in the extraction manifest
2. Build State is `MISSING` or `PARTIAL`
3. Node architecture is locked (GH#13 resolved) — OR content is node-independent
4. Content passes editorial review (no flagged claims from handoff Section 8)

### Steps

1. Determine target collection (`branches` or `pillars`) and slug
2. Create or update `src/content/{collection}/{slug}.md` with:
   - Frontmatter matching `content.config.ts` schema:
     ```yaml
     # For branches:
     title: string
     emoji: string
     hook: string
     status: "live" | "placeholder"
     tone: "standard" | "soft"
     order: number

     # For pillars:
     title: string
     emoji: string
     tagline: string
     status: "live" | "placeholder"
     order: number
     ```
   - Body content adapted from extracted source (may require restructuring to match existing page format: Hook → Connection → Where Water Fits → Bridge → Resources → CTA)

3. If updating an existing file: **additive only** — do not remove existing content, append or enhance

### Quality Gate

- Frontmatter validates against `content.config.ts` schema
- `npm run build` succeeds after injection
- New/updated pages render correctly at their routes
- No flagged claims (handoff Section 8) in injected content

---

## Phase 6: Record

**Goal:** The extraction itself becomes the audit trail.

### Artifacts Produced

| Artifact | Location | Tracked in Git? |
|----------|----------|-----------------|
| Raw source files | `docs/archive/source-bundle/` | Text: yes, Binary: no (.gitignore) |
| Extracted Markdown | `docs/archive/extracted/` | Yes |
| Extraction manifest | `docs/archive/extraction-manifest.md` | Yes |
| This SOP | `docs/sops/SOP-SS-CNT-001_001-content-extraction-and-node-injection.md` | Yes |
| Injected content | `src/content/{branches,pillars}/` | Yes |

### Commit Convention

```
feat: extract and inject client content drop — <date>

<count> files extracted from <source>.
<count> files injected into src/content/.
Manifest: docs/archive/extraction-manifest.md
SOP: SOP-SS-CNT-001
```

---

## Reproduction

To reproduce this pipeline for a future content drop:

1. Receive content (Drive export, iMessage, email)
2. Run Phase 1 (archive to source-bundle/)
3. Run Phase 2 (convert .docx → .md)
4. Run Phase 3 (extract with frontmatter)
5. Run Phase 4 (build alignment audit)
6. Run Phase 5 (inject qualified files)
7. Run Phase 6 (commit + record)
8. Update this SOP if new patterns emerge

### Trigger Conditions

- Client sends a Google Drive export
- Client sends iMessage with content/specs/decisions
- Client sends screenshots or documents via any channel
- Any new material arrives that should feed the build

---

## Related SOPs

- SOP-SS-CLT-001_001 — Client Decision Tracker (decisions that gate injection)
- SOP-SS-ISS-001-001 — Issue Specification Ontology (specs that reference source content)
- SOP-SS-TRK-001_001 — Issue Tracking (board state that reflects extraction progress)
- SOP-SS-PRC-001_001 — Meta Process (how SOPs themselves are created and versioned)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Initial creation — generated during first execution of this pipeline on the admin Drive export (127 files). Process: archive → convert → extract → audit → inject → record. |

**Last Updated:** 2026-04-03
