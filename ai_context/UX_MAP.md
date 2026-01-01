# UX Master Map & Audit Log

**Status**: In Progress
**Last Updated**: 2026-01-01
**Objective**: Ensure every button, link, and interaction in the HatchIt Builder is functional, consistent, and monetized correctly.

---

## 1. The Builder Core (`/builder`)

### A. Navigation Bar (`SectionProgress.tsx`)
- [x] **Hatch Logo Menu**
    - [x] `Start Over`: Must clear `localStorage` + Reset State + Redirect to `/builder`.
    - [x] `Go Home`: Must redirect to `/dashboard`.
    - [x] `View Brand`: Must open Brand Modal (if brand exists).
- [ ] **Section List (Sidebar)**
    - [ ] `Click`: Navigate to specific section (only if completed/current).
    - [ ] `Status Icons`: Checkmark (Done), Circle (Current), Lock (Future).
- [ ] **Mobile Menu**
    - [ ] `Toggle`: Smooth open/close.
    - [ ] `Responsiveness`: Must not overlap content on small screens.

### B. The Canvas (`SectionBuilder.tsx`)
- [x] **Input Stage**
    - [x] `Prompt Input`: Textarea expands/contracts.
    - [x] **Suggestions**:
        - [x] **Free**: Show 2 suggestions.
        - [x] **Pro/Agency**: Show 4 suggestions.
        - [x] **Unlock UI**: "Unlock Pro Suggestions" button for Free tier.
    - [x] `Build Button`: Disabled if input is empty.
- [ ] **Generation Stage**
    - [ ] `Thinking Log`: Animations play smoothly.
    - [ ] `Error Handling`: If API fails, show "Retry" button (not white screen).
- [x] **Review Stage**
    - [x] `Preview`: Renders correctly (Babel engine).
    - [x] `Refine Input`:
        - [x] **Free**: Locked with overlay.
        - [x] **Pro/Agency**: Unlocked.
    - [x] `Architect Polish`:
        - [x] **Free**: Locked with "Unlock" overlay.
        - [x] **Pro**: Credit system (30/mo).
        - [x] **Agency**: Unlimited (∞).
    - [x] `Continue`: Saves section to DB -> Moves to next.

### C. The Preview (`FullSitePreviewFrame`)
- [x] **Rendering**: Uses `@babel/standalone` (Fixed Error #130).
- [x] **Icons**: Uses `LucideProxy` (Fixed crashes).
- [ ] **Links**: All `<a>` tags in preview must have `target="_blank"`.
- [ ] **Responsiveness**: Mobile/Tablet/Desktop toggles resize iframe correctly.

### D. The Deployment Flow (`BuildFlowController.tsx`)
- [x] **Review Screen**
    - [x] `Section List`: Click to edit previous section.
    - [x] `Deploy Button`:
        - [x] **Free**: Opens Paywall Modal (Verified in `handleDeploy`).
        - [x] **Paid**: Triggers Vercel/Netlify deploy.
    - [x] `Success Modal`: Shows live URL + "Next Steps".

---

## 2. The Dashboard (`/dashboard`)

### A. Sidebar (`DashboardLayout`)
- [x] **Navigation Links**: Removed broken links (Agents, Settings, etc.).
- [x] **Active State**: Highlights current page correctly.

### B. Project List (`/dashboard/projects`)
- [x] **Project Card**:
    - [x] `Edit`: Opens Builder with correct state.
    - [x] `View`: Opens live site (if deployed).
    - [x] `Delete`: Confirms before deleting. (Fixed: Now accepts ID).

---

## 3. Global Consistency

### A. Authentication
- [x] **Protected Routes**: `/builder`, `/dashboard` redirect to `/sign-in` if logged out (Handled by Clerk Middleware).
- [ ] **Auth State**: `useUser()` syncs correctly with `useSubscription()`.

### B. Monetization (Tier Logic)
- [x] **Free**:
    - [x] Builder: 2 Suggestions, No Refine.
    - [x] Deploy: Locked.
- [x] **Pro**:
    - [x] Builder: 4 Suggestions, Refine, 30 Polish credits.
    - [x] Deploy: Unlocked.
- [x] **Agency**:
    - [x] Builder: 4 Suggestions, Refine, ∞ Polish credits.
    - [x] Deploy: Unlocked.

---

## 4. Known Issues (To Fix)
1. [ ] **"God Component"**: `app/builder/page.tsx` is too large (3500+ lines). Needs refactor.
2. [ ] **Data Persistence**: `localStorage` is fragile. Move to Supabase-first sync.
3. [ ] **Preview Links**: Clicking a link in the preview iframe might navigate the iframe away from the preview.
