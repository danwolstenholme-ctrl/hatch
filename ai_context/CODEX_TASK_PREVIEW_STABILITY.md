# CODEX TASK: Preview System Stability Audit

## MISSION
Audit and bulletproof the three preview components to ensure AI-generated React/Next.js code NEVER crashes the iframe preview. Build passes but runtime errors persist.

---

## THE PROBLEM
The builder generates React/Next.js code via AI (Gemini). This code gets executed in an iframe using:
1. React 18 UMD from unpkg
2. Babel standalone for JSX transformation
3. Tailwind CDN
4. Framer Motion UMD
5. Lucide React UMD

**Common Runtime Errors:**
- `Identifier 'Image' has already been declared` (Line 228)
- `Can't find variable: useRouter`
- `Script error. Line: 0`
- React error #130 (invalid element type)

**Root Cause:** AI code declares variables (`Image`, `Link`, etc.) that conflict with our stub declarations, OR imports modules we don't stub.

---

## FILES TO AUDIT (Critical Priority)

### 1. `/components/SectionPreview.tsx`
- **Used by:** Architect Mode section previews
- **Transform:** Babel standalone (server-side transform, client render)
- **Current Issues Fixed:**
  - Changed `const` to `var` for all stubs (allows redeclaration)
  - Added Next.js stubs: `Image`, `Link`, `Head`, `Script`, `useRouter`, `usePathname`, `useSearchParams`
  - Added utility stubs: `cn`, `clsx`
  - Lucide icons now use `var` and avoid `Image`/`Link` naming conflicts

### 2. `/components/LivePreview.tsx`
- **Used by:** Main preview panel (multi-page and single-page modes)
- **Transform:** Babel standalone via `<script type="text/babel">`
- **Two separate HTML generation paths:**
  - Multi-page mode (~line 693-1010): `if (pages && pages.length > 0)`
  - Single-page mode (~line 1107-1450): legacy fallback
- **Current Issues Fixed:**
  - Changed script loading to synchronous (no `onload` handlers)
  - Changed `const` to `var` for `NextImage`, `NextLink`, `Image`, `Link`
  - Icon assignments now use `var` instead of `const`

### 3. `/components/BuildFlowController.tsx`
- **Used by:** Full site preview in /builder
- **Transform:** Babel standalone via `<script type="text/babel">`
- **Current Issues Fixed:**
  - Synchronous script loading
  - Changed `const` to `var` for Image, Link, etc.

---

## WHAT AI-GENERATED CODE TYPICALLY CONTAINS

```tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  // ... component code
};

export default HeroSection;
```

After Babel transforms this, it becomes:
```js
var _react = require("react");
var _image = require("next/image");
var _link = require("next/link");
// etc.
```

**Our `require()` function must handle ALL these imports.**

---

## REQUIRED STUB COVERAGE

### Next.js Modules
| Module | Stub |
|--------|------|
| `next/image` | `<img>` wrapper with fill support |
| `next/link` | `<a>` wrapper |
| `next/head` | Returns null |
| `next/script` | Returns null |
| `next/navigation` | `{ useRouter, usePathname, useSearchParams }` |
| `next/font/*` | `{ className: '', style: {} }` |

### Framer Motion
| Export | Stub |
|--------|------|
| `motion` | Proxy returning tag names or Motion.motion |
| `AnimatePresence` | Pass-through children |
| `useInView` | Returns `true` |
| `useScroll` | Returns `{ scrollY: 0, scrollYProgress: 0 }` |
| `useTransform` | Returns input value |
| `useMotionValue` | Returns `{ get, set }` mock |
| `useSpring` | Returns input value |
| `useAnimation` | Returns `{ start, stop }` mock |

### Lucide React
| Export | Stub |
|--------|------|
| All icons | Safe proxy returning dummy components |
| **CRITICAL:** Do NOT declare `Image` or `Link` from lucide - conflicts with Next.js stubs |

### Utilities
| Module | Stub |
|--------|------|
| `clsx`, `classnames` | `(...args) => args.filter(Boolean).join(' ')` |
| `tailwind-merge` | Same as clsx |
| `class-variance-authority` | `(base) => () => base` |
| CSS imports (`.css`, `.scss`) | Empty object |

---

## CRITICAL RULES FOR STABILITY

