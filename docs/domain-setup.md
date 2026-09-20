# Connecting Your Domains

Current SSR review URL: **https://sovereign-systems-spiral.ivixivi.workers.dev**

To connect the real domains, add them to the Cloudflare Worker. The old `sovereign-systems-spiral.pages.dev` project is static-only and does not serve `/capture` or `/api/water-report`.

---

## 1. hub-example.com (GoDaddy)

1. In Cloudflare dashboard → Workers & Pages → sovereign-systems-spiral → Settings → Domains & Routes → Add → Custom domain
2. Enter `hub-example.com`
3. Cloudflare will tell you what DNS records to set
4. In GoDaddy → My Products → DNS:
   - Add the CNAME or A/AAAA records Cloudflare provides for the Worker custom domain
   - Or if GoDaddy won't allow CNAME on root: add the A records Cloudflare provides
5. Wait 5-30 minutes for DNS to propagate
6. Cloudflare handles HTTPS automatically

---

## 2. water-example.com

1. Same process — add in Cloudflare Worker Custom Domains
2. Update DNS at your registrar to point to Cloudflare
3. The Worker serves the correct SSR content for all domains from one deployment

**Important:** This will disconnect the current LeadConnector/GHL site at this domain. Your GHL forms, workflows, and tagging still work — they're backend systems, not tied to the domain.

---

## 3. business-example.com (When Ready)

Same process. Connect when the business pillar is built out.

---

## Need Help?

Send a screenshot of your DNS settings page and I'll tell you exactly what to change.

---

## After Connecting

Once domains are connected:
- `hub-example.com` → Your hub with the spiral
- `water-example.com` → Your water funnel
- `business-example.com` → Your business pillar (when ready)

All three domains serve from the same site. Update content once, it works everywhere.
