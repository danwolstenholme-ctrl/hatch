# Changelog

All notable changes to HatchIt.dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Guide
- **MAJOR** (x.0.0): Breaking changes, major redesigns
- **MINOR** (1.x.0): New features, significant improvements
- **PATCH** (1.1.x): Bug fixes, small tweaks, copy changes

---

## [1.5.0] - 2026-01-01
### The Singularity Brand & Freemium Pivot
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
