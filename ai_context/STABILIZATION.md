# HatchIt Stabilization Tracker

**Created:** 10 January 2026  
**Goal:** Make core mobile flow rock-solid before scaling ads

---

## Critical Path (Must Work Perfectly)

```
User lands → Signs up → Enters builder → Builds sections → Previews → Ships
```

---

## Session 1: Mobile UX Polish (10 Jan 2026 - NOW)

### ✅ Completed This Session
- [x] Section type constraints (headers don't become heroes)
- [x] Dashboard mobile layout redesign
- [x] Post-payment page simplified
- [x] "Try" suggestions hidden on mobile (too cramped)
- [x] Ship button loading states
- [x] Deploy stays in builder, shows URL
- [x] **Tab switching instant** - removed transition delays
- [x] **Backdrop blur removed on mobile** - major iOS Safari perf fix
- [x] **Section click feedback** - larger touch targets, instant active state
- [x] **iOS input zoom fixed** - all inputs now 16px min font
- [x] **Preview iframe always mounted** - tab switch no longer re-mounts iframe

### 🔧 In Progress
_None - Session 1 complete_

---

## Session 2: Data Architecture

### ✅ Completed
- [x] **Deploy now saves to Supabase** - updates `builds.deployed_url` and `projects.deployed_slug`
- [x] **Project status updated** - sets `status: 'deployed'` and `deployed_at`
- [x] **projectId passed from builder** - deploy API can find the right build
- [x] **Type safety fixed** - added `deployed_slug` and `deployed_at` to DbProject interface
- [x] **Backward compatible** - still saves to Clerk metadata as backup

### Architecture Now
```
Deploy API receives projectId
  ↓
1. Deploy to Vercel → get URL
2. Update builds.deployed_url (for dashboard history)
3. Update projects.deployed_slug + deployed_at (for project status)
4. Update Clerk metadata (backup/legacy)
  ↓
Dashboard reads from:
- builds.deployed_url (deployments tab)
- projects.status / deployed_slug (project cards)
```

### Issues (Resolved)
- [x] **Deploy saves to Clerk, Dashboard reads Supabase** - Fixed: now saves to both
- [x] **builds table not populated on deploy** - Fixed: updates build.deployed_url
- [x] **Project state fragmentation** - Fixed: project.status set to 'deployed'

---

## Session 3: BuildFlowController Refactor

### Current State
- 2,690 lines, single file
- Manages: build state, preview, sidebar, deploy, settings, modals
- Any change risks breaking something else

### Extraction Plan
1. Extract `useBuilderState` hook - all build/section state
2. Extract `PreviewPanel` component - iframe + device switcher
3. Extract `DeployFlow` component - ship button + deploy modal
4. Keep BuildFlowController as orchestrator only

---

## Session 4: Design System Consistency

### Issues
- Homepage: Beautiful gradients, animated elements
- Dashboard: Flat, utilitarian
- Builder: Glass morphism
- No shared component library

### Fix
- Create `/components/ui/` with shared primitives
- Button, Card, Badge, Input with consistent styling
- Apply across all pages

---

## Session 5: Testing & Edge Cases

### Mobile Safari Specific
- [ ] Test on actual iPhone (not just DevTools)
- [ ] Input focus zoom issues
- [ ] Safe area insets (notch/home indicator)
- [ ] Keyboard handling in builder input

### Error States
- [ ] Network failure during build
- [ ] Claude API timeout
- [ ] Deploy failure
- [ ] Auth session expiry mid-build

---

## Priority Order

1. ~~**NOW:** Mobile UX polish (clunky feel)~~ ✅ Done
2. ~~**Next:** Data architecture (broken deployments)~~ ✅ Done
3. **Next:** Component extraction (maintainability)
4. **Later:** Design system (polish)
5. **Ongoing:** Testing

---

## Metrics to Track

- Mobile bounce rate (target: <50%)
- Builder completion rate (target: >30%)
- Deploy success rate (target: >95%)
- Time to first section built (target: <60s)

---

## Notes

_Add session notes here as work progresses_

### 10 Jan 2026 Evening
- Multiple hotfixes deployed
- Core flow works but feels clunky
- Starting Session 1 polish work now

### 11 Jan 2026 - Quality Audit
After user deployed a full site successfully:
- ✅ Section navigation verified working (handleSectionClick + useEffect reset)
- ✅ Editing flow verified (dbSections updated on complete, props propagate correctly)
- ✅ Dashboard "Visit" button touch target increased (now has bg and padding)
- ✅ Dashboard delete button always visible on mobile (was hover-only)
- ✅ Billing page button touch targets increased (py-1.5 → py-2.5)
- ✅ Active states added to billing buttons

**Key Findings:**
- Section state reset logic in SectionBuilder is solid - resets all fields on dbSection.id change
- buildState.sectionCode is properly maintained when navigating between sections
- handleRebuild and handleRemix functions exist but unused (dead code) - refine flow covers the use case
- Dashboard derived URL display working: `https://${project.deployed_slug}.hatchitsites.dev`

### 11 Jan 2026 - Deploy Failure Prevention
Added safeguards to prevent build failures reaching Vercel:
- ✅ GitHub Action for type checking on push/PR (.github/workflows/typecheck.yml)
- ✅ Pre-push git hook runs `tsc --noEmit` locally
- ✅ Removed dead code (handleRebuild, handleRemix in SectionBuilder)
- ✅ Fixed lint warnings (unused variables, const vs let)
- ✅ Removed unused AnimatePresence import
- ✅ Deleted old backup file (page.old.tsx)

**Root cause of Cpu icon failure:** Something added `Cpu` to page.tsx without importing it. Now:
1. Pre-push hook catches this locally
2. GitHub Action catches it before Vercel
3. Vercel build is last line of defense

### 11 Jan 2026 - Continued Improvements
- ✅ Added analytics tracking to section builds and project creation
- ✅ Added character counter hint for minimum 10-char prompt requirement
- ✅ Added tooltip to build button explaining why it's disabled
- ✅ Code audited: error handling solid in all critical API routes
- ✅ Rate limiting in place (20 req/min per user)
- ✅ useMemo/useCallback properly used for performance
- ✅ Loading states comprehensive throughout builder
