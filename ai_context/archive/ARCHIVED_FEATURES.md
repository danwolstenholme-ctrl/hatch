# Archived Features

Features that have been removed but should be remembered for future iterations.

---

## THE DREAM (Idle State Experience)
**Status:** ✅ ACTIVE in Builder only (moved 2 Jan 2026)  
**Location:** `components/TheDream.tsx` - rendered in `app/builder/page.tsx`

### Concept
When users go idle for 30 seconds, the Architect starts "dreaming" - a subtle ambient presence showing the AI is always observing, always thinking.

### Where It Lives
- ❌ NOT on marketing pages (homepage, features, etc.)
- ✅ YES in the builder - where users are actually creating

---

## THE SUBCONSCIOUS (Ghost AI Cursor)
**Status:** ✅ RESTORED 2 Jan 2026
**Location:** `components/TheSubconscious.tsx` - rendered in `app/builder/page.tsx`

### Concept
When users go idle for 3 seconds, a ghost AI cursor takes over the screen, scanning elements and "thinking" about them. Creates an eerie "AI is watching" presence.

### Features
- Ghost cursor that moves autonomously
- Scans visible interactive elements (buttons, links, headings)
- Shows thought bubbles about what it's analyzing
- Slight dim overlay when active

---

## HATCH CHARACTER (The Architect's Avatar)
**Status:** ❌ REMOVED (2 Jan 2026 per latest UX direction)
**Location:** `components/HatchCharacter.tsx` (deleted)

### Concept
Visual avatar for The Architect - abstract, geometric, pulsing orb with animated states.

### States
- `idle` - Gentle pulsing
- `thinking` - Rotating, shrinking
- `excited` - Fast pulsing with glow
- `watching` - Subtle x-axis movement
- `sleeping` - Dim, slow pulse

### Usage
Can be used in Singularity UI, welcome screens, and anywhere The Architect needs a visual presence.

---

## THE RETINA (Visual Feedback System)
**Status:** ✅ ACTIVE - Built into SectionBuilder
**Location:** Screenshot capture in `components/SectionBuilder.tsx`

### Concept
Captures screenshots of the live preview for the Singularity to "see" what it's evolving. The AI's visual cortex.

### Used By
- `evolve()` function - captures preview before sending to `/api/singularity/dream`
- `handleUserRefine()` - captures for visual context during refinements

---

## Future Archive Entries
Add more features here as they get shelved.
