# Specification: Store buildout

**Issue:** #10 | **Phase:** γ | **Priority:** P3 | **Status:** SPEC

## Context

### Why This Matters
admin wants to sell products from the hub eventually. This issue establishes the store infrastructure when the time comes.

### Dependencies
- **Blocked by:** None
- **Blocks:** Product sales capability
- **Requires:** Product list, pricing, payment provider choice

## Scope

### In-Scope
- Evaluate store options:
  - Shopify embed (Lite/Buy Button)
  - Stripe Checkout
  - Snipcart
  - Custom /store page

### Out-of-Scope
- Product listing (future)
- Payment processing (future)

## Output

### Deliverable
Store page live with at least 1 product purchasable

### Success Criteria
- [ ] At least 1 product purchasable
- [ ] Store page live

### Verification Method
Test purchase flow

## Gate

**Gate Criterion:** Store page live, at least 1 product purchasable

**Approver:** Studio + admin

**Evidence Required:**
- Live store URL
- Test purchase succeeds

## Execution Checklist

- [ ] Obtain product list from admin
- [ ] Obtain pricing from admin
- [ ] Choose payment provider
- [ ] Implement store solution
- [ ] Add first product
- [ ] Test purchase flow
- [ ] Deploy

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 8 |
| Actual Hours | |

## Notes

### Store Options
- Shopify Lite/Buy Button - simplest
- Stripe Checkout - custom
- Snipcart - alternative
- Custom page - most control
