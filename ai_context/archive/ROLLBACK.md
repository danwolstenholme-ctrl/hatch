# Rollback & Recovery Runbook

**Use when a deployment or AI change breaks the site. Keep this in the repo and update as flows change.**

## 0) Know the safepoint
- Keep a known-good tag: `safepoint-prod` on the last verified deployment.
- If missing, create it now once the build is verified: `git tag -f safepoint-prod && git push -f origin safepoint-prod`.

## 1) Immediate rollback (Vercel / git)
- If prod is broken, redeploy the safepoint: `git push origin safepoint-prod:main` (or trigger Vercel deploy from that tag/commit).
- If a fast patch is needed: `git revert <bad_commit_sha>` then `git push`.

## 2) Local validation before re-open
- `npm run build` (type/syntax gate).
- Smoke the critical flow: `/sign-up` -> checkout -> metadata set -> `/builder` loads -> deploy/export buttons gate correctly.
- Guest guard: `/builder?mode=guest&prompt=...` builds; deploy/export stays locked; paywall modal shows.

## 3) Auth/paywall integrity checks
- Clerk metadata `publicMetadata.accountSubscription.status === active` is required server-side for deploy/export/refine.
- No subscription = deploy/export/download/refine endpoints return 403.
- Guest/demo projects must not write to shared prod data; demo IDs start with `demo-`.

## 4) Preview safety
- Iframe/preview forces links to `target="_blank" rel="noopener"`; no in-frame navigation.
- Babel sandbox stays enabled; errors surface in UI, not break parent page.

## 5) If checkout/webhooks break
- Verify Stripe webhook secret in Vercel.
- Re-run a test checkout; confirm Clerk metadata updates.
- If pending, manually sync via Clerk dashboard; requeue webhook if needed.

## 6) Communications
- Post-mortem note: cause, fix, and test coverage added.
- Add a quick regression test if a bug slipped through (especially auth/paywall/preview).
