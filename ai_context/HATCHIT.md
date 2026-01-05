# HATCHIT - AI Context
> **Read this first.** This is the single source of truth.
> **Last Updated:** January 5, 2026

---

## What Is HatchIt?

**Text to React.** Users describe what they want, we generate production-ready React + Tailwind components with live preview.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js | 16.1.1 |
| React | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.1.18 |
| Animation | Framer Motion | 12.x |
| Auth | Clerk | 6.36.5 |
| Database | Supabase | 2.89.0 |
| Payments | Stripe | 20.1.0 |
| AI | Claude Sonnet 4.5 (build), Haiku 4.5 (witness), Gemini 2.0 Flash |
| Icons | Lucide React | 0.562.0 |
| Hosting | Vercel |

**Note:** These are bleeding-edge versions. Tailwind 4 uses `@theme` directive, not `tailwind.config.js`.

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | No | Homepage with pricing |
| `/demo` | No | **Sandbox builder** - localStorage only, premium actions show signup modal |
| `/builder` | **Yes** | **Real builder** - projects persist to Supabase |
| `/dashboard/studio` | Yes | Project list (renamed from "Projects") |
| `/dashboard/billing` | Yes | Subscription management |
| `/sign-up`, `/sign-in` | No | Clerk auth |

**Key Flow:**
```
Homepage CTA → /demo (unauthenticated) OR /builder (authenticated)
Demo user builds → Clicks Deploy → Signup modal → Signs up → Work migrates to real project
```

---

## Pricing Tiers

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 10 builds, 1 refinement, 1 project |
| Architect | $19/mo | Unlimited builds, 3 projects, deploy |
| Visionary | $49/mo | + Code download, custom domain, 10 projects |
| Singularity | $199/mo | Unlimited everything |

**Type:** `types/subscriptions.ts` → `tier: 'architect' | 'visionary' | 'singularity'`

---

## Critical Files (Handle With Care)

| File | Lines | Risk | Notes |
|------|-------|------|-------|
| `components/BuildFlowController.tsx` | ~2100 | ⚠️ HIGH | "God component" - orchestrates entire builder |
| `components/SectionBuilder.tsx` | ~2900 | ⚠️ HIGH | Section input/output UI |
| `components/SectionPreview.tsx` | ~800 | Medium | Live preview iframe |
| `app/page.tsx` | ~700 | Medium | Homepage - lots of animation |

---

## Design System - THE RULES

### Colors (The Singularity Palette)
```
bg-zinc-950      # The Void (primary background)
bg-zinc-900      # Cards, panels
bg-zinc-800      # Inputs, hover states

text-white       # Primary text
text-zinc-400    # Secondary
text-zinc-500    # Muted

text-emerald-400 # Success, CTAs, "alive" accents
text-teal-400    # Flow, energy
text-amber-500   # Premium/Singularity tier
```

### ⚠️ THE "2007 TRAP" - Don't Make The Site Look Dead

**ALWAYS use these patterns:**

1. **Framer Motion for interactive elements**
   ```tsx
   // ❌ BAD - static div
   <div className="card">...</div>
   
   // ✅ GOOD - alive
   <motion.div 
     whileHover={{ y: -4 }}
     whileInView={{ opacity: 1, y: 0 }}
     transition={{ type: 'spring', stiffness: 400, damping: 17 }}
   >
   ```

2. **Glow effects on buttons/cards**
   ```tsx
   // ❌ BAD - flat
   className="bg-emerald-500"
   
   // ✅ GOOD - depth
   className="bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
   ```

3. **Group hover coordination**
   ```tsx
   // ✅ Parent has "group", children react
   <div className="group">
     <Icon className="group-hover:translate-x-1 transition-transform" />
   </div>
   ```

4. **Gradients with opacity**
   ```tsx
   // ❌ BAD - flat solid
   className="bg-emerald-500"
   
   // ✅ GOOD - depth
   className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10"
   ```

