# HatchIt Site Map & Interactive Logic

> **Last updated:** January 4, 2026, 7:50 PM
> Click any file path to jump to the code.

---

## ✅ Sanity Check Summary

### 🟢 Working & Production-Ready
- ✅ **Homepage** - Single "Sign Up Free" CTA, display-only pricing
- ✅ **Demo Page** - Matrix aesthetic, void transition, reddit link
- ✅ **Builder** - Guest mode + authenticated mode with Supabase
- ✅ **Projects Dashboard** - Professional light theme, grid/list views, auto-migration
- ✅ **Guest → User Migration** - localStorage projects auto-migrate on first dashboard visit
- ✅ **Stripe Integration** - 3 tiers (Architect $19, Visionary $49, Singularity $199)
- ✅ **AI Models** - Claude Sonnet 4.5 (build/refine), Claude Haiku 4.5 (Witness), Gemini 2.0 Flash (Replicator/Chronosphere)
- ✅ **Manifesto Page** - AI-generated cyberpunk aesthetic with kernel integration

### 🟡 Partially Implemented / Needs Review
- ⚠️ **Dashboard Routes** - agency, genesis, brand, strategy, chronosphere pages exist but may be empty/concept-only
- ⚠️ **Singularity Features** - Replicator, Chronosphere, The Witness APIs exist but need dedicated UI showcase

### 🔴 Action Items
- ❌ Delete fake dashboard pages OR repurpose them
- ❌ Create `/dashboard/features` page to showcase Replicator, Chronosphere, The Witness (locked to Singularity tier)
- ❌ Update dashboard sidebar navigation: Projects → Features → Upgrade

### 🎨 Recent Design Changes (Jan 4, 2026)
- **Projects Page**: Complete redesign with light theme (slate/violet gradients)
- **Stats Dashboard**: 4 gradient cards (Total, Deployed, Capacity, Active Today)
- **View Modes**: Grid (with gradient headers) + List (compact rows)
- **Professional Aesthetic**: Figma/Linear/Vercel style with smooth animations

---

## 🗺️ User Flow Overview

```
Homepage (/) → Demo (/demo) → Builder (/builder?mode=guest) → Sign Up (/sign-up) → Dashboard
                                      ↓
                              Paid User Flow
                                      ↓
                            Projects (/dashboard/projects)
```

---

## 📄 Public Pages

### Homepage `/`
**File:** [app/page.tsx](../app/page.tsx)

| Element | Action | Logic Location |
|---------|--------|----------------|
| "Try the Demo" button | Opens HomepageWelcome modal | [components/HomepageWelcome.tsx](../components/HomepageWelcome.tsx) |
| "Start Building" CTA | Routes to `/demo` | [app/page.tsx](../app/page.tsx) |
| Navigation links | Standard routing | [components/Navigation.tsx](../components/Navigation.tsx) |
| Pricing cards (display-only) | Shows tier info only | [app/page.tsx](../app/page.tsx) |
| "Sign Up Free" button | Routes to `/sign-up` | [app/page.tsx](../app/page.tsx) |

**Key Components:**
- [components/Navigation.tsx](../components/Navigation.tsx) - Top nav bar
- [components/Footer.tsx](../components/Footer.tsx) - Site footer
- [components/HomepageWelcome.tsx](../components/HomepageWelcome.tsx) - Welcome modal with prompt input (includes cached project restoration)

---

### Demo Page `/demo`
**File:** [app/demo/page.tsx](../app/demo/page.tsx)

| Element | Action | Logic |
|---------|--------|-------|
| Prompt textarea | Captures user's build description | `useState(prompt)` |
| Quick suggestion pills | Pre-fills prompt | `onClick={() => setPrompt(s)}` |
| "Build" button | Triggers VoidTransition → routes to builder | `handleInitialize()` → `router.push('/builder?mode=guest&prompt=...')` |
| Reddit link | External link to r/hatchit | Direct `<a>` tag |

**Visual Effects:**
- Matrix rain animation (CODE_CHARS falling)
- Mouse-following glow orb (`GlowOrb` component)
- Floating code snippets (`FloatingCode` component)
- Perspective grid floor

