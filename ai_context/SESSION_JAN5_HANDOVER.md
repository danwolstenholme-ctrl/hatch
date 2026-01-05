# Session Handover - January 5, 2026

## What Was Fixed This Session

### 1. Guest → Signup → Studio Migration Flow (CRITICAL)

**The Problem:** Users would build something in demo, click Deploy, sign up, and land on an empty Studio page. Their work was lost.

**Root Cause:** `SectionBuilder.tsx`'s `goToSignUp()` function was redirecting to signup WITHOUT first persisting the guest work to localStorage.

**The Fix:** Added handoff persistence before redirect in `goToSignUp()`:
```typescript
// components/SectionBuilder.tsx - goToSignUp()
if (isDemo && generatedCode) {
  const handoffPayload = {
    templateId: 'single-page',
    projectName: brandConfig?.brandName || 'My Demo Project',
    brand: brandConfig,
    sections: [{
      sectionId: dbSection.section_id,
      code: generatedCode,
      userPrompt: prompt || effectivePrompt,
      refined: refined,
      refinementChanges: refinementChanges,
    }],
  }
  localStorage.setItem('hatch_guest_handoff', JSON.stringify(handoffPayload))
}
```

### 2. Wrong Redirect URL

**The Problem:** `goToSignUp()` was redirecting to `currentUrl` (the demo page) instead of `/dashboard/studio`.

**The Fix:** Hardcoded redirect to `/dashboard/studio` - that's where migration logic lives.

### 3. Invalid Tier Name

**The Problem:** Code was using `'pro'` tier which doesn't exist. Valid tiers are: `free`, `architect`, `visionary`, `singularity`.

**The Fix:** Replaced all `'pro'` references with `'visionary'`.

### 4. Server-Side Security (Exploit Prevention)

**The Problem:** No server-side enforcement of project limits. Users could:
- Logout → Clear localStorage → Demo again → Login = unlimited projects

**The Fix:** Added tier checks to:
- `/api/project/route.ts` - POST (create new project)
- `/api/project/import/route.ts` - POST (import guest work)
- `/api/build-section/route.ts` - POST (AI generation)

```typescript
// Example from /api/project/route.ts
function getProjectLimit(tier: string): number {
  if (tier === 'singularity' || tier === 'visionary') return Infinity
  if (tier === 'architect') return 3
  return 3 // free tier
}
```

---

## The Complete Flow (Working)

```
1. User visits hatchit.dev
2. Clicks "Try Demo" → /demo
3. Demo uses BuildFlowController with isDemo=true
4. User builds a section (SectionBuilder renders)
5. Clicks "Deploy" button in GuestRefineBar
6. goToSignUp() fires:
   - Saves hatch_guest_handoff to localStorage
   - Redirects to /sign-up?upgrade=visionary&redirect_url=/dashboard/studio
7. Clerk handles auth on accounts.hatchit.dev
8. Redirects back to /dashboard/studio
9. Studio page useEffect:
   - Reads hatch_guest_handoff from localStorage
   - Calls /api/project/import
   - Clears localStorage
   - User sees their project
```

---

## Key localStorage Keys

| Key | Purpose | Set By | Consumed By |
|-----|---------|--------|-------------|
| `hatch_guest_handoff` | Serialized project data for migration | SectionBuilder.goToSignUp(), BuildFlowController.persistGuestHandoff() | /dashboard/studio page |
| `hatch_preview_*` | Cached preview code (1hr TTL) | SectionBuilder.savePreview() | SectionBuilder.getSavedPreview() |
| `hatch_last_prompt` | Last used prompt | SectionBuilder | Recovery |

---

## Tier System

| Tier | Project Limit | Generation Limit | Export | Deploy |
|------|---------------|------------------|--------|--------|
| free | 3 | 5/day | ❌ | ❌ |
| architect | 3 | Unlimited | ✅ | ✅ |
| visionary | ∞ | Unlimited | ✅ | ✅ |
| singularity | ∞ | Unlimited | ✅ | ✅ |

---

## Debug Logging (Left In Place)

Console logs to watch for during testing:

```
[goToSignUp] Persisting guest handoff: ProjectName 1 sections
[goToSignUp] tier: visionary type: string
[Studio] Attempting to import guest work: ProjectName
[Studio] Import successful: {...}
```

---

## Files Modified This Session

1. **components/SectionBuilder.tsx**
   - Added handoff persistence to `goToSignUp()`
   - Fixed redirect URL to `/dashboard/studio`
   - Fixed tier from `'pro'` to `'visionary'`

2. **app/api/project/route.ts**
   - Added `getProjectLimit()` function
   - Added project count check before creation

3. **app/api/project/import/route.ts**
   - Added project limit check
   - Added debug logging

4. **app/api/build-section/route.ts**
   - Added rate limiting (20/min)
   - Added generation limits (5/day free tier)

5. **app/dashboard/studio/page.tsx**
   - Fixed free tier limit display (was 1, now 3)
   - Added import debug logging

---

## Testing Checklist

- [ ] Fresh incognito → Demo → Build → Deploy → Signup → Studio has project
- [ ] Free tier can't create more than 3 projects (server rejects)
- [ ] Logout → Clear storage → Demo → Login doesn't bypass limits
- [ ] All signup redirects go to `/dashboard/studio`
- [ ] No `[object Object]` in URL params

---

## Architecture Notes

- **Clerk** handles auth, hosted at `accounts.hatchit.dev`
- **Supabase** stores projects/sections
- **Stripe** handles payments, webhook updates Clerk metadata
- User tier stored in `user.publicMetadata.accountSubscription.tier`
