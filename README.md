# 🐣 HatchIt

> **V1.0 - Launched December 2025**

AI-powered website builder that outputs real code. Describe what you want, watch it build, ship to production.

## Features

- **AI Generation** - Describe your site in plain English, get production-ready React code
- **Live Preview** - See your changes in real-time as you iterate
- **Multi-page Sites** - Build complete multi-page websites with routing
- **Code Export** - Download your full project or view/edit the code directly
- **One-Click Deploy** - Ship to production with a custom subdomain
- **Custom Domains** - Connect your own domain (coming soon)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Create a `.env.local` file with:

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/builder
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/builder

# AI Generation (Anthropic)
ANTHROPIC_API_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
STRIPE_EARLYBIRD_COUPON_ID=  # Optional: V1 Early Bird 50% off coupon

# Deployment (Vercel)
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# App URL
NEXT_PUBLIC_APP_URL=https://hatchit.app

# Live Chat (Crisp) - Optional
NEXT_PUBLIC_CRISP_WEBSITE_ID=
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Auth**: Clerk
- **Payments**: Stripe
- **AI**: Anthropic Claude
- **Deployment**: Vercel

## License

Private - All rights reserved