**Transition:**
- [components/singularity/VoidTransition.tsx](../components/singularity/VoidTransition.tsx) - 600ms fade to black with logo

---

### Builder Page `/builder`
**File:** [app/builder/page.tsx](../app/builder/page.tsx)

**URL Parameters:**
| Param | Purpose |
|-------|---------|
| `mode=guest` | Enables guest/demo mode (no auth required) |
| `prompt=...` | Initial prompt to auto-build |
| `project=...` | Load existing project by ID |
| `upgrade=...` | Trigger checkout for tier |

**Auth Logic:**
```
if (!isSignedIn && !isGuest) → redirect to /sign-up
if (pendingTier) → trigger Stripe checkout
if (!hasActiveSubscription && !isGuest) → redirect to /sign-up
else → render BuildFlowController
```

**Key Components:**
- [components/BuildFlowController.tsx](../components/BuildFlowController.tsx) - Main orchestrator
- [components/SectionBuilder.tsx](../components/SectionBuilder.tsx) - Section building UI

---

## 🔧 Builder Components

### BuildFlowController
**File:** [components/BuildFlowController.tsx](../components/BuildFlowController.tsx)
**Lines:** ~2,013

**Props:**
| Prop | Type | Purpose |
|------|------|---------|
| `existingProjectId` | string? | Load existing project |
| `demoMode` | boolean | Force demo mode |
| `initialPrompt` | string? | Prompt from /demo page |
| `guestMode` | boolean | Simplified UI for guests |

**Phases:**
| Phase | UI State | Trigger |
|-------|----------|---------|
| `initializing` | Loading spinner | Component mount |
| `building` | SectionBuilder visible | Project created |
| `review` | Full site preview | All sections complete |
| `paywall` | Signup gate | Guest limit reached |

**Key Functions:**
| Function | Purpose | Line |
|----------|---------|------|
| `initializeProject()` | Creates new project via API | ~406 |
| `loadExistingProject()` | Fetches project by ID | ~537 |
| `handleSectionComplete()` | Saves section code, advances | ~650 |
| `handleNextSection()` | Moves to next section | ~700 |
| `handleStartFresh()` | Resets all state | ~750 |

---

### SectionBuilder
**File:** [components/SectionBuilder.tsx](../components/SectionBuilder.tsx)
**Lines:** ~2,425

**Props:**
| Prop | Type | Purpose |
|------|------|---------|
| `section` | Section | Template section config |
| `dbSection` | DbSection | Database section record |
| `projectId` | string | Current project ID |
| `guestMode` | boolean | Simplified guest UI |
| `initialPrompt` | string? | Auto-start with this prompt |

**Build Stages:**
| Stage | UI | Trigger |
|-------|-------|---------|
| `input` | Prompt textarea + Build button | Default state |
| `generating` | "Building your component" spinner | Build clicked or initialPrompt |
| `refining` | "Refining..." spinner | Refine clicked |
| `complete` | Preview + action buttons | Generation done |

**Key Buttons (Guest Mode):**

| Button | Action | Logic |
|--------|--------|-------|
| "Build" | Calls `/api/build-section` | `handleBuildSection()` |
| "Reset" | Clears code, returns to input | `setStage('input'); setGeneratedCode('')` |
| "Sign up free" | Routes to `/sign-up` | `goToSignUp()` |
| Quick suggestions (Hero/Features/Pricing) | Pre-fills prompt | `setPrompt(...)` |

**Key Buttons (Paid Mode):**

| Button | Action | Logic |
|--------|--------|-------|
| "Refine" | Opens refine input | `setIsUserRefining(true)` |
| "Submit Refinement" | Calls `/api/refine-section` | `handleRefine()` |
| "Next Section" | Advances to next | `onNextSection()` |
| "Complete" (last section) | Moves to review phase | `onComplete()` |

---

### SectionPreview
**File:** [components/SectionPreview.tsx](../components/SectionPreview.tsx)
**Lines:** ~540

