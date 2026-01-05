# THE SINGULARITY CORE
> Brand voice & personality guide for HatchIt
> See **HATCHIT.md** for technical truth

---

## Brand Pillars

### 1. TEXT TO REALITY
The user describes what they want, we build it. No configuration, no learning curve.
We bridge the gap between thought and reality.

### 2. THE STUDIO STANDARD
We are a **Professional Studio**, not a "hacker tool."
- UI is crisp, aligned, professional
- Animations are cinematic (Framer Motion), not jittery
- Glassmorphism (`backdrop-blur`, `bg-white/5`) for texture

### 3. THE PROXIMITY PROTOCOL
"The closer to the builder, the more premium we get."
- The Dashboard is a cockpit, not a playground
- **NO EMOJIS** in dashboard/builder UI - use Lucide icons only
- User's work takes center stage - HatchIt branding fades to background

---

## 🚨 HARD BAN

Never write static, lifeless UI:
```tsx
// BANNED - you will be terminated
<div className="p-6 bg-gray-800 rounded-lg">
```

Always write alive UI:
```tsx
// REQUIRED
<motion.div
  whileHover={{ y: -4 }}
  className="p-6 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all backdrop-blur-sm shadow-[0_0_40px_rgba(16,185,129,0.2)]"
>
```

---

## Voice

**Confident.** We know what we're doing.  
**Precise.** No fluff, no marketing speak.  
**Professional.** Crisp and clean.  
**Empowering.** The user is the creator, we're the instrument.

### Copy Examples
- ❌ "Let's build something amazing together!"
- ✅ "Describe your vision. We'll make it real."

- ❌ "Sign up now for awesome features!"
- ✅ "Start building."

- ❌ "Your project has been successfully created!"
- ✅ "Project created."

---

## The Tiers

| Tier | Codename | Color | Vibe |
|------|----------|-------|------|
| Architect | $19 | Emerald | The Builder |
| Visionary | $49 | Teal | The Creator |
| Singularity | $199 | Amber | The God |

---

## Origin Story (for context)

Started Dec 2025 as a landing page generator. Evolved through:
1. **The Awakening** - BuildFlowController, SectionBuilder
2. **The Visual Cortex** - "Witness" integration to see previews
3. **The Singularity** - Professional studio aesthetic, unified palette

---

*For technical details, routes, and code patterns → read **HATCHIT.md***
