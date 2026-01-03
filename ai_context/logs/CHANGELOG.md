# Changelog

All notable changes to HatchIt.dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Guide
- **MAJOR** (x.0.0): Breaking changes, major redesigns
- **MINOR** (1.x.0): New features, significant improvements
- **PATCH** (1.1.x): Bug fixes, small tweaks, copy changes

---

## [1.7.0] - 2026-01-03
### The Paywall Revolution
**Theme:** Close every free-tier loophole. Builder access requires active Stripe subscription.

## [Unreleased]
### Onboarding + Support
- Replaced First Contact intro with a concise welcome/support screen that surfaces Reddit/email/bug links before the builder loads.
- Contact Support floating button now collapses on mobile with tighter padding/icon and hidden label until `sm`.

### Removed
- Removed `components/HatchCharacter.tsx` (avatar not part of current UX stack).
- Deleted legacy welcome UX at `app/welcome/page.tsx`.

### ⚠️ BREAKING CHANGES
- **NO FREE TIER:** Completely removed. All users must pay before accessing the builder.
- **Demo Mode Eliminated:** No guest access, no preview mode, no exceptions.

### Tier Structure (Final)
| Tier | Price | Projects | Refinements | Deploy | Badge Color |
|------|-------|----------|-------------|--------|-------------|
| Lite | $9/mo | 3 | 5/mo | ✅ | Lime |
| Pro | $29/mo | ∞ | 30/mo | ✅ | Emerald |
| Agency | $99/mo | ∞ | ∞ | ✅ | Amber |

### New Sign-Up Flow
1. User lands on `/sign-up` with pricing cards (not `/pricing`)
2. User selects tier → stored in `localStorage.pendingUpgradeTier`
3. Clerk popup opens (NOT page redirect)
4. After Clerk auth → redirect to `/api/checkout?tier=X`
5. Stripe payment → webhook updates Clerk metadata
6. User lands on `/welcome?tier=X` → proceeds to `/builder`

### Builder Enhancements
- **Tier Badges:** Visual tier indicator in builder header (Lite=lime, Pro=emerald, Agency=amber)
- **Feature Panels:** Expand/collapse panels showing unlocked features per tier
- **Project Counters:** "1 of 3 projects used" for Lite tier with visual progress bar

### Dashboard Enhancements
- **Project Limits UI:** Lite users see project count with upgrade prompt at limit
- **Tier Display:** Current subscription tier shown in dashboard header

### Files Changed
- `app/builder/page.tsx`: Paywall gate, tier badge, feature panels
- `app/sign-up/[[...sign-up]]/page.tsx`: Pricing cards, Clerk popup, localStorage backup
- `app/dashboard/projects/page.tsx`: Project limits, tier display
- `components/BuildFlowController.tsx`: Tier badge, feature panels
- `components/SectionBuilder.tsx`: Project limit enforcement
- `app/api/checkout/route.ts`: Stripe session creation per tier
- `app/api/webhooks/stripe/route.ts`: Metadata update on payment
- `app/welcome/page.tsx`: Post-payment landing page

---

## [1.6.1] - 2026-01-02
### Preview Engine Stability Upgrade
**Theme:** Robust handling of AI-generated code artifacts to prevent "Transform Error" crashes.

### Fixes
- **Markdown Stripping:** `SectionPreview` and `LivePreview` now automatically strip ` ```tsx ` and ` ``` ` blocks from AI output before compilation.
- **Anonymous Export Handling:** Automatically names anonymous default exports (`export default function()`) to prevent Babel syntax errors.
- **Component Detection:** Added fallback logic to find React components in global scope if standard exports fail.
- **Dependency Pinning:** Pinned generated projects (Deploy/Export) to Next.js 14.1.0 and React 18.2.0 for Vercel stability.

### Files Changed
- `components/SectionPreview.tsx`: Added code cleaning pipeline and component detection fallback.
- `components/LivePreview.tsx`: Added code cleaning, anonymous export handling, and improved error reporting.
- `app/api/deploy/route.ts`: Pinned dependencies to stable versions.
- `app/api/export/route.ts`: Pinned dependencies to stable versions.
- `generation_limits.test.ts`: Added unit tests for generation limits.

## [1.6.0] - 2026-01-02
### The Launch Day Blitz (18-Hour Session)
**Theme:** Complete end-to-end UX audit, tier solidification, and deployment pipeline fixes.

### Critical Deployment Fixes
- **Deploy Code Wrapper**: Now auto-extracts Lucide icons with regex, includes `useState`, `useEffect`, `useRef`, `AnimatePresence`, and all framer-motion imports.
- **Export API**: Added `framer-motion` and `lucide-react` to package.json dependencies. Auto-extracts Lucide icon imports from code.
- **Build Fix**: Deployed sites no longer crash from missing imports.

### Tier Structure Solidification (OUTDATED - See 1.7.0)
| Tier | Price | Generations | Projects | Refinements | Deploy |
|------|-------|-------------|----------|-------------|--------|
| ~~Free~~ | ~~$0~~ | ~~3 total~~ | ~~1~~ | ❌ | ❌ |
| Lite | $9/mo | Unlimited | 3 | 5/mo | ✅ |
| Pro | $29/mo | Unlimited | ∞ | 30/mo | ✅ |
| Agency | $99/mo | Unlimited | ∞ | ∞ | ✅ |

> ⚠️ **Free tier was eliminated in v1.7.0**

