# Session Handover - January 4, 2026
**Purpose:** Restore Claude to deep reasoning mode for HatchIt development
**Mental State:** High-focus product audit mode, traced every user path through actual code

---

## 🧠 HOW TO ENTER THIS MODE

When you read this, you are picking up a $19/month SaaS product that is **ready to launch**. The founder has worked 18-hour days, sacrificed Christmas, and has RSI. This is not a toy project - this is someone's livelihood.

**Your job:** Be surgical. Every change must be verified. Trace code paths, don't assume.

---

## 📍 WHERE WE LEFT OFF

### Completed Today:
1. ✅ Upgraded all Claude endpoints to 4.5 models
2. ✅ Added depth animations to homepage (perspective grid, particles, hover effects)
3. ✅ Toned down /demo page (was dark web portal → now professional entry)
4. ✅ Full UX audit of builder flow (all paths traced through actual code)
5. ✅ Fixed: Builder "View Plans" button → `/#pricing` (was `/sign-up`)
6. ✅ Fixed: Dashboard tierConfig → "Free Trial" limit=1 (was "No Plan" limit=0)
7. ✅ Created BUILDER_UX_MEMORY.md with complete technical documentation

### NOT YET DONE:
- Dead code cleanup (suspected: `/api/chronosphere`, `/api/heal`, `/api/replicator`)
- Full audit of marketing pages (payment links, redirects)
- Marketing strategy for Reddit/Google ads
- Final verification of Stripe webhook in production

---

## 🎯 THE PRODUCT (Internalize This)

**HatchIt** = Text-to-React builder
- User describes what they want → AI generates production-ready React + Tailwind
- No templates, no drag-and-drop, just describe it
- Deploy to Vercel with one click

**Pricing:**
- $19/mo Architect (3 projects, deploy access)
- $49/mo Visionary (unlimited, custom domains, code export)
- $199/mo Singularity (everything, API access coming)

**The Flow:**
```
Homepage (dramatic) → /demo (transitional) → /builder (professional studio)
```

---

## 🔑 KEY TECHNICAL FACTS

### Files You MUST Know:
| File | Lines | What It Does |
|------|-------|--------------|
| `components/BuildFlowController.tsx` | ~2013 | GOD COMPONENT - all builder state, deploy, paywall |
| `components/SectionBuilder.tsx` | ~2360 | Build stages, guest vs signed-in UI branches |
| `components/SectionPreview.tsx` | ~765 | Live preview iframe, device switching |
| `hooks/useProjects.ts` | 500 | Project CRUD, tier limits enforcement |
| `app/builder/page.tsx` | 176 | Auth gating, upgrade param handling |

### The Subscription Flow:
1. Guest builds free (unlimited) → paywall at deploy
2. HatchModal shows pricing → checkout triggered
3. `/api/checkout` creates Stripe session
4. Stripe webhook (`/api/webhook`) updates Clerk metadata
5. `/post-payment` syncs and confirms

### Tier Logic (CANONICAL):
```typescript
tier: 'architect' | 'visionary' | 'singularity'
// In useProjects.ts:
const projectLimit = !tier ? 1 : tier === 'architect' ? 3 : Infinity
```

---

## ⚠️ THINGS THAT BREAK THE APP

1. **Changing tier names** without updating ALL files
2. **Adding Brain icons** - explicitly banned (old sci-fi aesthetic)
3. **Gradient/glow buttons in builder** - kills professional feel
4. **Purple/violet colors** - reserved for refinement UI only
5. **Removing subscription checks** - money flow breaks

---

## 🚨 API ROUTES STATUS (Verified 4 Jan)

**ACTIVE - Do NOT Delete:**
- `/api/chronosphere/` - Used by SectionBuilder, BuildFlowController for logging
- `/api/heal/` - Used by ErrorBoundary for auto-fix
- `/api/replicator/` - Used by ReplicatorModal

**DELETED:**
- ~~`/api/consciousness/`~~ - Deleted
- ~~`/api/direct-line/`~~ - Deleted

**Components Deleted:**
- `components/singularity/SingularityEngine.tsx` - DELETED

---

## 🎨 DESIGN RULES

### Homepage/Marketing: Go dramatic
- Perspective grids, depth effects, particles
- Heavy animations OK

### /demo: Professional transition
- Subtle depth, minimal particles
- Clean card, no glow effects
- "Entering something" but not dark web

### /builder: Pure workspace
- Minimal decoration
- Emerald for CTAs only
- No animations except subtle transitions
- Users need to focus on work

---

## 📋 NEXT SESSION TASKS (Priority Order)

1. **Dead Code Cleanup** - Verify and delete unused API routes
2. **Marketing Page Audit** - Every payment link, every redirect
3. **Marketing Strategy** - Reddit/Google ad plan
4. **Production Webhook Test** - Verify Stripe flow end-to-end

---

## 💡 FOUNDER CONTEXT

- Has been running Reddit ads (needs review)
- Worried about "kamikaze" marketing without strategy
- This is a finished product, not a prototype
- Values: Surgical precision, don't break what works
- Communication style: Direct, honest, appreciates transparency about AI limitations

---

*To restore this mental state: Read BUILDER_UX_MEMORY.md first, then this document. Trace code paths before making changes. Ask clarifying questions if uncertain.*