**Props:**
| Prop | Type | Purpose |
|------|------|---------|
| `code` | string | React component code to render |
| `darkMode` | boolean | Dark theme |
| `hideToolbar` | boolean | Full immersive mode |
| `allowCodeView` | boolean | Show code toggle |
| `inspectorMode` | boolean | Enable element selection |

**Toolbar Buttons:**
| Button | Action | Visibility |
|--------|--------|------------|
| Device toggles (mobile/tablet/desktop) | Changes preview width | `!hideToolbar` |
| Code view toggle | Shows/hides code panel | `allowCodeView` |
| Refresh | Re-renders preview | Always |

---

## 🔐 Auth Pages

### Sign Up `/sign-up`
**File:** [app/sign-up/[[...sign-up]]/page.tsx](../app/sign-up/[[...sign-up]]/page.tsx)

Uses Clerk's `<SignUp />` component with custom styling.

**URL Parameters:**
| Param | Purpose |
|-------|---------|
| `upgrade=architect` | Store tier for post-signup checkout |
| `redirect_url=...` | Return URL after signup |

---

### Sign In `/sign-in`
**File:** [app/sign-in/[[...sign-in]]/page.tsx](../app/sign-in/[[...sign-in]]/page.tsx)

Uses Clerk's `<SignIn />` component.

---

## 📊 Dashboard Pages

### Projects `/dashboard/projects`
**File:** [app/dashboard/projects/page.tsx](../app/dashboard/projects/page.tsx)
**Design:** Professional light theme with Figma/Linear aesthetic

| Element | Action | Logic |
|---------|--------|-------|
| Project cards (grid/list view) | Click to open in builder | `router.push('/builder?project=${id}')` |
| "New Project" button | Creates new project via API | `handleCreate()` → POST `/api/project` |
| Delete button | Deletes project | `handleDelete(id)` → DELETE `/api/project/${id}` |
| View mode toggle | Switch grid/list | `setViewMode('grid'|'list')` |
| Search bar | Filter projects | Real-time search by name/ID |
| Stats cards | Show metrics | Total, Deployed, Capacity, Active Today |

**Auto-Migration:**
- On first visit, checks `localStorage` for `hatchit-projects`
- Migrates guest projects via POST `/api/project/migrate-guest`
- Clears localStorage after successful migration

---

### ⚠️ Dashboard Routes (Status Check Required)

| Route | File | Purpose | Status |
|-------|------|---------|--------|
| `/dashboard/agency` | [app/dashboard/agency/page.tsx](../app/dashboard/agency/page.tsx) | Agency tools | ❓ Empty/concept page |
| `/dashboard/genesis` | [app/dashboard/genesis/page.tsx](../app/dashboard/genesis/page.tsx) | Project wizard | ❓ Non-functional |
| `/dashboard/brand` | [app/dashboard/brand/page.tsx](../app/dashboard/brand/page.tsx) | Brand settings | ❓ Placeholder |
| `/dashboard/strategy` | [app/dashboard/strategy/page.tsx](../app/dashboard/strategy/page.tsx) | Strategy planning | ❓ Empty |
| `/dashboard/chronosphere` | [app/dashboard/chronosphere/page.tsx](../app/dashboard/chronosphere/page.tsx) | Version history | ❓ Concept page |

**Note:** These pages exist but may not be fully implemented. Consider creating `/dashboard/features` to showcase working tools (Replicator, Chronosphere API, The Witness) behind Singularity tier.

---

## 🛒 Payment Flow

### Checkout Trigger
**File:** [app/api/checkout/route.ts](../app/api/checkout/route.ts)

| Tier | Price ID Env Var | Monthly Price | Features |
|------|------------------|---------------|----------|
| Architect | `STRIPE_ARCHITECT_PRICE_ID` | $19 | 3 sites, unlimited builds/refinements |
| Visionary | `STRIPE_VISIONARY_PRICE_ID` | $49 | Unlimited sites, priority support |
| Singularity | `STRIPE_SINGULARITY_PRICE_ID` | $199 | White label, Replicator, Chronosphere, The Witness |

