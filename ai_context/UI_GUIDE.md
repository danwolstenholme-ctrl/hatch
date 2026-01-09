# HATCHIT UI GUIDE
> How it should look and feel.
> Last Updated: January 9, 2026 (Session 3 - UX Refinement)

---

## Aesthetic

**Reference:** Vercel, Clerk, Linear dashboards. Terminal/CLI tools.

### Principles
1. **Sparse** — Fewer words. Let actions speak.
2. **Infrastructure** — Show the stack, not the magic.
3. **Confident** — No exclamation marks. No "amazing!"
4. **Dark + minimal** — zinc-950 base, emerald-500 accent.
5. **Ownership** — Emphasize user owns their code, their GitHub, their deploy.
6. **No mascot** — "It" logo only, no cartoon characters.

---

## Branding

### Tagline
**"Describe it. Build it. Ship it."**

### Positioning
AI-assisted website building. User is the builder, AI does the typing.

### Share Card Copy
- Title: "HatchIt — Describe it. Build it. Ship it."
- Subtext: "AI-assisted React websites → Your GitHub → Live"

### Logo
- **Favicon:** "It" text in emerald-500 on zinc-900 rounded box
- **No Pip mascot** - shelved, not used anywhere

---

## Typography

```
Headings:     font-sans (Inter), font-semibold, text-white
Body:         font-sans (Inter), text-zinc-400
Code/Status:  font-mono (JetBrains), text-xs, text-zinc-500
Buttons:      font-medium, text-sm or text-base
```

---

## Colors

```
Background:   bg-zinc-950, bg-zinc-900
Borders:      border-zinc-800
Text:         text-white, text-zinc-400, text-zinc-500
Accent:       emerald-500, emerald-400 (lightened Jan 8)
Error:        red-500
```

---

## Icons (Updated January 9)

**Minimum size:** 16px (`w-4 h-4`) for all interactive elements.

```tsx
// Interactive icons - always 16px minimum
<ChevronRight className="w-4 h-4" />
<ArrowUp className="w-4 h-4" />
<Check className="w-4 h-4" />

// Smaller icons only for decorative/status indicators
<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />  // Status dot
```

**Banned sizes:**
- `w-3 h-3` (12px) - too small for touch
- `w-3.5 h-3.5` (14px) - inconsistent

---

## Buttons

```tsx
// Primary
className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg"

// Secondary
className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg"

// Text link
className="text-zinc-500 hover:text-zinc-300"

// Dropdown trigger
className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-2"
```

---

## Ship Dropdown (NEW - Jan 8)

The main action after building is "Ship". Shows dropdown with 3 options:

```tsx
// Dropdown container
className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50"

// Dropdown item
className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-3"

// Dropdown item icon
className="w-4 h-4 text-zinc-500"
```

Options:
1. **Push to GitHub** (or "Connect GitHub" if not connected)
2. **Deploy to HatchIt**
3. **Download ZIP**

---

## Modals

- Max 1-2 sentences of copy
- One clear CTA
- Close on backdrop click
- No feature lists
- No Pip mascot

---

## Builder Bottom Bar

```tsx
// Container
className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl"

// Input
className="bg-zinc-900 border border-zinc-800 rounded-lg"
placeholder="what should change?"

// Button integrated
className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
```

---

## Pricing Cards

```tsx
// Card container
className="relative p-5 rounded-md border bg-zinc-900 border-zinc-800"

// Recommended card
className="relative p-5 rounded-md border bg-zinc-900 border-emerald-500/30"

// Feature with check
<li className="flex items-start gap-2 text-xs text-zinc-400">
  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
  <span>Feature text</span>
</li>

// Feature not included
<li className="flex items-start gap-2 text-xs text-zinc-600">
  <X className="w-3.5 h-3.5 text-zinc-700 mt-0.5" />
  <span>Feature text</span>
</li>
```

---

## Generated Code Style (Component Library)

When AI generates components, they should follow these patterns:

### Heroes
- **Prefer:** left-aligned, split, minimal variants
- **Avoid:** centered text over gradient (too generic)

### Features
- **Prefer:** bento grid, alternating layout
- **Avoid:** generic 3-column cards

### Buttons
- **Prefer:** solid white or outline, subtle hover
- **Avoid:** gradient backgrounds, animations on text

### Overall
- Generous whitespace
- Typography-led (let text breathe)
- Subtle animations only (transform, opacity)
- No stock photo placeholders with generic captions

---

## Banned from UI

```
Manifest, Vision, Journey, Experience, Amazing, Revolutionary, Magic
Pip (the mascot) - SHELVED, ALL USAGES REMOVED ✅
"The Singularity Interface" - Removed from OG images
Cycling placeholder text
Long feature grids in modals
Glass effects with shimmer animations
Gradient button backgrounds
Generic "centered hero + 3 cards" layouts
Device simulation toggles - REMOVED (January 9) ✅
Pop-out preview modals - REMOVED (January 9) ✅
```

---

## Copy Style

```
BAD:  "Describe your vision in plain English. Watch production-ready 
      React + Tailwind materialize in real-time."

GOOD: "Describe it. Ship it. Own it."

BAD:  "Your AI companion is ready to help manifest your digital vision!"

GOOD: "Ready."

BAD:  "Ship to Vercel" (when it ships to HatchIt's Vercel)

GOOD: "Deploy to hatchitsites.dev" or "Push to your GitHub"
```

---

## Loading States

| State | Component | Appearance |
|-------|-----------|------------|
| Auth check | `SingularityLoader` | "loading" + subtle animation |
| Page transition | `SingularityTransition` | Full-screen fade |
| Generating | `GeneratingModal` | Code streaming + status text |
| Refining | inline bar | Spinner + "Refining..." |
| GitHub push | inline | Spinner + "Pushing to GitHub..." |

---

## Preview Panels (Updated January 9)

**Principle:** No device simulation. Always show responsive desktop view.

```tsx
// Preview container - responsive, fills available space
<div className="flex-1 min-w-[400px] overflow-auto">
  <FullSitePreviewFrame 
    sections={sections} 
    deviceView="desktop"  // Always desktop
  />
</div>
```

**Removed (January 9):**
- Device toggles (mobile/tablet/desktop buttons)
- Pop-out modal for expanded preview
- Device chrome (phone bezels, notches)

---

## File Naming

```
components/
├── BuildFlowController.tsx    # Main orchestrator
├── SectionBuilder.tsx         # Generation UI
├── SectionPreview.tsx         # Preview iframe
├── SectionProgress.tsx        # Section sidebar
├── [Name]Welcome.tsx          # Entry modals
├── [Name]Modal.tsx            # Action modals
├── builder/                   # Builder-specific helpers
└── singularity/               # UI kit (Button, Input, Modal, etc.)

hooks/
├── useProjects.ts             # Project CRUD
└── useGitHub.ts               # GitHub OAuth + push

lib/
├── components.ts              # Component library for AI
├── templates.ts               # Website templates
└── ...
```
