# HatchIt Builder - Complete Technical Memory
**Last Updated:** 4 January 2026  
**For:** Any AI continuing development
**Audit Status:** ✅ VERIFIED - All critical paths tested

---

## 🎯 THE VISION (User Journey)

```
HOMEPAGE (depth, void, dramatic)
    ↓ HomepageWelcome (Popup) → "Start Building Free"
    
/builder?mode=guest (ARRIVAL - clean, bright studio)
    ↓ GuestPromptModal (Cinematic entry)
    ↓ Enter prompt → VoidTransition plays
    
/builder (WORKSPACE)
    Professional workspace. The journey lands here.
    This is where real work happens.
```

### Design Philosophy
- **Homepage/Marketing:** Deep, dramatic, void-like depth with perspective grids.
- **First Contact:** `HomepageWelcome` popup - dismissible, high-tech but friendly.
- **Guest Entry:** `GuestPromptModal` - replaces the old `/demo` page for direct builder access.
- **Builder:** **BRIGHT. PROFESSIONAL. STUDIO.** Clean zinc grays, minimal decoration, functional.

---

## 🔄 USER FLOW MATRIX (All Paths Verified)

### Flow 1: Guest Demo (Updated Jan 5)
```
Homepage → HomepageWelcome Popup → Click "Start Building"
    ↓ /builder?mode=guest
    ↓ GuestPromptModal appears (Matrix rain, cinematic input)
    ↓ Enter prompt → Build starts
    ↓ Build unlimited sections (free)
    ↓ Try to deploy
    ↓ HatchModal shows pricing (paywall)
    ↓ Click "Start Building" → /sign-up?upgrade=architect&redirect_url=/builder
    ↓ Complete sign-up → /builder?upgrade=architect
    ↓ Auto-triggers checkout API → Stripe
    ↓ Payment success → /post-payment?tier=architect
    ↓ Subscription synced → Can now deploy
```

### Flow 2: Direct Sign-up from Homepage
```
Homepage → Click pricing CTA
    ↓ /sign-up?upgrade=visionary&redirect_url=/builder
    ↓ Complete sign-up → /builder?upgrade=visionary
    ↓ Auto-triggers checkout API → Stripe
    ↓ Payment success → /post-payment
```

### Flow 3: Returning Subscriber
```
/dashboard/projects → Click project → /builder?project=xyz
    ↓ Has active subscription → Full builder access
    ↓ Build, refine, deploy freely
```

### Flow 4: Free Trial User (Signed-in, no subscription)
```
/dashboard/projects → tierConfig shows "Free Trial", limit=1
    ↓ Can create 1 project
    ↓ /builder?project=xyz → Blocked → /#pricing redirect
```

---

## 🏗️ ARCHITECTURE OVERVIEW

### Key Files & What They Do

| File | Purpose | Lines | Safe to Edit |
|------|---------|-------|--------------|
| `app/page.tsx` | Homepage with pricing | ~730 | Hero animations, pricing cards |
| `app/demo/page.tsx` | Demo entry point | ~240 | Entry experience, VoidTransition trigger |
| `app/builder/page.tsx` | Builder wrapper | ~180 | Auth flow, subscription checks |
| `components/BuildFlowController.tsx` | Main builder orchestrator | ~2013 | ⚠️ CAREFUL - God component |
| `components/SectionBuilder.tsx` | Input/output for each section | ~2360 | Section creation UI |
| `components/SectionPreview.tsx` | Live preview iframe | ~765 | Preview panel, device switching |

### The "God Component" Problem
`BuildFlowController.tsx` handles:
- All builder state (useState everywhere)
- Section ordering and progress
- Iframe rendering
- Subscription gating
- Code sanitization

**Lines:** ~2013 (was 2300, cleaned up)
**Risk:** Changes can cascade unexpectedly. Always test full flow after edits.

---

## 💰 PRICING TIERS (Canonical Source of Truth)

| Tier | Price | Limits |
|------|-------|--------|
| **Architect** | $19/mo | 3 sites, 5 refinements per section |
| **Visionary** | $49/mo | 10 sites, 30 refinements, code export |
| **Singularity** | $199/mo | Unlimited everything, API access |

**Free/Guest Mode:** 3 builds, then paywall

**Type Definition:** `types/subscriptions.ts`
```typescript
tier: 'architect' | 'visionary' | 'singularity'
```

---

## 🤖 AI MODELS (January 2026)

| Endpoint | Model | Purpose |
|----------|-------|---------|
| `/api/build-section` | `claude-sonnet-4-5-20250929` | Generate section code |
| `/api/refine-section` | `claude-sonnet-4-5-20250929` | Edit/improve sections |
| `/api/witness` | `claude-haiku-4-5-20251001` | Post-deploy feedback (cheap) |
| `/api/generate` | Sonnet 4.5 | General generation |
| `/api/audit` | Sonnet 4.5 | Code auditing |
| `/api/assistant` | Gemini 2.0 Flash | Quick suggestions |

