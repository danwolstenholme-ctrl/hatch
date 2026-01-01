# AI CONTEXT & HANDOVER

**Date:** 2026-01-01
**Status:** PRE-DEPLOYMENT STAGE
**Critical Action Required:** Vercel Environment Configuration

## 1. The Situation
The application code is stable. We have fixed the critical "Preview Crash" issue by mocking Next.js components in the iframe. We have also implemented a Clerk Webhook to ensure users are correctly synced to Supabase.

**The only remaining blocker is configuration.** The Vercel environment is missing 9 critical variables.

## 2. Missing Environment Variables
The user has been instructed to add these. **Do not proceed with code changes until these are confirmed.**

### Business Logic
- `FREE_DAILY_LIMIT`: `5`
- `PRO_ARCHITECT_MONTHLY_LIMIT`: `30`
- `NEXT_PUBLIC_APP_URL`: `[Configured]` (Used for Stripe redirects)

### Stripe (CRITICAL)
- `STRIPE_PRO_PRICE_ID`: `price_...` (From Stripe Dashboard)
- `STRIPE_AGENCY_PRICE_ID`: `price_...` (From Stripe Dashboard)
- `STRIPE_SECRET_KEY`: `[Configured]` (From Stripe Dashboard)

### Infrastructure (CRITICAL)
- `GEMINI_API_KEY`: `[Configured in .env.local]` (For Audit/Logo generation)
  - Project ID: `950209561172`
  - Project Name: `HatchIt.dev`
- `ANTHROPIC_API_KEY`: `[Configured]` (For Surgical Edits/Refinements)
- `CLERK_WEBHOOK_SECRET`: `whsec_...` (For User Sync)
- `CLERK_SECRET_KEY`: `[Configured]` (From Clerk Dashboard)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `[Configured]` (From Clerk Dashboard)
- `SUPABASE_SERVICE_ROLE_KEY`: `ey...` (For DB Writes)
- `NEXT_PUBLIC_SUPABASE_URL`: `https://...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `ey...`
- `VERCEL_TOKEN`: `[Configured]` (For Domain Management API)

## 3. Recent Technical Changes
- **`components/BuildFlowController.tsx`**: Modified to inject `const Image = ...` and `const Link = ...` into the preview iframe. This allows the AI to generate `next/image` code without breaking the preview.
- **`app/api/webhook/clerk/route.ts`**: Created to handle `user.created` and `user.updated` events from Clerk.
- **`middleware.ts`**: Reverted to a permissive state to ensure webhooks aren't blocked.

## 4. Prompt for the Next AI
Copy and paste this prompt to the next AI agent to resume work:

```text
@workspace I am resuming the HatchIt deployment. 
Current Status:
1. Codebase is patched (Preview Engine fixed, Clerk Webhook added).
2. I have just added the 9 missing environment variables to Vercel (Stripe IDs, Gemini Key, Supabase Keys, Clerk Secret).
3. I am ready to deploy.

Please:
1. Verify if there are any other missing configurations I might have overlooked.
2. Help me run a final local build test (`npm run build`) to ensure no type errors remain.
3. Guide me through the final git push and Vercel deployment verification.
```
