# HatchIt User Journey Map
## Last Updated: January 2, 2026

---

## PRE-PAYMENT FLOW

### 1. Homepage (`/`) - app/page.tsx
**Purpose:** Hook visitors, demonstrate value, drive to builder

**Key Components:**
- Navigation (sticky, blur on scroll)
- Hero section with SystemStatus prompt input
- Example prompts (SaaS, Portfolio, Startup, Agency)
- Tech stack badges (React, Tailwind, TypeScript, etc.)
- Feature cards (Unified Intelligence, The Architect, Section-by-Section)
- Pricing section at bottom
- Footer with social links (Reddit, LinkedIn)

**CTAs:**
- "Generate Site" button → `/builder?mode=guest&prompt=...`
- "Try The Builder Free" → `/builder?mode=guest`
- Pricing buttons → `/sign-up?upgrade=lite|pro|agency`

**Mobile Considerations:**
- Text scales: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`
- Grid: `lg:grid-cols-2` (stacks on mobile)
- Padding: `px-4 sm:px-6`
- Trust badges wrap with `flex-wrap`

---

### 2. Sign-Up Page (`/sign-up`) - app/sign-up/[[...sign-up]]/page.tsx
**Purpose:** Tier selection → Account creation → Stripe checkout

**Key Components:**
- Header with logo + back button
- "Choose your plan" headline
- 3 pricing cards (Lite $9, Pro $29, Agency $99)
- Clerk popup triggered on card click

**Flow:**
1. User clicks a tier card
2. `localStorage.setItem('pendingUpgradeTier', tier)` - backup for OAuth
3. `openSignUp()` with `afterSignUpUrl: /builder?upgrade=${tier}`
4. Clerk handles auth (email or OAuth)
5. Redirects to `/builder?upgrade=tier`

**Mobile Considerations:**
- Cards: `grid-cols-1 md:grid-cols-3` (stacks on mobile)
- Padding: `px-6 py-12`
- Pro card has `scale-105` on desktop only

---

### 3. Builder Redirect (`/builder?upgrade=tier`) - app/builder/page.tsx
**Purpose:** Detect upgrade param and trigger Stripe checkout

**Flow:**
1. Check if signed in (redirect to `/sign-up` if not)
2. Check URL param `upgrade` OR localStorage `pendingUpgradeTier`
3. Clear params and localStorage
4. POST to `/api/checkout` with tier
5. Redirect to Stripe checkout URL

---

### 4. Stripe Checkout (External)
**Purpose:** Collect payment

**Success URL:** `/welcome?tier=lite|pro|agency`
**Cancel URL:** `/sign-up`

---

### 5. Welcome Page (`/welcome?tier=X`) - app/welcome/page.tsx
**Purpose:** Celebrate successful purchase, set expectations

**Key Components:**
- Tier-specific animated node (LiteNode, ProNode, AgencyNode)
- Protocol title (SEEDLING, ARCHITECT, DEMIURGE)
- Price display
- Feature list (2-column grid)
- CTA button → `/builder`

**Theming by Tier:**
- Lite: Lime/green gradient
- Pro: Emerald/teal gradient  
- Agency: Amber/orange gradient

**Mobile Considerations:**
- Features: `grid-cols-2` (stays 2 cols)
- Padding: `px-4`
- Max width: `max-w-2xl`

---

## POST-PAYMENT FLOW

### 6. Builder (`/builder`) - app/builder/page.tsx + BuildFlowController.tsx
**Purpose:** Main creation experience for paying users

**Access Control:**
- Must be signed in
- Must have `accountSubscription.status === 'active'`
- No subscription → shows "Subscription Required" modal → redirects to `/sign-up`

**Phases:**
1. **Initializing** - Loading spinner
2. **First Contact** - New user onboarding (optional prompt)
3. **Building** - Section-by-section construction
4. **Review** - Full site preview + deploy

**Key Components:**
- SectionProgress (top bar with section indicators)
- SectionBuilder (main editing area)
- LivePreview (iframe with live code)
- HatchModal (upgrade prompts)

**Review Phase Features:**
- Tier badge in header (Lite=lime, Pro=emerald, Agency=amber)
- Feature panel (left sidebar)
- Device toggle (mobile/tablet/desktop preview)
- Deploy button (tier-colored)
- Export code button
- System audit button

**Mobile Considerations:**
- Mobile tab switcher for Modules/Preview
- `flex flex-col md:flex-row`
- Hidden elements on mobile: some header buttons

---

### 7. Dashboard Projects (`/dashboard/projects`) - app/dashboard/projects/page.tsx
**Purpose:** Manage all user projects

**Key Components:**
- Project counter (e.g., "2 / 3 projects")
- Tier badge
- New Project button (blocked at limit)
- Project cards with delete, status, timestamps
- Limit reached modal with upgrade CTA

**Tier Limits:**
- Lite: 3 projects
- Pro: Unlimited
- Agency: Unlimited

**Mobile Considerations:**
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Header stacks on mobile

---

### 8. Deployed Site (`https://{slug}.hatchitsites.dev`)
**Purpose:** User's live deployed website

