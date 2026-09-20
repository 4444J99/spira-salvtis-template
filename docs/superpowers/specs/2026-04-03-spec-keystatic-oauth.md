# Specification: Keystatic Production Handover & GitHub OAuth Setup

**Issue:** #1 | **Phase:** IRF | **Priority:** N/A | **Status:** SPEC

## Context

### Why This Matters
This is a legacy IRF item (IRF-APP-037) tracking the Keystatic CMS handover. The setup steps are documented but await pricing arrangement confirmation before execution.

### Dependencies
- **Blocked by:** #5 (revenue agreement)
- **Blocks:** CMS deployment
- **Requires:** Pricing arrangement confirmation

## Scope

### In-Scope
- Create GitHub OAuth App
- Configure Netlify environment variables
- Finalize domain in astro.config.mjs
- Uncomment redirects in netlify.toml

### Out-of-Scope
- Pricing implementation (future)
- Content migration

## Output

### Deliverable
GitHub OAuth configured, CMS accessible

### Success Criteria
- [ ] OAuth App created in GitHub
- [ ] Environment variables configured
- [ ] CMS accessible at /keystatic

### Verification Method
Navigate to /keystatic, login with GitHub

## Gate

**Gate Criterion:** OAuth App created, environment variables set, CMS accessible

**Approver:** Studio

**Evidence Required:**
- OAuth App settings screenshot
- CMS login successful

## Execution Checklist

- [ ] Confirm #5 resolved (revenue agreement)
- [ ] Create GitHub OAuth App (if not done)
- [ ] Configure environment variables (if not done)
- [ ] Update astro.config.mjs site URL
- [ ] Uncomment netlify.toml redirects (if using Netlify)
- [ ] Test CMS access
- [ ] Commit

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 2 |
| Actual Hours | |

## Notes

### Current Status
- Site renamed to elevateslign-spiral.netlify.app
- GitHub mode configured in keystatic.config.ts
- Pipeline ready for ignition upon arrangement confirmation

### Required Steps (from IRF-APP-037)
1. Create GitHub OAuth App (Settings → Developer settings → OAuth Apps)
2. Configure environment variables in deployment platform
3. Update site URL in astro.config.mjs
4. Uncomment redirects in netlify.toml (if applicable)
