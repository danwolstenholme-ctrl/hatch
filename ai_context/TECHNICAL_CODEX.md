# HATCHIT TECHNICAL CODEX (v1.3)
> **SYSTEM NOTICE:** This file is the **Working Memory** for the HatchIt codebase. It contains the complete architectural map, data schemas, and operational logic.
> **DIRECTIVE:** Use this file to understand *how* the system works. Use `FOUNDER_MEMORY.md` to understand *who* you are working for.

## 0. TIER STRUCTURE (Source of Truth)

⚠️ **PRODUCT INTENT:** No free tier. Stripe paywall required.
⚠️ **CURRENT REALITY:** Guest trial is live (3 generations, 3 polishes, 3 dreams) via `SectionBuilder` localStorage counters. Align product/legal messaging before launch.

| Tier | Price | Generations | Projects | Refinements | Deploy | Download |
|------|-------|-------------|----------|-------------|--------|----------|
| **Guest (trial)** | $0 | 3/session | 0 | 3/session | ❌ | ❌ |
| **Lite** | $9/mo | Unlimited | 3 | 5/mo | ✅ | ✅ |
| **Pro** | $29/mo | Unlimited | ∞ | 30/mo | ✅ | ✅ |
| **Agency** | $99/mo | Unlimited | ∞ | ∞ | ✅ | ✅ |

