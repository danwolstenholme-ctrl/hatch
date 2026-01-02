# AI CONTEXT & KNOWLEDGE BASE
> "The central repository for The Architect's memory, branding, and operational logs."

## ⚠️ CRITICAL RULES (READ FIRST)
1. **NO FREE SIGNED-IN TIER** - Guests can trial builds/preview; saving/export/deploy requires signup + paid plan
2. **Claude Sonnet 4** (`claude-sonnet-4-20250514`) powers the builder
3. **Paywall Flow:** `/sign-up` → Clerk popup → Stripe checkout → `/welcome` → `/builder`
4. **Tier Colors:** Lite=Lime, Pro=Emerald, Agency=Amber
5. **Dev-Only Mock:** `/api/dev/mock-subscription` is allowed only when `ALLOW_DEV_MOCK_SUB=true` (never enable in production)

## 📂 Directory Structure

### 🧠 Core Memory
*   **[AI_MEMORY.md](./AI_MEMORY.md)**
    *   **Purpose:** The "Brain" - Agent personas, model roster, and execution protocols.
    *   **Usage:** Read this to understand agent roles and anti-paralysis rules.

*   **[FOUNDER_MEMORY.md](./FOUNDER_MEMORY.md)**
    *   **Purpose:** The "Soul" of the project. Contains the Founder's profile, mission directives, and long-term vision.
    *   **Usage:** Read this at the start of every session to align with the persona.

*   **[TECHNICAL_CODEX.md](./TECHNICAL_CODEX.md)**
    *   **Purpose:** The "Blueprint" - Tier structure, env vars, and critical file paths.
    *   **Usage:** Reference this for any tier/subscription logic changes.

### 🎨 Identity
*   **[BRANDING.md](./BRANDING.md)**
    *   **Purpose:** The visual and tonal guidelines. Colors, fonts, and the "Glitch" aesthetic rules.
    *   **Usage:** Reference this when generating UI components or writing copy.

### 📜 Logs & History
*   **[CHANGELOG.md](./CHANGELOG.md)**
    *   **Purpose:** A chronological record of all shipped features and fixes.
    *   **Usage:** Update this after every successful `git push`.

*   **[TRANSMISSION_LOGS.md](./TRANSMISSION_LOGS.md)**
    *   **Purpose:** A narrative history of the project's evolution (The "Lore").
    *   **Usage:** Add major milestones here in the "Transmission" format.

### 🛠 Technical
*   **[TECHNICAL_AUDIT.md](./TECHNICAL_AUDIT.md)**
    *   **Purpose:** Performance reports, security scans, and optimization to-do lists.
    *   **Usage:** Update when performing deep-dive code reviews.

*   **[UX_MAP.md](./UX_MAP.md)**
    *   **Purpose:** UX audit checklist and interaction map.
    *   **Usage:** Reference for user journey and monetization logic.

### 📢 Marketing
*   **[MARKETING_ASSETS.md](./MARKETING_ASSETS.md)**
    *   **Purpose:** A list of generated assets (images, videos, copy).
    *   **Usage:** Track what has been created to avoid duplicates.
    *   *See also:* `../marketing/` folder for specific campaign strategies.

---
*System Note: This folder is the source of truth. Do not hallucinate context. Read these files.*
