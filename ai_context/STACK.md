# HATCHIT STACK
> Technical reference. Single source of truth.
> Last Updated: January 9, 2026 (Session 3)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           ROUTES                                │
├──────────────────────────────┬──────────────────────────────────┤
│  /demo (Guest)               │  /builder (Auth)                 │
│  • isDemo=true               │  • isDemo=false                  │
│  • userTier='demo'           │  • userTier from subscription    │
│  • localStorage persistence  │  • Supabase persistence          │
│  • Redirect if signed in     │  • Redirect if not signed in     │
│  • Hero section only         │  • Full section access           │
└──────────────────────────────┴──────────────────────────────────┘
                    ↓                        ↓
              BuildFlowController (components/BuildFlowController.tsx)
                    ↓                        ↓
              SectionBuilder (components/SectionBuilder.tsx)
```

---

## Shipping Pipeline (THE MOAT)

```
User Input → AI Generation → Preview → Ship
                                        ↓
                    ┌───────────────────┼───────────────────┐
                    ↓                   ↓                   ↓
            Push to GitHub      Deploy to Vercel      Download ZIP
            (user's repo)       (hatchitsites.dev)    (source code)
```

**This is the differentiator:** Users own their code, their GitHub, their deployment.

---

## Component Map

### Core Flow Components
| File | Purpose | Used By |
|------|---------|---------|
| `components/BuildFlowController.tsx` | Project loading, section orchestration, Ship dropdown | `/demo`, `/builder` |
| `components/SectionBuilder.tsx` | Generation UI, preview, refine | BuildFlowController |
| `components/SectionPreview.tsx` | Live iframe preview | SectionBuilder |
| `components/SectionProgress.tsx` | Section list sidebar | BuildFlowController |

### Welcome/Entry Modals
| File | Purpose | Trigger |
|------|---------|---------|
| `components/HomepageWelcome.tsx` | First visit modal | `/` (homepage) |
| `components/DemoWelcome.tsx` | Guest sandbox intro | `/demo` first visit |
| `components/BuilderWelcome.tsx` | Auth user intro | `/builder` first visit |

### Bottom Bars (SectionBuilder.tsx internal)
| Component | Condition | Purpose |
|-----------|-----------|---------|
| `DemoCommandBar` | `isDemo && (stage === 'input' \|\| stage === 'complete')` | Initial prompt + refine for guests |
| `AuthRefineBar` | `!isDemo && stage === 'complete'` | Refine + Next for auth users |
| Generating bar | `showGenerating` (stage=generating && !code) | Building status |
| Refining bar | `stage === 'refining'` | Refining status |

### Build Stages (SectionBuilder.tsx)
```
'input'      → User entering prompt (no code yet)
'generating' → Calling Claude, streaming code
'complete'   → Code ready, preview showing
'refining'   → Calling Claude for refinement
```

### Modals
| File | Purpose |
|------|---------|
| `components/HatchModal.tsx` | Sign-up prompt (paywall) |
| `components/BuildSuccessModal.tsx` | After first build (guests) |
| `components/ReplicatorModal.tsx` | URL cloning (Singularity tier) |
| `components/SiteSettingsModal.tsx` | Brand config |

### Loading States
| File | Purpose | Used Where |
|------|---------|------------|
| `components/singularity/SingularityLoader.tsx` | Full-page loading | `/demo`, `/builder` auth check |
| `components/singularity/SingularityTransition.tsx` | Homepage → Builder transition | `/` → `/demo` or `/builder` |
| `components/builder/GeneratingModal.tsx` | Generating overlay | SectionBuilder |

### Layout
| File | Purpose |
|------|---------|
| `components/Navigation.tsx` | Top nav |
| `components/Footer.tsx` | Footer |
| `components/ConditionalNavigation.tsx` | Hide nav on builder routes |
| `components/ConditionalFooter.tsx` | Hide footer on builder routes |
| `components/Logo.tsx` | Logo component |

### Utilities
| File | Purpose |
|------|---------|
| `components/ErrorBoundary.tsx` | React error boundary |
| `components/UserSync.tsx` | Clerk → Supabase user sync |
| `components/ServiceWorkerRegistration.tsx` | PWA |
| `components/ConditionalAnalytics.tsx` | GA4 |
| `components/ContactButton.tsx` | Floating contact button |
| `components/SubscriptionIndicator.tsx` | Tier badge |
| `components/GuestCreditBadge.tsx` | Guest build count |
| `components/PaywallTransition.tsx` | Animation for paywall |
| `components/PremiumFeaturesShowcase.tsx` | Feature comparison |

### Singularity UI Kit (components/singularity/)
| File | Purpose | Exports |
|------|---------|---------|
| `Button.tsx` | Styled button | Button |
| `Input.tsx` | Styled input | Input |
| `Modal.tsx` | Styled modal | Modal |
| `Card.tsx` | Styled card | Card |
| `Badge.tsx` | Tier badges | Badge |
| `TheWitness.tsx` | Session analysis sidebar | TheWitness |
| `SingularityLoader.tsx` | Loading spinner | SingularityLoader |
| `SingularityTransition.tsx` | Page transition | SingularityTransition |

### Builder Helpers (components/builder/)
| File | Purpose |
|------|---------|
| `GeneratingModal.tsx` | Overlay during generation |
| `FullSitePreviewFrame.tsx` | Full-site preview iframe (always desktop view) |
| `LiveSidebar.tsx` | Desktop sidebar with section nav, reordering, Add Section (exported as `Sidebar`) |

### BuildFlowController Deep Dive
**File:** `components/BuildFlowController.tsx` (~2900 lines)

**Phases:**
```
'initializing' → Loading project/template data
'building'     → Section-by-section generation (main builder UI)
'review'       → Full site preview, deploy options
```

**Build Stages (within 'building' phase):**
```
'input'      → User entering prompt (no code yet)
'generating' → Calling Claude, streaming code
'complete'   → Code ready, preview showing
'refining'   → Calling Claude for refinement
```

**Preview Panels (January 9 Simplification):**
- Both build and review phases show responsive desktop preview
- No device toggles (mobile/tablet/desktop removed)
- No pop-out modal for expanded preview
- `FullSitePreviewFrame` always receives `deviceView="desktop"`

**Demo Mode Restrictions:**
- `userTier === 'demo'` hides "Add Section" button
- Demo users can only build the hero section

---

## Hooks

| File | Purpose | Returns |
|------|---------|---------|
| `hooks/useProjects.ts` | Project CRUD, subscription state | projects, limits, CRUD functions |
| `hooks/useGitHub.ts` | GitHub OAuth + push | connect, disconnect, push, checkStatus |

---

## DEAD CODE (Safe to Delete)

| File | Reason |
|------|--------|
| `components/BuildProgressDisplay.tsx` | ✅ DELETED - 0 imports |
| `components/singularity/SingularitySidebar.tsx` | ✅ DELETED - 0 imports |
| `components/GuestPromptModal.tsx` | ✅ DELETED - replaced by DemoCommandBar |
| `components/builder/_archive/` | ✅ DELETED - archive folder |
| `components/Pip.tsx` | ✅ SHELVED - File kept, all usages removed (Jan 8) |

### Pip Usage (CLEANED UP - Jan 8)
All Pip usages removed. File shelved at `components/Pip.tsx` (not deleted).

Replaced with:
- `app/dashboard/page.tsx` - Simple spinners and "It" branded boxes
- `components/singularity/SingularityTransition.tsx` - "It" logo box
- `components/builder/GeneratingModal.tsx` - Terminal icon

---

## Branding (Updated Jan 8, 2026)

### Tagline
**"Describe it. Build it. Ship it."**

### Messaging
- **Main:** AI-assisted website building. Your code, your repo, your site.
- **Differentiator:** AI-assisted React websites → Your GitHub → Live

### Logo
- Favicon: "It" text in emerald on zinc-900 box (`/app/icon.svg`)
- OG Images: "It" logo + HatchIt title + tagline

### Twitter Handle
`@HatchItDev`

---

## API Routes

### Generation & Building
| Route | Model | Purpose |
|-------|-------|---------|
| `/api/build-section` | Claude Sonnet 4.5 | Code generation (uses component library) |
| `/api/refine-section` | Claude Sonnet 4.5 | Iterative changes |
| `/api/generate` | Claude Sonnet 4.5 | Alternate generation endpoint |
| `/api/heal` | Claude Haiku 4.5 | Auto-fix runtime errors (Visionary+) |
| `/api/audit` | Claude Sonnet 4.5 | Final quality check (Visionary+) |
| `/api/witness` | Claude Haiku 4.5 | Session analysis |
| `/api/replicator` | Gemini 2.0 Flash | URL cloning (Singularity) |
| `/api/prompt-helper` | Gemini 2.0 Flash | Prompt improvement |

### GitHub Integration (NEW - Jan 8, 2026)
| Route | Purpose | Tier |
|-------|---------|------|
| `/api/github/auth` | Initiate OAuth flow | Architect+ |
| `/api/github/callback` | Handle OAuth callback, store token in Clerk | Architect+ |
| `/api/github/push` | Create repo + push full Next.js project | Architect+ |
| `/api/github/status` | Check if GitHub connected | Architect+ |
| `/api/github/disconnect` | Remove GitHub connection | Architect+ |

### Deployment & Export
| Route | Purpose | Tier |
|-------|---------|------|
| `/api/deploy` | Deploy to Vercel (hatchitsites.dev) | Architect+ |
| `/api/export` | Download code as ZIP | Architect+ |
| `/api/domain` | Custom domain management (Vercel API) | Visionary+ |

### Project & User
| Route | Purpose |
|-------|---------|
| `/api/project` | CRUD operations |
| `/api/section` | Section management |
| `/api/checkout` | Stripe checkout |
| `/api/subscription` | Tier management |
| `/api/webhook` | Stripe webhooks |

---

## Library Files

### Core Libraries
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client + types |
| `lib/db/index.ts` | Database operations |
| `lib/templates.ts` | Website templates (Website, Landing, Portfolio, etc.) |
| `lib/components.ts` | **NEW** - Pre-built component library for AI reference |
| `lib/chronosphere.ts` | User style DNA tracking |
| `lib/build-progress.ts` | Build progress utilities |
| `lib/project-utils.ts` | Project helpers |

### Component Library (lib/components.ts) - NEW Jan 8, 2026
AI-referenced component library with minimal, curated variants:

| Category | Variants |
|----------|----------|
| `buttons` | solid, outline, ghost, pill, icon |
| `cards` | simple, elevated, icon-top, stat |
| `heroes` | centered, left-aligned, split, minimal |
| `navs` | simple, minimal, transparent |
| `features` | grid-3, alternating, bento |
| `testimonials` | single, grid |
| `pricing` | three-tier, simple |
| `footers` | simple, columns |
| `ctas` | simple, contact-form |
| `forms` | input, email-capture |

**Purpose:** Prevents generic "SaaS look" by giving AI specific patterns to customize.

---

## Tiers (ACCURATE - Updated Jan 8, 2026)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Unlimited AI generations, preview, 1 project. **Cannot deploy or export.** |
| **Architect** | $19/mo | Deploy to hatchitsites.dev, ZIP export, GitHub push, 3 projects |
| **Visionary** | $49/mo | Unlimited projects, custom domain, Auditor, Healer, remove branding |
| **Singularity** | $199/mo | Replicator (clone sites), white-label, API access, priority support |

### Tier Access by Feature
| Feature | Free | Architect | Visionary | Singularity |
|---------|------|-----------|-----------|-------------|
| AI Generation | ✅ | ✅ | ✅ | ✅ |
| Live Preview | ✅ | ✅ | ✅ | ✅ |
| Deploy to subdomain | ❌ | ✅ | ✅ | ✅ |
| Download ZIP | ❌ | ✅ | ✅ | ✅ |
| Push to GitHub | ❌ | ✅ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ❌ | ✅ | ✅ |
| The Auditor | ❌ | ❌ | ✅ | ✅ |
| The Healer | ❌ | ❌ | ✅ | ✅ |
| The Replicator | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ❌ | ✅ |

### Files with Tier Info (keep in sync)
- `types/subscriptions.ts` - Source of truth
- `app/dashboard/billing/page.tsx` - Billing UI
- `components/HatchModal.tsx` - Paywall modal
- `components/PaywallTransition.tsx` - Transition pricing

---

## Environment Variables

### Required
```env
ANTHROPIC_API_KEY=           # Claude API
GEMINI_API_KEY=              # Gemini API
NEXT_PUBLIC_SUPABASE_URL=    # Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_ARCHITECT_PRICE_ID=   # $19/mo
STRIPE_VISIONARY_PRICE_ID=   # $49/mo
STRIPE_SINGULARITY_PRICE_ID= # $199/mo
VERCEL_TOKEN=                # For deployments
VERCEL_TEAM_ID=
```

### GitHub Integration (NEW)
```env
GITHUB_CLIENT_ID=            # OAuth App Client ID
GITHUB_CLIENT_SECRET=        # OAuth App Secret
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.1 |
| React | 19.2.3 |
| Styling | Tailwind 4.1.18 |
| Animation | Framer Motion 12 |
| Auth | Clerk 6.36.5 |
| Database | Supabase 2.89.0 |
| Payments | Stripe 20.1.0 |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Key Decisions Log

### January 9, 2026 (Session 3 - UX REFINEMENT)
1. **Preview Simplification** - Removed device toggles, made preview responsive desktop only
2. **Demo Restrictions** - Add Section button hidden for demo users (hero only)
3. **Icon Standardization** - All interactive icons now 16px (`w-4 h-4`) minimum
4. **Build Error Fixes** - Removed invalid `'draft'` status check, added type guards
5. **Duplicate Loader Fix** - Removed redundant SingularityLoader return

### January 8, 2026 (Session 2 - LAUNCH PREP)
1. **Pip Cleanup** - Removed all Pip usages, replaced with "It" branding
2. **New Favicon** - "It" in emerald on zinc-900 (`/app/icon.svg`)
3. **OG Images Updated** - New share cards with tagline and subtext
4. **Metadata Standardized** - Consistent tagline across all pages
5. **Reddit Post Rewritten** - Addresses "text-to-markup" criticism with honest angle

### January 8, 2026 (Session 1)
1. **GitHub Integration Built** - Full OAuth flow with push to user's GitHub
2. **Component Library Added** - Pre-built components to prevent generic AI output
3. **Tier Features Standardized** - All pricing pages now match reality
4. **The Moat = Pipeline** - Not AI generation, but the full ship flow (GitHub → Vercel → Own Code)

### January 7, 2026
1. **Pip Mascot Concept** - Originally created, now shelved
2. **Sidebar Unified** - Same component for demo and auth
3. **Three-AI System** - Builder (Sonnet), Healer (Haiku), Vision (Gemini)
