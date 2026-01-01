# AI CONTEXT & HANDOVER

**Date:** 2026-01-01
**Status:** CONFIGURATION COMPLETE / DEPLOYMENT PENDING
**Critical Action Required:** Verify Production Build

## 1. The Situation
The application code is stable. We have fixed the critical "Preview Crash" issue.
**All critical environment variables have been configured in Vercel.** The project is ready for a full production test.

## 2. Environment Configuration
All variables (Business Logic, Stripe, Infrastructure) are confirmed configured in Vercel Project Settings.

### Business Logic
- `FREE_DAILY_LIMIT`: `5` (Configured)
- `PRO_ARCHITECT_MONTHLY_LIMIT`: `30` (Configured)
- `NEXT_PUBLIC_APP_URL`: `https://hatchit.dev` (Configured)

### Stripe (CRITICAL)
- `STRIPE_PRO_PRICE_ID`: `price_1SkDdZEZ4zm4PZbKZ6C3vfj8` (Configured)
- `STRIPE_AGENCY_PRICE_ID`: `price_1SkDa3EZ4zm4PZbKJpnbBPCb` (Configured)
- `STRIPE_SECRET_KEY`: `[Configured]` (From Stripe Dashboard)

### Infrastructure (CRITICAL)
- `GEMINI_API_KEY`: `[Configured]` (For Audit/Logo generation)
  - Project ID: `950209561172`
  - Project Name: `HatchIt.dev`
- `ANTHROPIC_API_KEY`: `[Configured]` (For Surgical Edits/Refinements)
- `CLERK_WEBHOOK_SECRET`: `[Configured]` (For User Sync)
- `CLERK_SECRET_KEY`: `[Configured]` (From Clerk Dashboard)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `[Configured]` (From Clerk Dashboard)
- `SUPABASE_SERVICE_ROLE_KEY`: `[Configured]` (For DB Writes)
- `NEXT_PUBLIC_SUPABASE_URL`: `[Configured]`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[Configured]`
- `VERCEL_TOKEN`: `[Configured]` (For Domain Management API)
  - Project ID: `prj_7iJnRClrcIrJ6snX8KDtAa2RviGS`

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
