# Session Log: January 5, 2026 - Flow Architecture Fix

## Session Summary
Fixed critical user flow bugs and established clear architectural understanding of Demo → Studio → Builder pipeline.

---

## Key Learnings

### 1. The Correct User Flow (MEMORIZE THIS)
```
GUEST JOURNEY:
/ (homepage)
  → HomepageWelcome modal OR "Try Demo" button
  → SingularityTransition animation
  → /demo (localStorage only, full builder experience)
  → Build/Refine freely (limits: 1 build, 3 refines)
  → Click "Deploy" 
  → HatchModal appears (reason: 'deploy')
  → Sign up
  → /dashboard/studio (MIGRATION HAPPENS HERE)
  → See migrated project in list
  → Click project → /builder?project={id}
  → Now they can deploy (if paid tier)

RETURNING USER:
/ (homepage)
  → Already signed in
  → SingularityTransition → /builder (no project = empty state)
  → OR go to /dashboard/studio to see projects
```

### 2. The Three Main Routes
| Route | Purpose | Auth Required | Data Source |
|-------|---------|---------------|-------------|
| `/demo` | Guest playground | No | localStorage |
| `/dashboard/studio` | Projects list + migration | Yes | Supabase |
| `/builder?project={id}` | Edit specific project | Yes | Supabase |

### 3. Migration Logic Location
**CRITICAL**: Guest work migration ONLY happens in `/dashboard/studio/page.tsx`:
```typescript
// Lines 35-55 in studio/page.tsx
const guestHandoff = localStorage.getItem('hatch_guest_handoff')
if (guestHandoff) {
  // POST to /api/project/import
  // Clear localStorage on success
}
```

The `/builder` route does NOT have migration logic. Always route new signups to Studio first.

### 4. localStorage Keys
- `hatch_guest_handoff` - Serialized project data for migration
- `hatch_preview_{hash}` - Cached preview code
- `hatch_last_prompt` - Last used prompt (for resume)
- `hatch_guest_builds` - Build count (guest limit: 1)
- `hatch_guest_refinements` - Refine count (guest limit: 3)
- `hatch_homepage_welcome_seen` - Dismisses welcome modal

### 5. Tier Gating Summary
| Feature | Guest | Free | Architect ($19) | Visionary ($49) | Singularity ($199) |
|---------|-------|------|-----------------|-----------------|-------------------|
| Build | 1 | 10 | ∞ | ∞ | ∞ |
| Refine | 3 | 1 | ∞ | ∞ | ∞ |
| Deploy | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Code | ❌ | ❌ | ❌ | ✅ | ✅ |
| Download | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ❌ | ✅ | ✅ |
| Project Limit | 0 | 1 | 3 | ∞ | ∞ |

---

## Bugs Fixed This Session

### Bug 1: Empty Screen After Demo Signup
**Symptom**: Guest clicks Deploy → Signs up → Lands on empty/broken page
**Cause**: HatchModal was redirecting to `/builder` (no project ID, no migration)
**Fix**: Changed redirect to `/dashboard/studio` where migration runs

Files changed:
- `components/HatchModal.tsx` (line ~69): `redirectUrl = '/dashboard/studio'`
- `app/demo/page.tsx`: Simplified redirect logic to always go to `/dashboard/studio`

### Bug 2: Signed-in User on /demo
**Symptom**: If signed-in user manually goes to `/demo`, unclear behavior
**Fix**: Auto-redirect to `/dashboard/studio`

---

## Architecture Clarity

### Why `/dashboard/` exists (and why it's redundant)
Current structure:
```
/dashboard/
  layout.tsx    → Nav bar (Studio | Billing | Builder)
  studio/       → Projects list
  billing/      → Subscription management
```

The `/dashboard/` wrapper just provides navigation between 2 pages. Could be simplified to:
```
/studio/        → Projects
/billing/       → Subscription
```

**Decision**: Keep for now, refactor later. The flow works.

### One Builder Component, Two Routes
- `BuildFlowController.tsx` is the single source of truth
- `/demo/page.tsx` renders it with `isDemo={true}`
- `/builder/page.tsx` renders it with `isDemo={false}` and `existingProjectId`

---

## Files Modified This Session
1. `components/HatchModal.tsx` - Fixed redirect URL
2. `app/demo/page.tsx` - Simplified signed-in redirect
3. `components/SectionBuilder.tsx` - Added card wrapper around GuestRefineBar (styling)

## Previous Session Work (inherited)
- Replaced fake AI theater with honest build progress
- BuildFlowController now shows real streaming status

---

## For Next Session

### Potential Improvements
1. **Route simplification**: Consider `/studio` instead of `/dashboard/studio`
2. **Direct-to-builder after migration**: After signup, could migrate then auto-redirect to `/builder?project={newId}` for smoother UX
3. **Homepage signed-in state**: Currently goes to `/builder` with no project - should probably go to `/dashboard/studio`

### Testing Checklist
- [ ] Guest: Homepage → Demo → Build → Deploy → Signup → See project in Studio
- [ ] Guest: Refine 3 times → Lock appears
- [ ] Signed-in free: Can build 10 times
- [ ] Architect: Can deploy
- [ ] Visionary: Can view code + deploy

---

## Key Code Locations
| What | Where |
|------|-------|
| Tier checking | `components/BuildFlowController.tsx` lines 324-360 |
| Deploy gating | `components/BuildFlowController.tsx` line 868+ |
| Migration | `app/dashboard/studio/page.tsx` lines 35-55 |
| HatchModal | `components/HatchModal.tsx` |
| Guest limits | `components/SectionBuilder.tsx` lines 700-755 |
