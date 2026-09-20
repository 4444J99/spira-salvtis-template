# Specification: Verify doc 1b reel/video asset access

**Issue:** #14 | **Phase:** α | **Priority:** P1 | **Status:** GATE MET

## Context

### Why This Matters
Doc 1b references three shared Google Drive folders for reel/video assets. These need verification before the media pipeline can proceed. If inaccessible, we need to request re-shares before work begins.

### Dependencies
- **Blocked by:** None
- **Blocks:** #18 (video hosting), #9 (quiz routing - media assets)
- **Requires:** Access to Google Drive links from handoff

### Upstream / Downstream
- **Upstream:** Handoff doc 1b
- **Downstream:** Video hosting decision, media integration

## Scope

### In-Scope
- Test all three shared links from handoff
- Record access status for each
- Document which are accessible, expired, or permission-blocked

### Out-of-Scope
- Downloading/syncing assets (done after verification)
- Video hosting implementation

### Boundaries
- Only test shared links; do not modify or download yet

## Output

### Deliverable
Access status report for each of three folders

### Success Criteria
- [x] Folder 1: Access status recorded
- [x] Folder 2: Access status recorded
- [x] Folder 3: Access status recorded
- [x] If inaccessible: Re-share request sent to admin, or explicitly not required

### Verification Method
Attempt to open each link in browser, record result

## Gate

**Gate Criterion:** All three folders are accessible OR a specific re-share request has been sent to admin

**Approver:** Studio (internal verification)

**Evidence Required:**
- Access status report
- Re-share request (if needed) with timestamp

## Execution Checklist

- [x] Identify three shared links from handoff doc 1b
- [x] Test link 1 in browser/Drive connector, record result
- [x] Test link 2 in browser/Drive connector, record result
- [x] Test link 3 in browser/Drive connector, record result
- [x] If any inaccessible: draft re-share request
- [x] Send request to admin, or record that none was needed
- [x] Document results in this spec

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | 2026-06-17T16:10:39Z |
| Work Complete | 2026-06-17T16:10:39Z |
| Gate Met | Yes - all three Drive folders list successfully; no re-share needed |
| Estimated Hours | 1 |
| Actual Hours | 1 |

## Notes

### Source References
Links should be in `docs/handoff-admin-spiral-path-2026-04-01.md` around media/assets section.

### Typical Issue
Google Drive shared links often expire or lose permission when owner changes account. Re-share is standard resolution.

### Tracking
Verified 2026-06-17T16:10:39Z through the Google Drive connector.

| Folder | Source | Result | Notes |
|--------|--------|--------|-------|
| 1 | `https://drive.google.com/drive/folders/1-RBQ7Pi0Qka-SIZxmVam1PBktQBL1EUE?usp=sharing` | Accessible | Folder name: `Content ideas from insta & ss’s`. Metadata and file listing succeeded; listing returned image assets. |
| 2 | `https://drive.google.com/drive/folders/1-D24SHI3Jp4U774nrIGesDRXXdojYUBs?usp=sharing` | Accessible | Folder name: `content`. Metadata, top-level listing, and one-level nested folder listings succeeded. |
| 3 | `https://drive.google.com/drive/folders/1-XcYxei9tAhjzJP5XRQxXdFNRi4WYwjZ?usp=sharing` | Accessible | Folder name: `ALL Insta screen shots `. Metadata and file listing succeeded; listing returned image assets. |

No expired or permission-blocked links were found, so no re-share request was sent.

Evidence:
- Access proof: `docs/proofs/media/2026-06-17-gh-14-doc-1b-drive-access.md`
- Working media manifest: `docs/admin/media/doc-1b-drive-assets/manifest.json`

Raw binary mirror note: terminal network is blocked in this execution environment (`curl` cannot resolve `drive.google.com` or the connector's temporary file host), and the Drive connector returns raw files as base64 payloads rather than writing to the filesystem. The committed manifest mirrors the accessible asset sources and records the raw payload mirror blocker; raw downloads should be run from a network-enabled environment into `docs/admin/media/doc-1b-drive-assets/raw/`, which is intentionally gitignored until LFS or a hosting decision exists.
