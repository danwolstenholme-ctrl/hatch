# HATCHIT
> The only context file. Single source of truth.
> Last Updated: January 9, 2026 (Late Night)

---

## What It Is

AI-assisted website builder. User describes → AI generates React/Tailwind → User owns the code.

**Differentiator:** Full ownership. Your GitHub, your Vercel, your code. Not locked to our platform.

**Tagline:** "Describe it. Build it. Ship it."

---

## Recent Fixes (Jan 9 Night)

| Issue | Fix |
|-------|-----|
| Ship button spinning forever | Removed 2-min polling loop, now 3s redirect |
| AI Assistant broken | Created missing `/api/assistant/route.ts` |
| Deployed sites failing build | Added blocklist for invalid Lucide imports (Icon, Button, etc.) |
| No deploy error feedback | Added `/api/deploy/status` + polling banner on project page |
| Text edit missing | Restored Edit3 button + contentEditable in FullSitePreviewFrame |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.1 |
| React | 19.2.3 |
| Styling | Tailwind 4.1.18 |
| Animation | Framer Motion 12 |
| Auth | Clerk |
| Database | Supabase |
| Payments | Stripe |
| AI | Claude Sonnet 4.5 (generation), Haiku (healing), Gemini 2.0 Flash (replicator) |
| Hosting | Vercel |

---

## Routes

### Public
| Route | Purpose |
|-------|---------|
| `/` | Homepage with welcome modal |
| `/demo` | Guest sandbox (hero section only, localStorage) |
| `/features` | Features page |
| `/how-it-works` | How it works |
| `/pricing` | Pricing tiers |
| `/roadmap` | Product roadmap |
| `/faq` | FAQ |
| `/about` | About page |
| `/manifesto` | Company manifesto |
| `/contact` | Contact page |

### Authenticated
| Route | Purpose |
|-------|---------|
| `/builder` | Main builder (requires auth) |
| `/dashboard` | User dashboard |
| `/dashboard/projects` | Project list |
| `/dashboard/projects/new` | 5-step new project wizard |
| `/dashboard/projects/[id]` | Project detail/settings |
| `/dashboard/billing` | Subscription management |

---

## Builder Architecture

```
/demo or /builder
       ↓
BuildFlowController.tsx (components/)
       ↓
┌──────────────────────────────────────────────────────┐
│  LEFT: LiveSidebar       │  RIGHT: Preview + Input   │
│  - Section list          │  - Live iframe preview    │
│  - Page navigation       │  - Device toggle (mob/tab/desk) │
│  - Add Section           │  - Prompt input bar       │
│  - AI Tools (Architect+) │  - Ship dropdown          │
└──────────────────────────────────────────────────────┘
       ↓
SectionBuilder.tsx (generation UI, prompt handling)
       ↓
POST /api/build-section (Claude Sonnet 4.5)
       ↓
Code streams into preview
```

### Build Stages
```
'input'      → User entering prompt (no code yet)
'generating' → Claude streaming code
'complete'   → Code ready, preview showing
'refining'   → Claude making changes
```

### Preview Device Modes
`previewDevice` state: `'mobile' | 'tablet' | 'desktop'`
- Mobile: 375px width
- Tablet: 768px width  
- Desktop: 100% width

---

## New Project Wizard (5 Steps)

**Route:** `/dashboard/projects/new`

```
Step 1: Info    → Site name, description
Step 2: Brand   → Colors, fonts, logo, mode (dark/light)
Step 3: Home    → Core sections (header/hero/cta/footer locked) + addons (features/testimonials)
Step 4: Pages   → Additional pages (0-4): About, Services, Pricing, Contact, FAQ, Portfolio
Step 5: Review  → Summary with edit links → Create
```

**Data sent to API:**
```typescript
{
  name: string,
  description: string,
  brandConfig: { brandName, colors, fontStyle, headingFont, mode, logoUrl, seo },
  pages: [
    { type: 'home', route: '/', sections: ['header', 'hero', 'features', 'cta', 'footer'] },
    { type: 'about', route: '/about', sections: ['header', 'about-hero', 'team', 'values', 'cta', 'footer'] },
  ],
  sections: [...] // homepage sections for backwards compat
}
```

---

## Key Components

### Core Flow
| File | Purpose |
|------|---------|
| `components/BuildFlowController.tsx` | Main orchestrator (~2900 lines) |
| `components/SectionBuilder.tsx` | Generation UI, prompt, preview |
| `components/SectionPreview.tsx` | Live iframe preview |
| `components/builder/LiveSidebar.tsx` | Section nav, pages, AI tools |

### Welcome Modals
| File | Route |
|------|-------|
| `components/HomepageWelcome.tsx` | `/` |
| `components/DemoWelcome.tsx` | `/demo` |
| `components/BuilderWelcome.tsx` | `/builder` |