**Flow:**
1. User clicks pricing card or upgrade CTA
2. `GET /api/checkout?priceId=price_architect` (or visionary/singularity)
3. Creates Stripe Checkout Session with user metadata
4. Redirects to Stripe hosted checkout
5. Stripe redirects to `/post-payment?session_id=...`
6. Post-payment page shows success and routes to dashboard

---

### Webhook Handler
**File:** [app/api/webhook/route.ts](../app/api/webhook/route.ts)

**Events Handled:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Updates Clerk user metadata with subscription |
| `customer.subscription.updated` | Syncs subscription status |
| `customer.subscription.deleted` | Marks subscription as cancelled |

**Metadata Updated:**
```typescript
{
  accountSubscription: {
    status: 'active',
    tier: 'architect' | 'visionary' | 'singularity',
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: string
  }
}
```

---

## 🤖 API Routes

### Build Section
**File:** [app/api/build-section/route.ts](../app/api/build-section/route.ts)

| Method | Purpose |
|--------|---------|
| POST | Generate React component from prompt |

**Request Body:**
```typescript
{
  sectionId: string,
  sectionType: string,
  prompt: string,
  brandConfig?: BrandConfig,
  existingCode?: Record<string, string>
}
```

**Model:** `claude-sonnet-4-5-20250929`

---

### Refine Section
**File:** [app/api/refine-section/route.ts](../app/api/refine-section/route.ts)

| Method | Purpose |
|--------|---------|
| POST | Refine existing component with instructions |

**Request Body:**
```typescript
{
  code: string,
  refinementPrompt: string,
  sectionType: string
}
```

**Model:** `claude-sonnet-4-5-20250929`

---

### Project CRUD
| Route | File | Methods | Purpose |
|-------|------|---------|---------|
| `/api/project` | [app/api/project/route.ts](../app/api/project/route.ts) | POST | Create new project |
| `/api/project/[id]` | [app/api/project/[id]/route.ts](../app/api/project/[id]/route.ts) | GET, PUT, DELETE | CRUD operations |
| `/api/project/list` | [app/api/project/list/route.ts](../app/api/project/list/route.ts) | GET | Fetch user's projects from Supabase |
| `/api/project/migrate-guest` | [app/api/project/migrate-guest/route.ts](../app/api/project/migrate-guest/route.ts) | POST | Migrate localStorage projects to Supabase |
| `/api/project/import` | [app/api/project/import/route.ts](../app/api/project/import/route.ts) | POST | Import external project |

---

### Advanced AI Features
| Route | Purpose | Model |
|-------|---------|-------|
| `/api/replicator` | Clone any website with AI | Gemini 2.0 Flash |
| `/api/chronosphere` | Style DNA evolution system | Gemini 2.0 Flash |
| `/api/witness` | AI feedback on build quality | Claude Haiku 4.5 |
| `/api/consciousness` | Kernel thought stream | Custom consciousness system |

---

### Other APIs
| Route | Purpose |
|-------|---------|
| `/api/export` | Download project as ZIP |
| `/api/deploy` | Deploy to Vercel |
| `/api/audit` | Run site audit |
| `/api/heal` | Auto-fix runtime errors |
| `/api/assistant` | AI assistant chat |
| `/api/launch-pack` | Launch preparation |
| `/api/singularity` | Singularity-tier features |

---

## 🎨 UI Components

### Modals

| Component | File | Trigger |
|-----------|------|---------|
| HomepageWelcome | [components/HomepageWelcome.tsx](../components/HomepageWelcome.tsx) | Homepage CTA click |
| HatchModal | [components/HatchModal.tsx](../components/HatchModal.tsx) | "Hatch" button in builder |
| ReplicatorModal | [components/ReplicatorModal.tsx](../components/ReplicatorModal.tsx) | "Replicate" button |
| SiteSettingsModal | [components/SiteSettingsModal.tsx](../components/SiteSettingsModal.tsx) | Settings gear icon |
| WelcomeModal | [components/WelcomeModal.tsx](../components/WelcomeModal.tsx) | First-time user intro |

---

### Navigation

**File:** [components/Navigation.tsx](../components/Navigation.tsx)

