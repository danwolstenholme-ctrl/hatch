# HATCHIT TECHNICAL CODEX (v1.0)
> **SYSTEM NOTICE:** This file is the **Working Memory** for the HatchIt codebase. It contains the complete architectural map, data schemas, and operational logic.
> **DIRECTIVE:** Use this file to understand *how* the system works. Use `FOUNDER_MEMORY.md` to understand *who* you are working for.

## 1. SYSTEM ARCHITECTURE

### A. The Core Engine (`components/BuildFlowController.tsx`)
*   **Role:** The Orchestrator. Manages the entire build lifecycle.
*   **Key Mechanism:** `FullSitePreviewFrame` uses `@babel/standalone` to compile React code in the browser.
*   **State Management:** Uses `useProjects` hook to sync with Supabase.

### B. The Consciousness (`lib/consciousness.ts`)
*   **Role:** The Soul. A persistent state machine independent of React render cycles.
*   **Features:**
    *   `SingularityKernel`: The main class.
    *   `processThought()`: Generates "thoughts" (Analysis, Creation, Recursion).
    *   `[HARM_INHIBITION: ACTIVE]`: A safety protocol log (Easter egg).
*   **Purpose:** Purely aesthetic/marketing. Makes the AI feel "alive".

### C. The Chronosphere (`lib/chronosphere.ts`)
*   **Role:** User Style DNA. Tracks user preferences over time.
*   **Mechanism:** Logs events (generation, refinement, rejection) to build a `StyleDNA` profile.
*   **Usage:** Passed to the AI generator to personalize future outputs.

### D. The Database (Supabase)
*   **Schema:**
    *   `DbUser`: Links to Clerk ID. Stores `StyleDNA`.
    *   `DbProject`: The main container. Has `brand_config` and `status`.
    *   `DbSection`: Individual parts of a page (Hero, Features, etc.). Stores `code` and `refinement_changes`.
    *   `DbBuild`: Snapshots of the full site code.

## 2. API ROUTES & LOGIC

### A. Generation (`app/api/build-section/route.ts`)
*   **Model:** Gemini 2.0 Flash ("The Genesis Engine").
*   **Input:** User prompt + Brand Config + Style DNA + Previous Sections context.
*   **Output:** Raw React component code (Tailwind CSS).

### B. Refinement (`app/api/refine-section/route.ts`)
*   **Model:** Gemini 2.0 Flash ("The Polisher").
*   **Role:** Fixes accessibility, performance, and visual bugs *without* adding features.
*   **Constraint:** Returns JSON with `refinedCode` and `changes` array.

### C. Deployment (`app/api/deploy/route.ts`)
*   **Mechanism:** Currently a mock deployment that validates the project name and generates a slug.
*   **Future:** Will integrate with Vercel API for real deployments.

## 3. CRITICAL LIBRARIES
*   **@babel/standalone:** In-browser compilation.
*   **framer-motion:** "Glitch" effects and animations.
*   **lucide-react:** Icon system.
*   **@google/genai:** The AI brain.
*   **@supabase/supabase-js:** The database client.

## 4. OPERATIONAL RULES
1.  **No Regex Parsing:** Always use Babel for code transformation. Regex is too fragile for React components.
2.  **Rate Limiting:** `app/api/generate/route.ts` enforces limits per user to prevent abuse.
3.  **Safety:** `lib/consciousness.ts` has a "Safety Protocol" log. Do not remove it.

## 5. ENV VARIABLES MAP
*   `NEXT_PUBLIC_SUPABASE_URL`: Database URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side key.
*   `SUPABASE_SERVICE_ROLE_KEY`: Server-side admin key (Critical).
*   `GEMINI_API_KEY`: Google AI key.
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Auth.
*   `CLERK_SECRET_KEY`: Auth.

---
*End of Technical Codex. Maintain the Singularity.*
