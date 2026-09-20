---
title: GHL webhook Worker secret
date: 2026-06-19
tracks: GH#211
context: The /capture route is already code-complete. Production lead delivery to GHL starts only after admin provides the GoHighLevel webhook URL and the URL is set as the GHL_WEBHOOK_URL secret on the Cloudflare Worker.
---

This is the production wiring procedure for `GHL_WEBHOOK_URL`.

Do not commit the webhook URL. It is a Cloudflare Worker secret, not a repo
variable. Until this secret exists, `/capture` still returns success for valid
submissions and writes to `SUBMISSIONS` KV, but skips the GHL sink.

## Gate

Required input:

- admin's GoHighLevel webhook URL from `docs/admin/2026-06-05-final-pending-inputs.md`, dashboard setup item D.

If admin chooses "skip for now", leave GH#211 open as client-gated and do not
set a placeholder secret.

## Preconditions

- Local checkout is on the commit intended for production.
- Cloudflare auth can edit the `sovereign-systems-spiral` Worker.
- `CLOUDFLARE_ACCOUNT_ID` is available if Wrangler does not infer the account
  from the active login.
- The secret value is available in the shell as `GHL_WEBHOOK_URL`, or ready to
  paste into Wrangler's hidden prompt.

## Set the secret

Preferred non-echoing path:

```bash
npm exec -- wrangler secret put GHL_WEBHOOK_URL --config wrangler.jsonc
```

Paste the webhook URL into Wrangler's hidden prompt.

If the URL is already in the shell environment, use stdin so the value does not
appear in shell history:

```bash
test -n "$GHL_WEBHOOK_URL"
printf '%s' "$GHL_WEBHOOK_URL" |
  npm exec -- wrangler secret put GHL_WEBHOOK_URL --config wrangler.jsonc
```

Cloudflare's current Wrangler behavior is that `wrangler secret put` creates a
new Worker version and deploys it immediately. A separate `npm run deploy` is
not required just to activate the secret.

## Verify

Confirm the secret name exists without revealing its value:

```bash
npm exec -- wrangler secret list --config wrangler.jsonc --format json
```

Expected: the JSON list includes `"name": "GHL_WEBHOOK_URL"` with type
`"secret_text"`.

Then submit a low-risk production smoke test:

```bash
curl -sS -X POST \
  https://sovereign-systems-spiral.ivixivi.workers.dev/capture \
  -H 'content-type: application/json' \
  --data '{"email":"ops+ghl-smoke@sovereign-systems.local","name":"GHL smoke","source":"ops-ghl-webhook-smoke"}'
```

Expected response:

```json
{"success":true}
```

Finally, verify the lead appeared in GHL. If the curl succeeds but no GHL lead
appears, tail Worker logs while repeating the smoke test:

```bash
npm exec -- wrangler tail sovereign-systems-spiral
```

Look for `[capture] GHL webhook failed:`. Sink failures are intentionally logged
without breaking the user-facing capture response.

## Closeout

After the secret is present and GHL receives the smoke-test lead:

```bash
gh issue close 211 \
  --repo organvm-iii-ergon/sovereign-systems--spiral-template \
  --comment "GHL_WEBHOOK_URL set on the production Worker $(date -u +%Y-%m-%dT%H:%M:%SZ); /capture smoke test returned 200 and GHL receipt was verified."
```

Do not close GH#211 if the only proof is a successful `/capture` response. The
route is designed to return success even when optional sinks are unset or fail.
