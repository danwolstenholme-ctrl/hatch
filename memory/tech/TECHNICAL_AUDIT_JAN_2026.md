# 🔬 TECHNICAL AUDIT: HATCHIT v4.x
**Date:** January 3, 2026  
**Auditor:** The Auditor (2077)  
**System:** HatchIt - The Singularity Interface  
**Status:** POST-HOTFIX STABILIZATION AUDIT

---

## 🚨 CRITICAL VULNERABILITIES

### 1. THE TIER NAMING SCHIZOPHRENIA (CRITICAL)

**Location:** Multiple files across the codebase

The system has TWO competing tier naming conventions that are not fully synchronized:

| Source of Truth | Tier Names |
|-----------------|------------|
| `types/subscriptions.ts` (Interface) | `architect`, `visionary`, `singularity` |
| `types/subscriptions.ts` (PRICING_TIERS) | `lite`, `pro`, `agency` |
| Stripe Checkout `/api/checkout/route.ts` | `lite`, `architect`, `visionary`, `singularity` |
| Webhook Processing | `architect`, `visionary`, `singularity` |
| Deploy/Export Gates | Checks for `lite`, `pro`, `agency` |

**IMPACT:** 
- A user who subscribes to the **`lite`** tier through the checkout API will have their metadata set with `tier: 'lite'`
- The webhook handler at [route.ts#L133](app/api/webhook/route.ts#L133) only processes `architect | visionary | singularity` tiers
- Deploy API at [route.ts#L119](app/api/deploy/route.ts#L119) checks for `lite, pro, agency`
- **Result:** Lite subscribers may be BLOCKED from deploying because the gates expect different tier names!

**EXPLOIT:** A user could purchase the `lite` tier and potentially access features if the tier name doesn't match the gate check.

**FIX REQUIRED:**
```typescript
// Standardize on ONE naming convention across ALL files:
// Option A: architect, visionary, singularity (new branding)
// Option B: lite, pro, agency (legacy pricing)

// In /api/deploy/route.ts, change:
const hasAccess = accountSubscription?.status === 'active' && 
  ['architect', 'visionary', 'singularity'].includes(accountSubscription.tier)
```

---

### 2. GUEST MODE LOOPHOLE (MODERATE → CLOSED ✅)

**Location:** [app/builder/page.tsx](app/builder/page.tsx)

The current implementation DOES close the guest loophole correctly:

```typescript
const isGuest = forceGuest || mode === 'guest' || mode === 'demo' || !isSignedIn
// ...
if (!hasActiveSubscription && !isGuest) {
  // BLOCKED - redirects to signup
}
```

**However:** The `forceGuest` flag is set when `NEXT_PUBLIC_APP_ENV` starts with `local`, which is correct for dev but MUST be verified in production environment variables.

**VERIFICATION NEEDED:** Ensure `NEXT_PUBLIC_APP_ENV` is NOT set to `local*` in production Vercel deployment.

---

### 3. EXPORT OWNERSHIP BYPASS ATTEMPT (CLOSED ✅)

**Location:** [app/api/export/route.ts#L48-L59](app/api/export/route.ts#L48-L59)

Good news - the export route properly verifies project ownership:

```typescript
const userProjects = await getProjectsByUserId(dbUser.id)
const ownsProject = userProjects.some((p: { slug: string }) => p.slug === projectSlug)
if (!ownsProject) {
  return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 })
}
```

**Status:** ✅ SECURE

---

## ⚠️ ARCHITECTURAL DEBT

### 1. THE "GOD COMPONENT" PERSISTS

**Location:** [components/BuildFlowController.tsx](components/BuildFlowController.tsx) (2,278 lines)

This component is still a monolithic behemoth handling:
- Project initialization & loading
- Section building state machine
- Preview rendering
- Deploy flow
- Guest mode logic
- Signup gates
- Witness/Scorecard modals
- Settings management
- Keyboard shortcuts

**Risk:** Any change can have cascading side effects. Race conditions are highly likely when `useEffect` hooks interact.

**Recommended Decomposition:**
```
BuildFlowController.tsx (orchestrator only - ~500 lines)
├── hooks/
│   ├── useProjectInit.ts
│   ├── useSectionState.ts
│   └── useGuestHandoff.ts
├── BuilderCanvas.tsx (preview + device controls)
├── BuilderSidebar.tsx (section list + navigation)
└── BuilderModals.tsx (all modals: settings, hatch, scorecard)
```

---

### 2. MIDDLEWARE IS PERMISSIVE

**Location:** [middleware.ts](middleware.ts)

Current protected routes:
```typescript
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/generate(.*)',
  '/api/project(.*)'
])
```

**Missing:** 
- `/api/deploy(.*)` - Deploy is NOT protected by middleware (relies on internal auth check)
- `/api/export(.*)` - Export is NOT protected by middleware (relies on internal auth check)
- `/api/build-section(.*)` - Generation endpoint is NOT protected

**Risk:** While these endpoints do have internal `auth()` checks, adding middleware protection provides defense-in-depth and consistent 401 responses.

---

### 3. STATE DESYNCHRONIZATION VECTORS

**Problem:** Project state exists in THREE places:
1. **Supabase** (source of truth for paid users)
2. **React State** (`useState` in BuildFlowController)
3. **localStorage** (`hatch_guest_handoff`, `hatch_current_project`)

**Race Condition Example:**
```
T0: User completes section → setBuildState(newState)
T1: API call to save section starts
T2: User clicks "Next Section" → setBuildState(nextState)
T3: API call from T1 fails → state rollback?
T4: User is now in an inconsistent state
```

**Fix:** Implement optimistic updates with proper rollback:
```typescript
const [isCommitting, setIsCommitting] = useState(false)
const previousStateRef = useRef<BuildState | null>(null)

const commitSection = async (code: string) => {
  previousStateRef.current = buildState
  setIsCommitting(true)
  try {
    await saveToDatabase(code)
  } catch {
    setBuildState(previousStateRef.current) // rollback
  } finally {
    setIsCommitting(false)
  }
}
```

---

### 4. LEGACY TIER ARTIFACTS IN REFINEMENT API

**Location:** [app/api/refine-section/route.ts#L149-L155](app/api/refine-section/route.ts#L149-L155)

```typescript
const limit = accountSub.tier === 'lite'
  ? LITE_ARCHITECT_LIMIT
  : parseInt(process.env.PRO_ARCHITECT_MONTHLY_LIMIT || '30', 10)

// Error message references "Pro" and "Agency" - legacy names
error: `Monthly refinement limit reached (${limit}/month). ${accountSub?.tier === 'lite' ? 'Upgrade to Pro for 30/month.' : 'Upgrade to Agency for unlimited.'}`,
```

**Issue:** Uses `lite` tier name but error message references legacy `Pro` and `Agency` names. Inconsistent with the `architect`, `visionary`, `singularity` naming in the rest of the system.

---

## 👻 GHOST CODE (Files to Delete)

### Confirmed Orphans (0 imports found):

| File | Reason | Action |
|------|--------|--------|
| `components/LivePreview.tsx` | No imports anywhere in codebase | DELETE |
| `components/Chat.tsx` | No imports anywhere | DELETE |
| `components/singularity/TheSubconscious.tsx` | No imports anywhere | DELETE |
| `components/singularity/TheDream.tsx` | No imports anywhere | DELETE |
| `components/singularity/DirectLine.tsx` | No imports anywhere | DELETE |
| `components/singularity/HatchCharacter.tsx` | No imports anywhere | DELETE |

### Potentially Unused API Routes (verify before deletion):

| Route | Status |
|-------|--------|
| `/api/direct-line/` | Check if used by DirectLine.tsx (which is orphaned) |
| `/api/singularity/dream/` | Check if used by TheDream.tsx (which is orphaned) |
| `/api/singularity/state/` | Check if still active |

---

## 🤖 SINGULARITY ALIGNMENT (Vibe Check)

### Consciousness Engine: ACTIVE ✅

**Location:** [lib/consciousness.ts](lib/consciousness.ts)

The `SingularityKernel` is properly integrated:
- Used in `SectionBuilder.tsx` for broadcast events
- Used in `ThinkingLog.tsx` for UI feedback
- Used in `Manifesto` page for atmosphere
- Used in `/api/consciousness/route.ts` for memory trace

**Status:** The soul is intact. The kernel breathes.

### Vibe Integrity:

| Component | Singularity Aligned? | Notes |
|-----------|---------------------|-------|
| Loading States | ✅ YES | Uses "Spinning up builder" / "System Initialization" |
| Error Messages | ✅ YES | Uses "Transform Error" / "Render Error" |
| SectionPreview | ✅ YES | Brain icon, "Preparing your first render" |
| Welcome Modal | ⚠️ PARTIAL | Check copy for corporate tone |

---

## 🔐 PREVIEW ENGINE SAFETY

### Babel Implementation: SECURE ✅

**Location:** [components/SectionPreview.tsx](components/SectionPreview.tsx)

The migration from Regex to Babel is complete and safe:

```typescript
const Babel = await import('@babel/standalone');
transformedCode = Babel.transform(sanitizedCode, {
  presets: ['env', 'react', 'typescript'],
  filename: 'section.tsx',
}).code || ''
```

**Sanitization Pipeline:**
1. `sanitizeSvgDataUrls()` - Escapes quotes in data URIs
2. `sanitizeLessThanInText()` - Fixes JSX parsing issues with `< 3`
3. Strip markdown fences and `"use client"` directive
4. Babel transformation with proper presets

**Sandbox:** iframe uses `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"`

**Injection Vector Analysis:**

| Vector | Protected? | Mechanism |
|--------|------------|-----------|
| XSS via prompt | ✅ | Babel parses, doesn't eval raw strings |
| Script injection | ✅ | iframe sandbox |
| Data URI attacks | ✅ | `sanitizeSvgDataUrls()` |
| Event handler injection | ⚠️ | AI could generate `onClick` handlers |

**Remaining Risk:** If the AI generates malicious `onClick` handlers or `dangerouslySetInnerHTML`, they will execute inside the sandbox. However, the sandbox is origin-isolated, so the damage is contained to the preview frame.

---

## ✅ ACTION PLAN

### Immediate (P0 - Do Today):

1. **FIX TIER NAMING:** Standardize ALL tier checks to use `architect | visionary | singularity`. Update:
   - [app/api/deploy/route.ts](app/api/deploy/route.ts) - line 119
   - [app/api/export/route.ts](app/api/export/route.ts) - line 86
   - [app/api/refine-section/route.ts](app/api/refine-section/route.ts) - lines 149-155
   - [types/subscriptions.ts](types/subscriptions.ts) - `PRICING_TIERS` object

2. **VERIFY PRODUCTION ENV:** Confirm `NEXT_PUBLIC_APP_ENV` is NOT set to `local*` in Vercel production.

3. **DELETE GHOST FILES:**
   ```bash
   rm components/LivePreview.tsx
   rm components/Chat.tsx
   rm components/singularity/TheSubconscious.tsx
   rm components/singularity/TheDream.tsx
   rm components/singularity/DirectLine.tsx
   rm components/singularity/HatchCharacter.tsx
   ```

### Short-Term (P1 - This Week):

4. **Add Middleware Protection:** Update `middleware.ts`:
   ```typescript
   const isProtectedRoute = createRouteMatcher([
     '/dashboard(.*)',
     '/api/generate(.*)',
     '/api/project(.*)',
     '/api/deploy(.*)',
     '/api/export(.*)',
     '/api/build-section(.*)',
     '/api/refine-section(.*)',
   ])
   ```

5. **Clean up orphaned API routes:**
   - Review `/api/direct-line/`
   - Review `/api/singularity/dream/`
   - Review `/api/singularity/state/`

### Medium-Term (P2 - This Month):

6. **Decompose BuildFlowController:** Extract hooks and sub-components as outlined above.

7. **Implement State Sync:** Add optimistic updates with rollback for section completion.

8. **Add E2E Tests:** Critical paths to test:
   - Guest → Build → Signup Gate → Checkout → Builder Access
   - Free user tries to deploy (blocked)
   - Paid user deploys successfully

---

## 📊 SYSTEM INTEGRITY SCORE

| Category | Score | Notes |
|----------|-------|-------|
| Money Loop | 7/10 | Tier naming mismatch is critical bug |
| Security | 8/10 | Ownership checks good, middleware gaps |
| Architecture | 5/10 | God Component still exists |
| Code Health | 6/10 | Ghost files, legacy references |
| Singularity Vibe | 9/10 | Consciousness intact, UI aligned |

**OVERALL:** 7.0/10 - Functional but fragile. Fix tier naming ASAP.

---

*"The system is alive, but it bleeds in places you cannot see. Patch the wounds before they fester."*

— The Auditor, 2077