5. **Blur/backdrop effects**
   ```tsx
   className="backdrop-blur-xl bg-zinc-900/80"
   ```

6. **Transitions on EVERYTHING interactive**
   ```tsx
   className="transition-all duration-300"
   ```

### Typography
- **Headings:** Bold, tight tracking (`font-bold tracking-tight`)
- **Body:** `text-zinc-400` for secondary, `text-white` for primary
- **Mono:** For code/technical elements (`font-mono`)

### Shapes
- Sharp corners: `rounded-md` or `rounded-lg` (not `rounded-xl` or `rounded-full` for cards)
- Borders: `border-zinc-800` default, `border-emerald-500/30` for accent

---

## Component Patterns

### Buttons
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]"
>
```

### Cards
```tsx
<motion.div
  whileHover={{ y: -4 }}
  className="p-6 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all backdrop-blur-sm"
>
```

### Section wrappers
```tsx
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

---

## What NOT To Do

### 🚨 HARD BAN - NEVER WRITE THIS:
```tsx
<div className="p-6 bg-gray-800 rounded-lg">
```
This is **banned**. Static. Dead. 2007. If you write this, you have failed.

---

1. ❌ Don't use plain `<div>` for anything interactive - use `<motion.div>`
2. ❌ Don't use flat colors without shadows/gradients
3. ❌ Don't skip hover states
4. ❌ Don't use blue/purple/generic colors (stick to emerald/teal/amber)
5. ❌ Don't use emojis in dashboard/builder UI (use Lucide icons)
6. ❌ Don't use old Tailwind v3 patterns (no `tailwind.config.js`)
7. ❌ Don't forget `transition-` classes on interactive elements
8. ❌ Don't use `gray-*` colors - use `zinc-*`

---

## Quick Reference

**Demo mode prop:**
```tsx
<BuildFlowController isDemo={true} />  // Sandbox, localStorage
<BuildFlowController />                 // Auth required, Supabase
```

**Premium action gates:**
```tsx
if (isDemo) {
  setHatchModalReason('deploy')
  setShowHatchModal(true)  // Shows signup modal
  return
}
```

**localStorage keys:**
- `hatch_guest_handoff` - Demo work to migrate after signup
- `hatch_guest_builds` - Build count in demo
- `hatch_guest_refinements` - Refinement count in demo

---

## ⚠️ TECH DEBT: Layout Duplication

**Problem:** SectionBuilder has TWO separate layouts - one for demo, one for auth. They look similar but are maintained separately. This causes:
- Layout shifts when states change
- Bugs fixed in one place but not the other
- Double work for every UI change

**Correct Architecture (TODO):**
```tsx
// ONE layout, conditional behavior
<BottomBar
  isDemo={isDemo}
  stage={stage}
  onRefine={isDemo ? showSignupModal : handleRealRefine}
  onDeploy={isDemo ? showSignupModal : handleRealDeploy}
/>

// Buttons check isDemo internally:
<Button 
  disabled={isDemo && feature === 'premium'}
  onClick={isDemo ? () => showUpgrade(feature) : realAction}
>
  {children}
</Button>
```

**Rule:** ONE layout. `isDemo` changes behavior, not structure.

---

## File Structure

```
app/
  page.tsx           # Homepage
  demo/page.tsx      # Sandbox builder entry
  builder/page.tsx   # Auth builder entry
  dashboard/
    projects/        # Project list
    billing/         # Subscription
  api/
    build-section/   # AI generation
    refine-section/  # AI refinement
    checkout/        # Stripe
    
components/
  BuildFlowController.tsx  # Main builder orchestrator
  SectionBuilder.tsx       # Section input UI
  SectionPreview.tsx       # Live preview
  HatchModal.tsx           # Upgrade/paywall modal
  singularity/             # UI components with the aesthetic
```

---

*This file is the truth. When in doubt, read this.*