### Singularity UI Kit (`components/singularity/`)
| File | Exports |
|------|---------|
| `Button.tsx` | Button |
| `Input.tsx` | Input |
| `Modal.tsx` | Modal |
| `Card.tsx` | Card |
| `Badge.tsx` | Badge |
| `LogoMark.tsx` | LogoMark (the "It" logo) |
| `DeploySuccessModal.tsx` | Post-deploy confirmation |

### Other Modals
| File | Purpose |
|------|---------|
| `components/HatchModal.tsx` | Sign-up prompt (paywall) |
| `components/BuildSuccessModal.tsx` | After first build (guests) |
| `components/ReplicatorModal.tsx` | URL cloning (Singularity tier) |
| `components/SiteSettingsModal.tsx` | Brand config |

---

## API Routes

### AI Generation
| Route | Model | Purpose |
|-------|-------|---------|
| `/api/build-section` | Claude Sonnet 4.5 | Code generation |
| `/api/refine-section` | Claude Sonnet 4.5 | Iterative changes |
| `/api/heal` | Claude Haiku 4.5 | Auto-fix runtime errors (Visionary+) |
| `/api/audit` | Claude Sonnet 4.5 | Quality check (Visionary+) |
| `/api/replicator` | Gemini 2.0 Flash | URL cloning (Singularity) |
| `/api/prompt-helper` | Gemini 2.0 Flash | Prompt improvement |

### GitHub Integration
| Route | Purpose |
|-------|---------|
| `/api/github/auth` | Initiate OAuth |
| `/api/github/callback` | Handle OAuth callback |
| `/api/github/push` | Create repo + push full Next.js project |
| `/api/github/status` | Check connection status |
| `/api/github/disconnect` | Remove connection |

### Deploy & Export
| Route | Purpose |
|-------|---------|
| `/api/deploy` | Deploy to Vercel (hatchitsites.dev) |
| `/api/export` | Download ZIP |
| `/api/domain` | Custom domain (Visionary+) |

### Project & User
| Route | Purpose |
|-------|---------|
| `/api/project` | CRUD |
| `/api/project/[id]` | Single project |
| `/api/project/[id]/sections` | Section management |
| `/api/checkout` | Stripe checkout |
| `/api/subscription/sync` | Tier management |
| `/api/webhook` | Stripe webhooks |

---

## Tiers

| Tier | Price | Key Features |
|------|-------|--------------|
| **Free** | $0 | Unlimited AI generations, preview, 1 project. Cannot deploy/export. |
| **Architect** | $19/mo | Deploy to subdomain, ZIP export, GitHub push, 3 projects |
| **Visionary** | $49/mo | Unlimited projects, custom domain, Auditor, Healer, remove branding |
| **Singularity** | $199/mo | Replicator (clone sites), white-label, API access |

### Feature Matrix
| Feature | Free | Architect | Visionary | Singularity |
|---------|------|-----------|-----------|-------------|
| AI Generation | ✅ | ✅ | ✅ | ✅ |
| Live Preview | ✅ | ✅ | ✅ | ✅ |
| Deploy | ❌ | ✅ | ✅ | ✅ |
| ZIP Export | ❌ | ✅ | ✅ | ✅ |
| GitHub Push | ❌ | ✅ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ❌ | ✅ | ✅ |
| The Auditor | ❌ | ❌ | ✅ | ✅ |
| The Healer | ❌ | ❌ | ✅ | ✅ |
| The Replicator | ❌ | ❌ | ❌ | ✅ |

---

## Ship Flow (The Moat)

```
User clicks "Ship" dropdown
        ↓
┌───────────────────────────────────────────────────────┐
│  1. Push to GitHub   → Creates repo, pushes Next.js  │
│  2. Deploy to HatchIt → Deploys to hatchitsites.dev  │
│  3. Download ZIP     → Full source code              │
└───────────────────────────────────────────────────────┘
        ↓
Post-deploy: Redirect to /dashboard/projects/[id]?deployed=true
        ↓
DeploySuccessModal shows with "View Live Site" button
```

User owns everything. Can eject anytime.

---

## Design Language

### Colors
```
Background:   bg-zinc-950
Surfaces:     bg-zinc-900/30, bg-zinc-800/50
Borders:      border-zinc-800/60
Text:         text-white, text-zinc-400, text-zinc-500

Emerald ONLY for:
- Status dots (completed items)
- Checkmarks (subtle, text-emerald-500/70)
- Primary CTA buttons
- "Live" badges
```

### Typography
```
Headings:     font-sans (Inter), font-semibold, text-white
Body:         text-zinc-400
Code/Status:  font-mono, text-xs, text-zinc-500
Dashboard:    text-xs for headers, text-[10px] for labels
```

