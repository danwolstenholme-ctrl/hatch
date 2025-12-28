# Changelog

All notable changes to HatchIt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Guide
- **MAJOR** (x.0.0): Breaking changes, major redesigns
- **MINOR** (1.x.0): New features, significant improvements
- **PATCH** (1.1.x): Bug fixes, small tweaks, copy changes

---

## [1.1.6] - 2024-12-28
### Changed
- Renamed "Generate" to "Build" for consistency
- Clarified mode descriptions: Build creates/edits, Ask AI advises without changing code
- Updated tooltips and button labels throughout

---

## [1.1.5] - 2024-12-28
### Added
- Start Over button for non-deployed projects in builder
- Upload Code modal with guidelines before file selection
- Improved Help & FAQ modal with link to full FAQ page

### Fixed
- FAQ modal not showing on desktop
- Mobile responsiveness for hero preview CTA

---

## [1.1.4] - 2024-12-28
### Changed
- New pricing structure: $24 first month (50% early bird), $19/mo ongoing
- Annual pricing: $190/year (save 2 months)
- Updated all pricing references across homepage, builder, FAQ, modals

---

## [1.1.3] - 2024-12-28
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

## [1.1.2] - 2024-12-28
### Added
- TypeScript types extraction (`types/builder.ts`)
- Project utilities module (`lib/project-utils.ts`)
- useProjects hook (`hooks/useProjects.ts`)

---

## [1.1.1] - 2024-12-28
### Added
- ErrorBoundary component with fallback UI
- Loading skeleton for builder page (`loading.tsx`)
- Security headers in Next.js config

---

## [1.0.0] - 2024-12-27
### Added
- Initial release of HatchIt
- AI-powered website builder
- Real-time code preview
- One-click Vercel deployment
- Custom domain support
- Stripe subscription integration