**Token Limit:** 4096 (reduced from 8192 for speed)

---

## 🎨 DESIGN SYSTEM

### Colors (Builder = Professional)
```css
/* Backgrounds */
bg-black           /* Deep backgrounds */
bg-zinc-950        /* Primary background */
bg-zinc-900        /* Cards, panels */
bg-zinc-800        /* Input backgrounds */

/* Text */
text-white         /* Primary */
text-zinc-400      /* Secondary */
text-zinc-500      /* Muted */
text-zinc-600      /* Very muted */

/* Accents */
bg-emerald-500     /* Primary CTAs */
bg-emerald-600     /* CTA hover */
text-emerald-500   /* Active states */
border-emerald-500/30  /* Focus rings ONLY */
```

### WHAT NOT TO USE (Builder)
- ❌ Purple/violet colors
- ❌ Gradient buttons with glows
- ❌ `shadow-[0_0_20px_rgba...]` glow effects
- ❌ Brain icons
- ❌ "Architect" terminology in UI
- ❌ Sci-fi text ("NEURAL HANDSHAKE", hex codes)
- ❌ Heavy animations in the workspace

### Animation Guidelines
| Area | Animation Level |
|------|-----------------|
| Homepage | Heavy (particles, depth grids, hover lifts) |
| Demo | Moderate (floating particles, glow, VoidTransition) |
| Builder | Minimal (subtle fades, simple transitions) |

---

## 📂 FOLDER STRUCTURE

```
app/
├── page.tsx              # Homepage
├── demo/page.tsx         # Demo entry
├── builder/              # Builder workspace
├── dashboard/            # User dashboard (projects, settings)
├── api/                  # API routes
│   ├── build-section/    # Main generation
│   ├── refine-section/   # Edit sections
│   ├── checkout/         # Stripe checkout
│   ├── webhook/          # Stripe webhooks
│   └── witness/          # Post-deploy AI
└── sign-in/, sign-up/    # Auth pages

components/
├── BuildFlowController.tsx   # God component
├── SectionBuilder.tsx        # Section input/output
├── SectionPreview.tsx        # Live preview
├── Navigation.tsx            # Header nav
├── HatchModal.tsx            # Pricing modal
└── singularity/
    ├── VoidTransition.tsx    # Entry animation
    ├── SingularitySidebar.tsx # Builder sidebar
    └── TheWitness.tsx        # Post-deploy feedback
```

---

## 🔧 COMMON EDITS & HOW TO MAKE THEM

### Change Pricing
1. `types/subscriptions.ts` - Update `PRICING_TIERS`
2. `app/page.tsx` - Update pricing cards
3. `components/HatchModal.tsx` - Update modal prices
4. `.env` - Update `STRIPE_*_PRICE_ID` if Stripe prices change

### Modify Section Builder UI
- `components/SectionBuilder.tsx` around line 1650 for the complete state
- Keep buttons simple: `bg-emerald-600 hover:bg-emerald-500`
- No gradients, no glows

### Change Loading Animation
- `components/singularity/VoidTransition.tsx` for the demo→builder transition
- `components/singularity/SingularityTransition.tsx` for in-builder loading

### Add New API Endpoint
```typescript
// app/api/your-endpoint/route.ts
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  // ... your logic
}
```

---

## ⚠️ KNOWN ISSUES / TECH DEBT

1. **BuildFlowController.tsx is massive** - 2300 lines, needs refactoring
2. **Ghost API routes** - Some unused endpoints in `/api/` (chronosphere, heal, replicator)
3. **No test coverage** - Manual testing required for all changes

---

## 🚫 THINGS THAT BREAK THE APP

1. **Changing tier names** without updating ALL files
2. **Adding Brain icons** - This is explicitly banned
3. **Heavy animations in builder** - Users need to focus on work
4. **Gradient/glow buttons in builder** - Kills the professional feel
5. **Removing subscription checks** - Money flow breaks

---

## ✅ BEFORE YOU COMMIT

- [ ] Does it work in guest mode? (localhost:3000/builder?mode=guest)
- [ ] Does the full flow work? Homepage → Demo → Builder
- [ ] Is the builder still clean and professional?
- [ ] Did you accidentally add purple colors?
- [ ] Did you accidentally add Brain icons?
- [ ] Does pricing still show correctly?

---

## 📞 QUICK DEBUG

| Problem | Check |
|---------|-------|
| Purple logo appears | Remove `ArchitectLogo` import |
| Brain icon shows | Remove `Brain` from lucide-react imports |
| Sci-fi text | Check `SingularityTransition.tsx` |
| Glowing buttons | Search for `shadow-[0_0_` |
| Wrong pricing | Check `types/subscriptions.ts` PRICING_TIERS |
| Checkout fails | Check `.env` Stripe keys match tier names |

---

*This document is the source of truth for builder development. Update it when making significant changes.*
