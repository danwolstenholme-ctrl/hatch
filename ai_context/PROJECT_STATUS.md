# Project Status & Handover
**Last Updated:** January 5, 2026 (Evening)
**Current Phase:** Pre-Launch Polish & Marketing Prep

---

## 🏗️ Builder Architecture (IMPORTANT)

### Routes
| Route | Who | Storage | Premium Actions |
|-------|-----|---------|-----------------|
| `/demo` | **Guests** (not signed in) | localStorage | Show signup modal |
| `/builder` | **Auth users** (signed in) | Supabase | Full access |

### Component Hierarchy
```
/demo OR /builder (pages)
  └── BuildFlowController.tsx (isDemo prop controls behavior)
        └── SectionBuilder.tsx (the actual builder UI)
              └── isInitialState block (line ~2092) - the input UI
```

**Key Insight:** There's only ONE builder UI. Both routes render the same `BuildFlowController` → `SectionBuilder` chain. The `isDemo` prop just controls storage and paywall behavior.

### Generation Limits (as of Jan 5 evening)
**ALL REMOVED** - Infinite generations for everyone. Paywall only at:
- **Deploy** → Requires Architect ($19+)
- **Download** → Requires Visionary ($49+)

---

## 🎯 Current Focus
**"Singularity" Brand Compliance**
Clean, professional aesthetic per SINGULARITY_CORE.md brand guidelines.

### Brand Rules (from SINGULARITY_CORE.md)
- ✅ `bg-zinc-900 border border-zinc-800` for cards
- ✅ `bg-emerald-600 hover:bg-emerald-500` for CTA buttons (flat, no glow)
- ❌ NO gradients, NO teal, NO glowing shadows, NO backdrop-blur everywhere

### Recent Achievements
- **Builder Input UI:** Redesigned to brand spec (zinc palette, flat emerald button)
- **Generation Limits:** Removed all limits - free builds for everyone
- **Singularity Visual Overhaul:** Complete site-wide audit. All pages now use `bg-zinc-950`, Ambient Void effects, and Scanlines.
- **Homepage Welcome:** Redesigned as a dismissible "Glass Card" popup with shimmering "Text → React" animation.
- **Contact Page:** Complete redesign to remove "Matrix" vibes; now clean studio aesthetic with robust back-button logic.
- **Dashboard:** Projects list converted to a professional card grid.
- **Guest Experience:** Implemented `GuestPromptModal` for direct entry via `/builder?mode=guest`.
- **Pricing:** Standardized across all modals ($19/$49/$199).

---

## 📋 Immediate Next Steps (The "To-Do" List)

### 1. Testing & Verification (Current Task)
- [ ] **User Flow:** Test the new Homepage Welcome → Builder flow.
- [ ] **Contact Page:** Verify `returnUrl` works correctly from Builder and Homepage.
- [ ] **Mobile:** Check responsiveness of the new modals.

### 2. Marketing Page Audit
**Goal:** Ensure all funnels lead to payment correctly.
- [x] Verify all pricing CTAs on `/` go to the correct checkout.
- [x] Check `/features`, `/how-it-works`, `/about` for broken links or old "Architect" branding.
- [x] Verify `/manifesto` is on-brand.

### 3. Production Stripe Test
- [ ] Create test account.
- [ ] Full flow: Guest → Signup → Checkout → Post-payment.
- [ ] Verify Clerk subscription sync.
- [ ] Verify Deploy access.

### 4. Code Cleanup
- [ ] Remove dead code: `/api/chronosphere`, `/api/heal`, `/api/replicator` (if confirmed unused).

---

## 📢 Marketing Strategy (Upcoming)
**Status:** Historical data recovered (Jan 2026). Ready for reactivation.

**Reddit Data (REDDIT_RESURRECTION):**
- **Spend:** €257.36 | **Clicks:** 1,163 | **CPC:** €0.22 | **CTR:** 0.41%
- **Verdict:** Highly efficient traffic. Previous bottleneck was likely on-site conversion due to "toy-like" aesthetic.

**Key Assets:**
- **Value Prop:** "Text to React" - No drag-and-drop, just description.
- **Target Audience:** Developers who hate boilerplate, Founders who need MVPs fast.
- **Channels:** Reddit (r/webdev, r/saas, r/sideproject), Twitter/X.

---

## 🧠 Context & Mental State
**The Product:** HatchIt is a **tool**, not a toy. It must feel reliable, fast, and professional.
**Design Philosophy:**
- **Homepage:** Dramatic, depth, "void" aesthetic.
- **Builder:** Bright, clean, functional "Studio" aesthetic.
- **Transitions:** Smoothr, cinematic, but not distracting.

---

## 📂 Recent File Changes (Session Log)
- `components/HomepageWelcome.tsx`: Added gradient text, auto-dismiss, glass styling.
- `app/contact/page.tsx`: Full redesign, removed grid background.
- `components/ContactButton.tsx`: Updated to Emerald theme.
- `components/GuestPromptModal.tsx`: Added for guest entry.
- `app/dashboard/projects/page.tsx`: Redesigned to card grid.
---

## 💡 Shelved Ideas (Future Features)

### Launch Pack (One-Time Upsell)
**Status:** API exists (`/api/launch-pack/route.ts`) but not wired up
**Missing:** `STRIPE_LAUNCH_PACK_PRICE_ID` env var, webhook handling, UI

**Potential Offerings:**
| Option | Price | What They Get |
|--------|-------|---------------|
| White Glove Setup | $199 | Personal help deploying first site |
| Custom Domain Setup | $49 | Domain config + SSL |
| Priority Support | $99 | Front of queue + direct chat |
| Template Pack | $29 | Premium templates/sections |
| Export Credits | $19 | X number of code exports |

**To Activate:**
1. Create Stripe product (one-time, not subscription)
2. Add `STRIPE_LAUNCH_PACK_PRICE_ID` to env
3. Handle in `/api/webhook` to grant benefit
4. Add UI in post-payment or dashboard