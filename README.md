# 🐣 HatchIt.dev

> **Figma Make, but the code doesn't suck.**

The AI website builder that writes code you'd actually be proud of. Describe what you want → watch it build section by section → ship to production.

**[hatchit.dev](https://hatchit.dev)**

## What Makes It Different

- **Recursive Neural Pipeline** - Powered entirely by Google's Gemini models
- **Section-by-Section Building** - Watch your site come together piece by piece
- **Real Code Output** - Production-ready React + Tailwind, not drag-and-drop blocks
- **Live Preview** - See changes in real-time as you iterate
- **One-Click Deploy** - Ship to `yoursite.hatchit.dev` instantly
- **Code Export** - Download the full Next.js project, it's yours

## The Pipeline

```
Your Description → Gemini 2.0 (Build) → Gemini Vision (Audit) → Gemini Multimodal (Speak) → Your Site
```

Each section goes through this pipeline. You get clean, accessible, responsive code.

## Tech Stack

- **Framework**: Next.js 16, React 19, Turbopack
- **Styling**: Tailwind CSS, Framer Motion
- **AI**: Google Gemini 2.0 Flash, Gemini 1.5 Pro Vision
- **Auth**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
```

Requires `.env.local` with:
- `GEMINI_API_KEY` - Gemini API  
- `NEXT_PUBLIC_CLERK_*` - Clerk auth
- `STRIPE_*` - Stripe payments
- `NEXT_PUBLIC_SUPABASE_*` - Supabase
- `VERCEL_TOKEN` - Deploy API

## Status

🚀 **Live** at [hatchit.dev](https://hatchit.dev)

---

Built by [@danwolstenholme-ctrl](https://github.com/danwolstenholme-ctrl)