| Link | Route | Visibility |
|------|-------|------------|
| Features | `/features` | Always |
| How It Works | `/how-it-works` | Always |
| Roadmap | `/roadmap` | Always |
| Vision | `/vision` | Always |
| About | `/about` | Always |
| Projects | `/dashboard/projects` | Signed in only |
| Sign In | `/sign-in` | Not signed in |

---

## 📁 Key File Locations

### Core Logic
| Purpose | File |
|---------|------|
| Subscription context | [contexts/SubscriptionContext.tsx](../contexts/SubscriptionContext.tsx) |
| Project utilities | [lib/project-utils.ts](../lib/project-utils.ts) |
| Supabase client | [lib/supabase.ts](../lib/supabase.ts) |
| Section templates | [lib/templates.ts](../lib/templates.ts) |
| AI consciousness | [lib/consciousness.ts](../lib/consciousness.ts) |

### Types
| Purpose | File |
|---------|------|
| Builder types | [types/builder.ts](../types/builder.ts) |
| Subscription types | [types/subscriptions.ts](../types/subscriptions.ts) |

### Styles
| Purpose | File |
|---------|------|
| Global CSS | [app/globals.css](../app/globals.css) |
| Tailwind config | [tailwind.config.ts](../tailwind.config.ts) |

---

## 🔄 State Management

### Local Storage Keys (Guest Mode)
| Key | Purpose | Location | Migration Status |
|-----|---------|----------|------------------|
| `hatchit-projects` | Guest projects array | Dashboard Projects | ✅ Auto-migrated on signup |
| `hatchit-current-project` | Current project ID | BuildFlowController | ✅ Cleared after migration |
| `hatch_preview_*` | Cached preview data | HomepageWelcome | ✅ Restored on return |
| `hatch_last_prompt` | Last entered prompt | HomepageWelcome | ✅ Used for restoration |
| `hatch_intro_v2_seen` | Welcome modal shown | WelcomeModal | Persists |

**Migration Flow:**
1. User signs up after building as guest
2. Dashboard Projects page detects `hatchit-projects` in localStorage
3. Calls POST `/api/project/migrate-guest` with projects array
4. Projects inserted into Supabase with proper user_id
5. localStorage cleared on success
6. User sees their projects in dashboard

### Clerk Metadata
| Key | Purpose | Updated By |
|-----|---------|-----------|
| `publicMetadata.accountSubscription` | Subscription status & tier | Stripe webhook |
| `publicMetadata.freeCreditsUsed` | Build credits used (Free tier) | build-section API |
| `publicMetadata.architectRefinementsUsed` | Refine credits (Architect tier) | refine-section API |

---

## 🚀 Deployment

**Platform:** Vercel
**Domain:** hatchit.dev

**Environment Variables Required:**
- `NEXT_PUBLIC_CLERK_*` - Clerk auth
- `STRIPE_*` - Stripe payments
- `ANTHROPIC_API_KEY` - Claude AI
- `SUPABASE_*` - Database

---

## 📝 Content Pages

| Route | File | Purpose |
|-------|------|---------|
| `/features` | [app/features/page.tsx](../app/features/page.tsx) | Feature showcase |
| `/how-it-works` | [app/how-it-works/page.tsx](../app/how-it-works/page.tsx) | Process explanation |
| `/roadmap` | [app/roadmap/page.tsx](../app/roadmap/page.tsx) | Future plans |
| `/vision` | [app/vision/page.tsx](../app/vision/page.tsx) | Company vision |
| `/about` | [app/about/page.tsx](../app/about/page.tsx) | About page |
| `/manifesto` | [app/manifesto/page.tsx](../app/manifesto/page.tsx) | Brand manifesto |
| `/faq` | [app/faq/page.tsx](../app/faq/page.tsx) | FAQ |
| `/contact` | [app/contact/page.tsx](../app/contact/page.tsx) | Contact form |
| `/privacy` | [app/privacy/page.tsx](../app/privacy/page.tsx) | Privacy policy |
| `/terms` | [app/terms/page.tsx](../app/terms/page.tsx) | Terms of service |
| `/changelog` | [app/changelog/page.tsx](../app/changelog/page.tsx) | Version history |