### 1. Use `var` NOT `const` for all stubs
```js
// BAD - will crash if AI code also declares Image
const Image = NextImage;

// GOOD - var allows redeclaration
var Image = NextImage;
```

### 2. Synchronous Script Loading
```html
<!-- BAD - async loading can cause race conditions -->
<script src="react.js" onload="window.React=React"></script>

<!-- GOOD - synchronous with immediate exposure -->
<script src="react.js"></script>
<script>window.React = React; window.react = React;</script>
```

### 3. Lucide Icon Extraction Must Avoid Image/Link
```js
// BAD - conflicts with Next.js Image/Link
const { Menu, X, Image, Link } = window.LucideIcons;

// GOOD - rename conflicting icons
var ImageIcon = _icons.Image;
var LinkIcon = _icons.Link;
```

### 4. Robust require() Function
Must handle ALL possible import paths gracefully:
```js
var require = function(name) {
  if (name === 'react') return React;
  if (name === 'react-dom') return ReactDOM;
  if (name === 'framer-motion') return window.Motion || {};
  if (name === 'lucide-react') return window.LucideIcons || {};
  if (name === 'next/image') return NextImage;
  if (name === 'next/link') return NextLink;
  if (name === 'next/navigation') return { useRouter, usePathname, useSearchParams };
  if (name === 'next/head') return Head;
  if (name === 'next/script') return Script;
  if (name.indexOf('next/font') === 0) return { className: '', style: {} };
  if (name === 'clsx' || name === 'classnames') return cn;
  if (name === 'tailwind-merge') return { twMerge: cn };
  if (name === 'class-variance-authority') return { cva: (b) => () => b };
  if (name.endsWith('.css') || name.endsWith('.scss')) return {};
  return window[name] || {};
};
```

### 5. Error Boundaries
Each preview must have try/catch AND React ErrorBoundary to catch:
- Babel transform errors
- Runtime execution errors
- React render errors

### 6. Graceful Fallback UI
When errors occur, show a friendly "Complex Preview" fallback, not a crash.

---

## TESTING CHECKLIST

After changes, test these scenarios:

1. **Basic section:** "Create a hero section with a headline"
2. **With images:** "Create a features grid with icons"
3. **With navigation:** "Create a navbar with mobile menu"
4. **With animations:** "Create an animated testimonials carousel"
5. **Complex:** "Create a pricing table with toggle"

Each should either:
- ✅ Render correctly
- ✅ Show graceful fallback

NEVER:
- ❌ Show "Script error. Line: 0"
- ❌ Show "Identifier X has already been declared"
- ❌ Show blank white/black screen

---

## CURRENT STATE

Build passes (`npm run build` exits 0). Runtime errors may still occur because:
1. We may have missed some edge cases
2. Icon assignments in LivePreview use dynamic extraction from AI code - could still conflict
3. useRouter stub may fail if called at module level (outside component)

---

## YOUR TASK

1. Read all three preview components thoroughly
2. Ensure EVERY stub uses `var` not `const`
3. Ensure script loading is synchronous with immediate global exposure
4. Ensure require() covers all possible imports
5. Ensure Lucide icon destructuring doesn't conflict with Image/Link
6. Add any missing stubs you discover
7. Test build passes: `npm run build`
8. Document any changes made

**Goal: Zero runtime errors in preview, ever.**

---

## FILE LOCATIONS

```
/Users/danwolstenholme-personal/HatchIt/
├── components/
│   ├── SectionPreview.tsx      # Architect Mode previews
│   ├── LivePreview.tsx         # Main preview (2 modes)
│   └── BuildFlowController.tsx # Full site preview
```

Run build with: `npm run build`
Run dev with: `npm run dev`

---

## REFERENCE: Working Script Pattern (from before breakage)

```html
<!-- Load React first and expose globally IMMEDIATELY -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script>window.React = React; window.react = React;</script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>window.ReactDOM = ReactDOM; window["react-dom"] = ReactDOM;</script>

<!-- Load Tailwind and configure IMMEDIATELY -->
<script src="https://cdn.tailwindcss.com"></script>
<script>if(typeof tailwind!=="undefined"){tailwind.config={theme:{extend:{}},darkMode:"class"};}</script>

<!-- Now load framer-motion and lucide (they can find React on window) -->
<script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>
<script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

This pattern ensures React exists BEFORE lucide-react tries to use it.
