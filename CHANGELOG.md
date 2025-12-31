# Changelog

All notable changes to HatchIt.dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Guide
- **MAJOR** (x.0.0): Breaking changes, major redesigns
- **MINOR** (1.x.0): New features, significant improvements
- **PATCH** (1.1.x): Bug fixes, small tweaks, copy changes

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
- Three-step "How it works" section
- Example prompts in chat interface
- Improved onboarding timing

### Changed
- Renamed "Assistant" tab to "AI Code Editor"
- Updated CTAs for clarity (Build → Start Building)
- Fixed 'g' cutoff in gradient headings
- Updated support email to support@hatchit.dev
- Changed "Build unlimited" to "10 free builds per day"

---

## [1.1.2] - 2025-12-28
### Added
- TypeScript types extraction (`types/builder.ts`)
- Project utilities module (`lib/project-utils.ts`)
- useProjects hook (`hooks/useProjects.ts`)

---

## [1.1.1] - 2025-12-28
### Added
- ErrorBoundary component with fallback UI
- Loading skeleton for builder page (`loading.tsx`)
- Security headers in Next.js config

---

## [1.0.0] - 2025-12-27
### Added
- Initial release of HatchIt.dev
- AI-powered website builder
- Real-time code preview
- One-click Vercel deployment
- Custom domain support
- Stripe subscription integration
