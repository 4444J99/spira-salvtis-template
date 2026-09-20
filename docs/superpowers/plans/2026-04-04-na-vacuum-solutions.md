# Solutions: N/A Vacuum Fields in CLAUDE.md System Variables

**Date:** 2026-04-04  
**Context:** Session close audit identified N/A (zero) values in CLAUDE.md system variables representing vacuum where something should be.

---

## Vacuum Fields Identified

| Variable | Current | Ideal | Gap |
|----------|---------|-------|-----|
| `code_files` | 0 | >0 | Project has code but not tracked |
| `test_files` | 0 | >0 | No testing infrastructure |
| `repos_with_tests` | 0 | 1 | Tests not configured |

---

## Root Cause Analysis

1. **No test framework configured** — AGENTS.md documents how to add vitest but it's not installed
2. **No file counting** — CLAUDE.md system variables expected to be auto-generated, but the repo has no scripts to populate them
3. **Ontologia sync gap** — These variables should propagate from local to global, but this repo lacks the integration

---

## Solutions Proposed

### Solution A: Quick-Win — Add File Counting Script

**Priority:** HIGH | **Effort:** 1 hour | **Impact:** Immediate visibility

- Create `scripts/count-files.ts` that outputs code file counts to JSON
- Add to CI pipeline to run post-build
- Script to update CLAUDE.md system variables automatically

**Action:**
```bash
# Create scripts/count-files.ts
npm pkg set scripts.count-files="tsx scripts/count-files.ts"
```

---

### Solution B: Add Testing Infrastructure

**Priority:** MEDIUM | **Effort:** 2 hours | **Impact:** Repos_with_tests = 1

- Install vitest + @testing-library/astro + jsdom
- Add basic test for spiral.ts component
- Update CI to run tests

**Action:**
```bash
npm install -D vitest @testing-library/astro jsdom
```

---

### Solution C: Integrate with Ontologia

**Priority:** LOW | **Effort:** 8 hours | **Impact:** Global variable sync

- Create organvm integration script
- Run on session close to push local metrics to global
- Requires coordination with meta-organvm

**Note:** This exceeds this repo's scope — coordination with ORGAN-III governance needed.

---

## Decision

**Recommended:** Implement Solution A + B in this session to close the vacuum locally.

**Next Step:** Execute Solution A (file counting script) → commit → push → update CLAUDE.md manually or via script.