# Specification: Connect custom domains (Cloudflare)

**Issue:** #3 | **Phase:** α | **Priority:** P1 | **Status:** GATED

## Context

### Why This Matters
The site must be accessible at production domains. Domain connection is a prerequisite for production deployment and affects how the site appears to end users.

### Dependencies
- **Blocked by:** #13 (node architecture) - not strict
- **Blocks:** Production deployment
- **Requires:** DNS registrar access from admin

### Upstream / Downstream
- **Upstream:** IRF-APP-033
- **Downstream:** All production deployment work

## Scope

### In-Scope
- Connect hub-example.com via Cloudflare Pages Custom Domains
- Connect gateway-example.com
- Connect business-example.com
- Verify DNS propagation

### Out-of-Scope
- DNS changes for other domains
- Email configuration
- SSL certificate management (handled by Cloudflare)

### Boundaries
- hub-example.com: GoDaddy DNS (requires admin's access or action)
- gateway-example.com: Cloudflare (may already be configured)
- business-example.com: Cloudflare (may already be configured)

## Output

### Deliverable
All 3 domains resolve to Cloudflare Pages deployment

### Success Criteria
- [ ] hub-example.com → sovereign-systems-spiral.pages.dev
- [ ] gateway-example.com → sovereign-systems-spiral.pages.dev
- [ ] business-example.com → sovereign-systems-spiral.pages.dev
- [ ] All domains show production site
- [ ] SSL certificates auto-provisioned

### Verification Method
Visit each domain in browser, verify content loads correctly

## Gate

**Gate Criterion:** All 3 domains resolve to sovereign-systems-spiral.pages.dev

**Approver:** Studio + admin confirmation

**Evidence Required:**
- Browser verification screenshots
- DNS lookup confirming CNAME records

## Execution Checklist

- [ ] Review `docs/domain-setup.md` for instructions
- [ ] Contact admin for GoDaddy access (hub-example.com)
- [ ] Check Cloudflare for gateway-example.com and business-example.com
- [ ] Add Custom Domains in Cloudflare Pages dashboard
- [ ] Update DNS records (or guide admin to do so)
- [ ] Wait for propagation (up to 48 hours)
- [ ] Verify each domain loads correctly
- [ ] Document final domain URLs

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 4 |
| Actual Hours | |

## Notes

### Domain Setup Docs
See `docs/domain-setup.md` for full Cloudflare Pages custom domain instructions.

### Current Status
- Site deployed to Cloudflare Pages ✅
- Custom domains: PENDING

### admin's Action Required
- GoDaddy login for hub-example.com DNS changes
- Or: Make DNS changes herself and confirm when done
