# admin's Launch Checklist — Sovereign Systems Spiral

This checklist summarizes the remaining "human-in-the-loop" actions required to take the Spiral fully live on your custom domains.

## 1. Domain Connection (Action: admin)
To move from the current Worker review URL (`sovereign-systems-spiral.ivixivi.workers.dev`) to `hub-example.com`:
- [ ] Log into GoDaddy.
- [ ] Update DNS settings (I can provide the exact A/CNAME records once you start the process in Cloudflare, or we can hop on a 5-min call to do it together).
- [ ] Connect `water-example.com` (this will replace the current GHL-hosted landing page with the new high-performance funnel).

## 2. Affiliate Links & Products (Action: admin)
To start generating revenue through the Hydration Funnel:
- [ ] Provide IonFaucet affiliate link.
- [ ] Provide Multipure affiliate link.
- [ ] Provide PureHome / Enagic K8 affiliate links.
- [ ] Provide the GoHighLevel Quiz/Form URL for the "See My Results" step.

## 3. Technical Operationalization (Action: Anthony)
- [ ] **Worker secrets:** Set `GHL_WEBHOOK_URL` and `EWG_API_KEY` on the Cloudflare Worker.
- [ ] **GHL Webhook:** Confirm the email capture form pings the GHL workflow after `GHL_WEBHOOK_URL` is set.

## 4. Revenue Agreement (Action: Both)
- [ ] Acknowledge the final Revenue Agreement drafted in `docs/client-deliverables/2026-04-27-revenue-agreement-final.md`.
- [ ] Close GH#5.

---
*Status: READY FOR LAUNCH*  
*Date: 2026-04-27*
