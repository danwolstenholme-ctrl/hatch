# Known Bugs

Last updated: 5 January 2026 Evening

---

## 🔴 Critical

### /builder Black Screen for Signed-In Users
**Location:** BuildFlowController.tsx → auto-initialization useEffect (~line 462)  
**Symptom:** Signed-in user visits /builder, sees loading then black screen  
**Root Cause:** 
- useEffect checks for `existingProjectId` (from URL)
- Then checks `hatch_current_project` in localStorage
- If project doesn't exist/load fails → stuck state
- `initializeProject()` may not fire or fails silently

**Workaround:** Clear localStorage, go to `/demo` instead

**Fix Required:** Debug the auto-initialization logic in BuildFlowController

### Resume Session → Black Screen  
**Location:** HomepageWelcome.tsx → /builder  
**Same root cause as above**

---

## 🟡 Medium

### BuilderWelcome Modal Ugly
**Location:** components/BuilderWelcome.tsx  
**Issue:** User finds it ugly, wants removed - too many modals in the flow
**Action:** Consider removing or redesigning with glass effect

---

## 🟢 Low / Polish

### Device selector in loading state is visual-only
**Location:** SectionBuilder.tsx (~line 1821)  
**Symptom:** Mobile/Tablet/Desktop buttons don't actually change preview size during generating state  
**Impact:** Low - purely cosmetic during loading

---

## 📋 Technical Debt

### SectionBuilder.tsx is 3000+ lines
- Contains multiple inline components (GuestRefineBar, etc.)
- Should extract to `components/builder/` folder
- BottomBar.tsx was created but not wired in yet

### Duplicate loading state UIs
- GeneratingModal (new, used in demo)
- BuildProgressDisplay (old, used in auth builder)
- Should consolidate to one component

---

## ✅ Fixed This Session

- Bottom bar styling (rounded-full → rounded-xl)
- Glass effect on modals (GeneratingModal, HomepageWelcome)
- Loading facts during generation wait
- Preview toolbar on-brand styling
- Demo mode now shows device selector toolbar
- Homepage welcome auth-aware resume URLs