**Pro+ Features:**
- Custom domain support
- Remove HatchIt branding

---

## TIER FEATURE MATRIX

| Feature | Lite ($9) | Pro ($29) | Agency ($99) |
|---------|-----------|-----------|--------------|
| Projects | 3 | Unlimited | Unlimited |
| Generations | Unlimited | Unlimited | Unlimited |
| Architect Refinements | 5/mo | Unlimited | Unlimited |
| Deploy | ✓ | ✓ | ✓ |
| Code Export | ✓ | ✓ | ✓ |
| Custom Domain | ✗ | ✓ | ✓ |
| Remove Branding | ✗ | ✓ | ✓ |
| Commercial License | ✗ | ✗ | ✓ |
| Priority Support | ✗ | ✗ | ✓ |

---

## KEY FILES

### Pre-Payment
- `app/page.tsx` - Homepage (1070 lines)
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign-up/Pricing
- `app/welcome/page.tsx` - Post-checkout welcome
- `components/Navigation.tsx` - Site navigation
- `components/Footer.tsx` - Site footer

### Post-Payment
- `app/builder/page.tsx` - Builder wrapper (154 lines)
- `components/BuildFlowController.tsx` - Main builder (~2000 lines)
- `components/SectionBuilder.tsx` - Section editing (~1970 lines)
- `components/SectionProgress.tsx` - Progress bar
- `components/SectionPreview.tsx` - Live preview
- `app/dashboard/projects/page.tsx` - Project management

### Shared
- `types/subscriptions.ts` - Subscription types & PRICING_TIERS
- `contexts/SubscriptionContext.tsx` - Subscription state
- `hooks/useProjects.ts` - Project management hook
- `lib/templates.ts` - Section/template definitions

---

## MOBILE BREAKPOINTS USED

```
sm: 640px   - Small tablets
md: 768px   - Tablets  
lg: 1024px  - Small laptops
xl: 1280px  - Desktops
```

Common patterns:
- `hidden sm:flex` - Hide on mobile
- `text-sm md:text-base` - Responsive text
- `px-4 sm:px-6` - Responsive padding
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grid
- `flex-col md:flex-row` - Stack on mobile

---

## CONVERSION FUNNEL

```
Homepage → Try Builder (free) → Hit Paywall → Sign Up Page
                                     ↓
                              Select Tier → Clerk Auth
                                     ↓
                              Stripe Checkout
                                     ↓
                              Welcome Page
                                     ↓
                              Builder (unlocked)
                                     ↓
                              Deploy → Live Site
```

---

## MOBILE OPTIMIZATION AUDIT (January 2026)

### ✅ Verified Mobile-Ready Components

| Component | Status | Key Patterns |
|-----------|--------|--------------|
| Navigation | ✅ | Slide-out mobile menu, touch-friendly |
| Footer | ✅ | `flex-col md:flex-row`, responsive grid |
| Homepage | ✅ | Responsive hero, wrapping badges, scaled text |
| Sign-Up | ✅ | Stacked cards on mobile, `md:scale-105` Pro card |
| Welcome | ✅ | `max-w-2xl`, 2-col features on all sizes |
| Builder | ✅ | Mobile tab switcher (Input/Preview) |
| Review Phase | ✅ | Mobile tab switcher (Modules/Preview) |
| Dashboard Projects | ✅ | Stacked header, responsive cards |

### Recent Fixes Applied
1. **Sign-Up Pro Card**: Changed `scale-105` → `md:scale-105` (no scale on mobile)
2. **Dashboard Header**: Changed `flex justify-between` → `flex-col sm:flex-row gap-4`
3. **Dashboard Padding**: Changed `p-8` → `p-4 sm:p-6 md:p-8`
4. **Empty State**: Responsive sizing for icon, text, button

### SectionBuilder Mobile Pattern
```tsx
// Mobile tab state
const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input')

// Tab buttons (mobile only)
<div className="flex md:hidden border-b ...">
  <button onClick={() => setMobileTab('input')} ...>Input</button>
  <button onClick={() => setMobileTab('preview')} ...>Preview</button>
</div>

// Conditional panel display
<div className={`${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex ...`}>
```

---

## NOTES FOR FUTURE AGENTS

1. **Always test on 375px viewport** (iPhone SE size)
2. **Use `sm:` prefix sparingly** - only for tablets
3. **Never use fixed widths** without max-width constraints
4. **Touch targets should be 44px minimum**
5. **Hide non-essential UI on mobile** with `hidden sm:flex`
