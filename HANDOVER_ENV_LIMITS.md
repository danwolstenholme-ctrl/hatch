# Handover: Environment, Webhooks, and Limits

**Date:** January 1, 2026
**Status:** Critical Infrastructure Audit

## 1. Critical Environment Variables
These variables are required for the application to function. Missing any of these will cause crashes or feature failures.

### AI Generation (The Core)
- `ANTHROPIC_API_KEY`: **REQUIRED.** Used by `app/api/build-section/route.ts` to generate code.
  - *Status:* Must be added to Vercel and `.env.local`.

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Required for frontend auth.
- `CLERK_SECRET_KEY`: Required for backend auth verification.
- `CLERK_WEBHOOK_SECRET`: **REQUIRED.** Used in `app/api/webhook/clerk/route.ts` to sync users to Supabase.

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public key for client-side operations.
- `SUPABASE_SERVICE_ROLE_KEY`: **REQUIRED.** Admin key for server-side operations (bypassing RLS).

### Payments (Stripe)
- `STRIPE_SECRET_KEY`: Required for processing checkout sessions.
- `STRIPE_WEBHOOK_SECRET`: **REQUIRED.** Used in `app/api/webhook/route.ts` to handle subscription updates.
- `STRIPE_LITE_PRICE_ID`: Price ID for the "Lite" tier.
- `STRIPE_PRO_PRICE_ID`: Price ID for the "Pro" tier.
- `STRIPE_AGENCY_PRICE_ID`: Price ID for the "Agency" tier.

---

## 2. Webhooks
The application exposes two critical webhook endpoints that must be configured in their respective provider dashboards.

### Stripe Webhook
- **Endpoint:** `https://your-domain.com/api/webhook`
- **Events to Listen For:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Secret:** `STRIPE_WEBHOOK_SECRET`

### Clerk Webhook
- **Endpoint:** `https://your-domain.com/api/webhook/clerk`
- **Events to Listen For:**
  - `user.created`
  - `user.updated`
  - `user.deleted`
- **Secret:** `CLERK_WEBHOOK_SECRET` (Get this from the Clerk Dashboard > Webhooks > Signing Secret).

---

## 3. Rate Limits (FIXED ✅)
**Current Status:** Limits now read from environment variables.

### Env Variables (Must have `NEXT_PUBLIC_` prefix!)
| Tier | Limit | Env Variable | Location |
|------|-------|--------------|----------|
| **Free** | 5 | `NEXT_PUBLIC_FREE_DAILY_LIMIT` | `components/SectionBuilder.tsx` |
| **Pro** | 30 | `NEXT_PUBLIC_PRO_ARCHITECT_MONTHLY_LIMIT` | `components/SectionBuilder.tsx` |
| **Agency** | ∞ | N/A | `components/SectionBuilder.tsx` |

### Note
- Free limit is still "Total Lifetime" stored in `localStorage` (`hatch_free_generations`), NOT daily reset.
- To make it daily, would need DB tracking per user.

---

## 4. Vercel Action Required
Rename these env vars in Vercel (add `NEXT_PUBLIC_` prefix):
- `FREE_DAILY_LIMIT` → `NEXT_PUBLIC_FREE_DAILY_LIMIT`
- `PRO_ARCHITECT_MONTHLY_LIMIT` → `NEXT_PUBLIC_PRO_ARCHITECT_MONTHLY_LIMIT`