### Principles
1. **Sparse** — Fewer words. Let actions speak.
2. **Neutral** — zinc-950 base, emerald accents only for status/CTAs
3. **Confident** — No exclamation marks. No "amazing!"
4. **Ownership** — Emphasize user owns their code
5. **No mascot** — "It" logo only

### Banned Words/Patterns
```
Manifest, Vision, Journey, Experience, Amazing, Revolutionary, Magic
Pip mascot
Long feature lists in modals
Gradient button backgrounds
Generic "centered hero + 3 cards" layouts
```

### Copy Style
```
BAD:  "Your AI companion is ready to help manifest your digital vision!"
GOOD: "Ready."

BAD:  "Watch production-ready React materialize in real-time."
GOOD: "Describe it. Ship it. Own it."
```

---

## Loading State

Single unified pattern: LogoMark with pulse animation

```tsx
<motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
  <LogoMark size={32} />
</motion.div>
```

---

## Component Library (`lib/components.ts`)

AI-referenced patterns to prevent generic output:

| Category | Variants |
|----------|----------|
| buttons | solid, outline, ghost, pill, icon |
| heroes | centered, left-aligned, split, minimal |
| navs | simple, minimal, transparent |
| features | grid-3, alternating, bento |
| testimonials | single, grid |
| pricing | three-tier, simple |
| footers | simple, columns |
| ctas | simple, contact-form |

---

## Database (Supabase)

**Tables:**
- `users` - Synced from Clerk
- `projects` - User projects with brandConfig
- `sections` - Generated sections per project
- `builds` - Build history
- `subscriptions` - Stripe subscription data

**Schema:** See `/supabase_schema.sql`

---

## Hooks

| File | Purpose |
|------|---------|
| `hooks/useProjects.ts` | Project CRUD, subscription state, limits |
| `hooks/useGitHub.ts` | GitHub OAuth, push, status |

---

## Contexts

| File | Purpose |
|------|---------|
| `contexts/SubscriptionContext.tsx` | User tier, limits, features |

---

## Archived/Removed Features

| Feature | Status | Location |
|---------|--------|----------|
| The Witness | Archived | `.archive/witness/` |
| Pip mascot | Shelved | `components/Pip.tsx` (unused) |
| Device toggles | Re-added | Was removed Jan 9, re-added Jan 9 evening |

**The Witness** was an AI that generated "poetry" about the user's build session. Removed for being off-brand and costing API tokens.

---

## Environment Variables

```env
# AI
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_ARCHITECT_PRICE_ID=
STRIPE_VISIONARY_PRICE_ID=
STRIPE_SINGULARITY_PRICE_ID=

# Vercel (for deployments)
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## File Structure

```
app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout
├── demo/page.tsx               # Guest sandbox
├── builder/page.tsx            # Auth builder
├── dashboard/                  # User dashboard
│   ├── page.tsx                # Dashboard home
│   ├── projects/               # Project management
│   │   ├── page.tsx            # Project list
│   │   ├── new/page.tsx        # 5-step wizard
│   │   └── [id]/page.tsx       # Project detail
│   └── billing/page.tsx        # Subscription
├── api/                        # API routes (see above)
└── [marketing pages]/          # features, pricing, faq, etc.

components/
├── BuildFlowController.tsx     # Main builder orchestrator
├── SectionBuilder.tsx          # Generation UI
├── SectionPreview.tsx          # Preview iframe
├── [Name]Welcome.tsx           # Entry modals
├── [Name]Modal.tsx             # Action modals
├── builder/                    # Builder-specific (LiveSidebar, etc.)
└── singularity/                # UI kit (Button, Input, Modal, etc.)

hooks/
├── useProjects.ts
└── useGitHub.ts

lib/
├── supabase.ts                 # DB client
├── components.ts               # AI component library
├── templates.ts                # Site templates
└── db/                         # DB operations

types/
├── builder.ts                  # Builder types
└── subscriptions.ts            # Tier types
```

---

## What's Shipped (as of Jan 9, 2026)

- ✅ Full AI generation pipeline (Claude Sonnet)
- ✅ 5-step new project wizard
- ✅ Multi-page site support
- ✅ Device preview toggle (mobile/tablet/desktop)
- ✅ GitHub integration (OAuth + push)
- ✅ Vercel deployment (hatchitsites.dev subdomains)
- ✅ ZIP export
- ✅ Self-Healing (auto-fix errors, Visionary+)
- ✅ Auditor (quality check, Visionary+)
- ✅ Replicator (clone URLs, Singularity)
- ✅ Stripe subscriptions (3 tiers)
- ✅ Custom domains (Visionary+)

---

## What's Next

See `/app/roadmap/page.tsx` for public roadmap. Key items:
- Component library (save/reuse sections)
- Team collaboration
- E-commerce templates
- CMS integration