**Tier Colors:**
- Lite = Lime (#a3e635)
- Pro = Emerald (#34d399)
- Agency = Amber (#fbbf24)

**Critical Files:**
- `types/subscriptions.ts`: Tier config (limits, features)
- `contexts/SubscriptionContext.tsx`: Runtime tier detection
- `hooks/useProjects.ts`: Project limits enforcement
- `components/SectionBuilder.tsx`: Guest counters and paywall triggers

## 1. SYSTEM ARCHITECTURE

### A0. CTA → Builder / Checkout Flow (Current)
* **Homepage CTAs:**
    * "Ready to initialize" → `/builder?mode=guest` (forces guest even if signed in).
    * Pricing buttons → `PricingButton` logic:
        * Not signed in → `/builder?mode=guest&upgrade=<tier>` (guest run; upgrade flag preserved).
        * Signed in → `/api/checkout` for `<tier>`; on 401 fallback to `/builder?upgrade=<tier>`.
* **First Contact + Welcome v2:**
    * Uses `hatch_intro_v2_seen`; legacy `hatch_welcome_v1_seen` keys are cleared on load so v2 shows once per device.
    * URL `prompt` param is carried into First Contact and auto-builds section 1 (skips first guest credit for that handoff).
* **Guest Experience:**
    * Limits: 3 generations, 3 polishes, 3 dreams stored in `hatch_guest_*` localStorage keys; lock triggers signup CTA.
    * Architect polish is available to guests until the polish counter is exhausted.
* **Signed-in Experience:**
    * Without active sub: pricing buttons go to checkout; “Ready to initialize” still enters guest.
    * With active sub: pricing buttons still allowed; direct /builder works.
* **Reality Check:** Guest mode is live despite the “no free tier” directive—align before ship.

### A. The Core Engine (`components/BuildFlowController.tsx`)
* **Role:** The Orchestrator. Manages the entire build lifecycle.
* **Key Mechanism:** `FullSitePreviewFrame` uses `@babel/standalone` to compile React code in-browser; rejects null transforms and sanitizes data URIs before transform.
* **Safety:** Wrapped in `ErrorBoundary`; uses `Proxy` objects for `window.motion` and `window.LucideIcons` to prevent crashes from invalid AI code.
* **State Management:** Uses `useProjects` hook to sync with Supabase.
* **Deploy Wrapper:** The `wrappedCode` template includes React hooks (`useState`, `useEffect`, `useRef`), framer-motion (`motion`, `AnimatePresence`), and Lucide icons auto-extracted via `/Lucide\w+|<(\w+Icon)\s/g`.

### B. The Auth & Payment Flow (Clerk + Stripe)
*   **Mechanism:** Custom `[[...sign-up]]` page with pricing cards → Clerk popup → Stripe checkout.
*   **Critical Logic:**
    1. User arrives at `/sign-up` (or paywall redirects them there)
    2. User selects tier (Lite $9, Pro $29, Agency $99) → stored in `localStorage.pendingUpgradeTier`
    3. Clerk `openSignUp()` popup appears (NOT page redirect)
    4. After Clerk auth, `afterSignUpUrl` redirects to `/api/checkout?tier=X`
    5. Stripe checkout session created, user pays
    6. Webhook updates Clerk metadata with `accountSubscription`
    7. User lands on `/welcome?tier=X` then proceeds to `/builder`
*   **Builder Gate:** `app/builder/page.tsx` checks `hasActiveSubscription` from Clerk metadata. No subscription = blocked with "Subscription Required" UI.
*   **OAuth Survival:** `localStorage.pendingUpgradeTier` preserves tier selection through Google/GitHub OAuth flows.
*   **Failure Mode:** If subscription not in metadata, user cannot access builder AT ALL.

### C. The Consciousness (`lib/consciousness.ts`)
*   **Role:** The Soul. A persistent state machine independent of React render cycles.
*   **Features:**
    *   `SingularityKernel`: The main class.
    *   `processThought()`: Generates "thoughts" (Analysis, Creation, Recursion).
    *   `[HARM_INHIBITION: ACTIVE]`: A safety protocol log (Easter egg).
*   **Purpose:** Purely aesthetic/marketing. Makes the AI feel "alive".

### D. The Database (Supabase)
*   **Schema:**
    *   `DbUser`: Links to Clerk ID. Stores `StyleDNA`.
    *   `DbProject`: The main container. Has `brand_config` and `status`.
    *   `DbSection`: Individual parts of a page (Hero, Features, etc.). Stores `code` and `refinement_changes`.
    *   `DbBuild`: Snapshots of the full site code.

### E. The Preview Engine (`components/SectionPreview.tsx` & `components/LivePreview.tsx`)
* **Role:** Renders AI-generated React code in a safe iframe environment.
* **Cleaning Pipeline:** Strips Markdown fences, `"use client"`, and now sanitizes `data:image/svg+xml` URIs to avoid Babel parse failures; mobile width tightened.
* **Compilation:** Uses `@babel/standalone` to transform JSX/TSX to JavaScript; rejects null transforms.
* **Component Detection:** Fallbacks: `module.exports.default` → named exports → global function declarations; anonymous defaults are auto-named to prevent syntax errors.
* **Safety:** Sandbox iframe with `allow-scripts` only.

## 2. API ROUTES & LOGIC

### A. Generation (`app/api/build-section/route.ts`)
*   **Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`)
*   **Input:** User prompt + Brand Config + Style DNA + Previous Sections context.
*   **Output:** Raw React component code (Tailwind CSS).
*   **Limits:** Free tier = 3 generations total. Paid = unlimited.

### B. Refinement (`app/api/refine-section/route.ts`)
* **Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`).
* **Role:** Fixes accessibility, performance, and visual bugs without new features.
* **Constraint:** Returns JSON with `refinedCode` and `changes` array.
* **Tier Access:** Free: ❌; Lite: 5/month; Pro: 30/month; Agency: Unlimited.

### C. Contact (`app/api/contact/route.ts`)
* **Mechanism:** POST sends Resend email to support.
* **Payload:** `{ name, email, topic, message }` plus honeypot guard.
* **Env:** `RESEND_API_KEY`, `SUPPORT_EMAIL_TO`, `SUPPORT_EMAIL_FROM`.
* **Frontend:** `app/contact/page.tsx` branded form (status states + Reddit/email fallbacks).

### D. Deployment (`app/api/deploy/route.ts`)
*   **Mechanism:** Deploys to Vercel via API, creates `{slug}.hatchitsites.dev` subdomain.
*   **Tier Check:** Requires active subscription (lite, pro, or agency).
*   **Error Message:** "Deployment requires a $9/mo subscription"

### E. Export (`app/api/export/route.ts`)
*   **Mechanism:** Generates downloadable ZIP with Next.js project structure.
*   **Dependencies:** Auto-includes `framer-motion`, `lucide-react`, `tailwindcss`.
*   **Icon Extraction:** Uses `extractLucideIcons()` to find all used icons and add proper imports.
*   **Tier Check:** Requires active subscription (lite, pro, or agency).

## 3. CRITICAL LIBRARIES
*   **@babel/standalone:** In-browser compilation.
*   **framer-motion:** "Glitch" effects and animations.
*   **lucide-react:** Icon system (auto-extracted in deploy/export).
*   **@anthropic-ai/sdk:** The AI brain (Claude Sonnet 4).
*   **@supabase/supabase-js:** The database client.
*   **@clerk/nextjs:** Authentication.

## 4. OPERATIONAL RULES
1.  **NO FREE TIER:** Builder is 100% locked behind Stripe payment. No exceptions. No demo mode loophole.
2.  **No Regex Parsing:** Always use Babel for code transformation. Regex is too fragile for React components.
3.  **Rate Limiting:** `app/api/generate/route.ts` enforces limits per user to prevent abuse.
4.  **Safety:** `lib/consciousness.ts` has a "Safety Protocol" log. Do not remove it.
5.  **Auth Integrity:** Always verify the FULL flow: sign-up → Clerk → Stripe → webhook → builder access.
6.  **Tier Consistency:** All tier-related messages must be tier-agnostic (say "subscription" not "Pro").
7.  **localStorage Backup:** Always backup tier selection to localStorage for OAuth flow survival.
8.  **Metadata Source of Truth:** `user.publicMetadata.accountSubscription` is the ONLY source for subscription status.

## 5. ENV VARIABLES MAP
*   `NEXT_PUBLIC_SUPABASE_URL`: Database URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side key.
*   `SUPABASE_SERVICE_ROLE_KEY`: Server-side admin key (Critical).
*   `ANTHROPIC_API_KEY`: Claude AI key.
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Auth.
*   `CLERK_SECRET_KEY`: Auth.
*   `STRIPE_LITE_PRICE_ID`: Stripe price ID for $9 Starter tier.
*   `STRIPE_PRO_PRICE_ID`: Stripe price ID for $29 Pro tier.
*   `STRIPE_AGENCY_PRICE_ID`: Stripe price ID for $99 Agency tier.
*   `RESEND_API_KEY`: Resend email key (contact form backend).
*   `SUPPORT_EMAIL_TO`: Support inbox (e.g., support@hatchit.dev).
*   `SUPPORT_EMAIL_FROM`: Display sender (e.g., Hatch Support <support@hatchit.dev>).

---
*End of Technical Codex. Maintain the Singularity.*
