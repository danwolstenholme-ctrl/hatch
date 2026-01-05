# VISION BACKLOG
> Ideas that need depth. Don't lose these.
> Last Updated: January 5, 2026

---

## 🏗️ THE "PROJECTS" EVOLUTION

**Problem:** "Projects" is too small a name. Users don't just have projects - they have:
- Sites that need forms
- Sites that need analytics
- Sites that need hosting
- Sites that need email
- Sites that need backend

**Rename candidates:**
- Studio
- Workspace
- Control Center
- Command
- The Lab

---

## 🔌 PLUGIN ARCHITECTURE

Users build a landing page. Great. Now they need real shit:

| Need | Solution | Complexity |
|------|----------|------------|
| Contact forms | Formspree integration | Low |
| Analytics | Google Analytics snippet | Low |
| Email capture | ConvertKit/Mailchimp embed | Low |
| Hosting | Vercel deploy (exists) | Done |
| Custom domain | DNS guidance + Vercel | Medium |
| Backend/DB | Supabase guidance | High |
| Auth | Clerk snippet export | Medium |
| Payments | Stripe embed guidance | High |

**Two approaches:**

### Option A: Plugin Export System
- User builds site
- Opens "Add-ons" panel
- Selects "Contact Form" → Formspree
- We inject the code + give them setup instructions
- They paste API keys

### Option B: Dedicated Backend AI
- Separate AI trained on:
  - Formspree setup
  - Vercel deployment
  - DNS configuration
  - Supabase basics
  - Stripe integration
- Lives in the "Studio" area
- User asks "How do I add a contact form?" → Gets guided setup

**Concern:** Hosting = agreeing to maintain servers. Do we want that?

---

## 🧬 THE REPLICATOR - WORDPRESS KILLER CAMPAIGN

**Existing feature:** Website DNA Replicator (extracts design from URL)

**Campaign angle:**
> "Drag your site off WordPress. Move to AI."
> "Your WordPress site, rebuilt in React. In minutes."

**Flow:**
1. User pastes their WordPress URL
2. Replicator extracts: colors, fonts, layout structure
3. We generate a React equivalent
4. User sees it in demo (free)
5. "Want to actually migrate? Sign up."

**Target audience:**
- Frustrated WordPress users (plugin hell, slow, expensive hosting)
- Agencies migrating clients off WP
- Developers who hate maintaining WP

**Ad copy ideas:**
- "WordPress charges you $300/year to be slow."
- "Your site. Rebuilt in React. In 5 minutes."
- "The WordPress Exit."

---

## 🤖 AI STACK EXPANSION

**Current AIs:**
| AI | Role | Model |
|----|------|-------|
| Genesis | Builds sections | Claude Sonnet 4.5 |
| Architect | Refines/polishes | Claude Sonnet 4.5 |
| Witness | Sees preview, gives feedback | Claude Haiku 4.5 |
| Replicator | Extracts site DNA | Gemini 2.0 Flash |
| Chronosphere | Version history | Gemini 2.0 Flash |

**Proposed additions:**
| AI | Role | Notes |
|----|------|-------|
| **The Engineer** | Backend guidance | Forms, hosting, DNS, DB |
| **The Migrator** | WordPress extraction | Specialized Replicator |
| **The Optimizer** | Performance/SEO | Lighthouse integration? |

---

## 📍 IMMEDIATE PRIORITIES (Dan's call)

1. [ ] Reddit ads V2/V3 - test the fixed funnel
2. [ ] Rename "Projects" section
3. [ ] Basic Formspree integration guide
4. [ ] Replicator as WordPress killer campaign
5. [ ] Backend guidance AI (The Engineer)

---

## ❓ OPEN QUESTIONS

1. **Hosting responsibility:** If we deploy to Vercel for users, are we maintaining their servers? What's our liability?

2. **Email:** How do users get email@theirdomain.com? We don't do email. Guide them to Google Workspace / Zoho?

3. **Forms:** Formspree free tier = 50 submissions/month. Is that enough for SMB landing pages?

4. **WordPress migration:** Legal concerns with scraping competitor sites? Or is it fair game if it's their own site?

5. **Pricing for add-ons:** Do plugins come with tiers, or are they all included at Visionary+?

---

*This file is for ideas with depth. When ready to execute, move to PROJECT_STATUS or create a task.*