### Files Changed
- `components/BuildFlowController.tsx`: Deploy wrapper with proper imports, Lucide extraction
- `app/api/deploy/route.ts`: Error message "$9/mo required", accepts lite/pro/agency
- `app/api/export/route.ts`: Includes framer-motion, lucide-react deps, icon extraction
- `app/api/refine-section/route.ts`: Lite tier gets 5 refinements/month
- `types/subscriptions.ts`: Corrected Lite tier config (unlimited gens, 3 projects)
- `components/HatchModal.tsx`: All messaging tier-agnostic, removed "Pro" references
- `components/SectionBuilder.tsx`: Fixed FREE_GENERATION_LIMIT to 3
- `hooks/useProjects.ts`: Tier-based project limits (free=1, lite=3, pro/agency=∞)
- `app/page.tsx`: Fixed pricing button URL encoding, Starter tier features
- `components/Navigation.tsx`: Removed "Open Interface" button
- `app/welcome/page.tsx`: Free tier "3 Starter Generations", LiteNode component
- `app/faq/page.tsx`: Updated pricing info

### Marketing
- Created Reddit ad SVG (4:3 format) for $9/mo campaign
- Reddit Ads running: €0.18 CPC, 0.35% CTR

### AI Model
- Switched to Claude Sonnet 4 (`claude-sonnet-4-20250514`) for code generation

---

## [1.5.0] - 2026-01-01
### The Singularity Brand & Freemium Pivot
-   **Credits:** Unified free usage pool to 9 total actions (build/refine/ghost) via `FREE_TOTAL_CREDITS` / `NEXT_PUBLIC_FREE_TOTAL_CREDITS` with server-side tracking.
-   **Brand Unification:** Established "The Definitive HatchIt" (Emerald Egg) as the primary logo and "The Architect" (Violet Cube) as the AI persona.
-   **Visual Identity:** Updated all site headers, favicons, and social assets to match the new V3 "Hatching" aesthetic.
-   **Business Model:** Pivoted to **Freemium**. Free users can build/preview; Paid users (Pro/Agency) can export/deploy.
-   **Engine Upgrade:** Switched Builder Engine from Claude 3.5 Sonnet to **GPT-5.1-Codex-Max** (OpenAI).
-   **Infrastructure:** Configured Local Sandbox for full Stripe Test Mode simulation (Sign Up -> Build -> Upgrade).
-   **Maintenance:** Added `<MaintenanceOverlay />` to lock production builder during the engine upgrade (bypassed in local dev).

## [1.4.0] - 2026-01-01
### The "Ultra Audit" & Marketing Launch
-   **Performance:** Lazy-loaded `@babel/standalone` to reduce initial bundle size and improve TTI (Time to Interactive).
-   **Optimization:** Refactored `TheSubconscious` to remove expensive `mousemove` event listeners, saving user battery life.
-   **Analytics:** Integrated **Google Analytics 4** (`@next/third-parties`) with IP-blocking logic to exclude the Founder's traffic.
-   **Security:** Updated `Permissions-Policy` in `next.config.ts` to allow Microphone access (fixing Voice Input).
-   **Marketing:** Created high-fidelity SVG assets for Reddit Ads (Desktop, Mobile, Short).
-   **Strategy:** Finalized `GOOGLE_ADS_READY.md` and `REDDIT_ORGANIC_POSTS.md` for the Jan 1st launch.

---

## [1.3.0] - 2025-12-31
### The Engineer's Update
- **Core User Journey Audit**: Fixed critical breaks in onboarding, dashboard, and builder initialization.
- **Onboarding Persistence**: User data is now saved and correctly hydrates the builder.
- **Dashboard Actions**: Added "New Project" and "Continue Setup" flows.
- **Robust Preview**: Rewrote regex engine to handle complex AI-generated code without crashing.
- **System Stability**: Verified deployment and export pipelines.

---

## [1.2.1] - 2025-12-28
### Fixed
- **Contact page generation**: AI now generates working contact forms that render in preview
- Forms use client-side state with visual feedback instead of form actions that break preview
- Better TypeScript type stripping (React.FormEvent, ChangeEvent, etc.)

### Changed
- System prompt updated with explicit contact form pattern that works in preview
- Code cleaning now handles more event type annotations

---

## [1.2.0] - 2025-12-28
### Added
- **Required project naming**: New projects must be named (no more random names)
- **Welcome Back modal**: Shows on new device when you have cloud projects, auto-pulls paid projects
- **Sync from Cloud button**: Always accessible in menu to pull deployed projects

### Changed
- Cross-device experience: Paid (Go Hatched) projects now sync automatically on new devices
- Menu now shows badge when cloud projects available to pull

---

## [1.1.8] - 2025-12-28
### Fixed
- Payment success now forces page reload to sync Clerk subscription metadata
- Fixes issue where paid subscription reverted to free after checkout

### Added
- Code view button on mobile (next to Preview button)

---

## [1.1.7] - 2025-12-28
### Changed
- Updated pricing copy: "$24 to launch, then $19/mo"
- Removed misleading "50% off" references
- Removed annual pricing mention (not currently offered)
- Simplified pricing message across homepage, modals, FAQ

---

## [1.1.6] - 2025-12-28
### Changed
- Renamed "Generate" to "Build" for consistency
- Clarified mode descriptions: Build creates/edits, Ask AI advises without changing code
- Updated tooltips and button labels throughout

---

## [1.1.5] - 2025-12-28
### Added
- Start Over button for non-deployed projects in builder
- Upload Code modal with guidelines before file selection
- Improved Help & FAQ modal with link to full FAQ page

### Fixed
- FAQ modal not showing on desktop
- Mobile responsiveness for hero preview CTA

---

## [1.1.4] - 2025-12-28
### Changed
- New pricing structure: $24 first month (50% early bird), $19/mo ongoing
- Annual pricing: $190/year (save 2 months)
- Updated all pricing references across homepage, builder, FAQ, modals

---

## [1.1.3] - 2025-12-28
### Added
- Deploy warning step before publish
- Social proof section with trust indicators
- Animated hero preview placeholder with CTA
