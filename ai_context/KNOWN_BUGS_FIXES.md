# KNOWN BUGS & FIXES
> **Recurring issues and their solutions. Check here FIRST before debugging.**

---

## 1. NODE_MODULES / TAILWIND CACHE CORRUPTION

### Symptoms
- Background gradients stop rendering
- Custom CSS utilities (`bg-grid-white`, radial gradients) don't compile
- Homepage looks "flat" — missing atmosphere/glow layers
- No build errors, but styles silently fail

### Cause
Tailwind v4 JIT compiler or Next.js `.next` cache gets corrupted. The custom utilities stop being compiled into the CSS output even though the code is correct.

### Fix
**Nuclear option — full clean rebuild:**
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Delete corrupted files
Remove-Item -Recurse -Force node_modules, .next, package-lock.json

# Fresh install
npm install

# Restart dev server
npm run dev
```

### Frequency
This has happened **3+ times** as of Jan 2026. If backgrounds look wrong and code looks correct, try this first.

---

## 2. MOBILE BREAKPOINT GLOW HIDDEN (md: breakpoint)

### Symptoms
- Homepage looks beautiful at 768px+ (desktop)
- Homepage looks flat/dead at 767px and below (mobile)
- Sharp visual difference at exactly the `md:` breakpoint

### Cause
Background atmosphere layers were using `hidden md:block`:
```tsx
// BAD - hidden on mobile
<div className="hidden md:block absolute inset-0 blur-3xl ..." />
```

### Fix
Remove `hidden md:block`, use opacity scaling instead:
```tsx
// GOOD - visible on all, reduced intensity on mobile
<div className="absolute inset-0 blur-3xl opacity-60 md:opacity-80" />
```

### Location
`app/page.tsx` — the glow/vignette layers near the top of the `Home()` component return statement.

---

## 3. TAILWIND v4 GRADIENT SYNTAX BREAK

### Symptoms
- `bg-[radial-gradient(...)]` with `from-*/via-*/to-*` utilities doesn't work
- Gradient appears as solid color or transparent

### Cause
Tailwind v4 doesn't populate `--tw-gradient-stops` CSS variable when using arbitrary gradient values. The `from-emerald-500/10 via-transparent to-transparent` classes only work with built-in `bg-gradient-to-*` directions.

### Fix
Use inline `style` with explicit RGBA values instead:
```tsx
// BAD - broken in Tailwind v4
<div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

// GOOD - works everywhere
<div style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 50%, transparent 100%)' }} />
```

---

## 4. QUICK DIAGNOSTIC CHECKLIST

If the homepage looks wrong:

1. **Check DevTools computed styles** — are the gradients actually being applied?
2. **Check breakpoint** — resize to 768px, does it suddenly look right? → Mobile glow hidden issue
3. **Check Tailwind output** — is the custom class in the compiled CSS?
4. **When in doubt** — nuke `node_modules` and `.next`, fresh install

---

*Last updated: Jan 2, 2026*
*Occurrences: 3+ times*
