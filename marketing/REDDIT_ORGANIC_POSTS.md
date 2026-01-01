# REDDIT ORGANIC POSTS (READY TO COPY)

> **INSTRUCTIONS:**
> 1. Post these **manually** from your personal account (or the HatchIt account if it has karma).
> 2. Do NOT post them at the exact same time. Wait 1-2 hours between them.
> 3. **Reply to comments** immediately.

---

## POST 1: Target `r/SideProject`
**Theme:** The "Underdog Story" (Marketing Focus)
**Best Time:** Now (Morning/Mid-day US time)

**TITLE:**
I got banned from X Ads, so I'm launching my AI builder here. It writes actual React code (No lock-in).

**BODY:**
Hey everyone,

I spent the last 6 months building **HatchIt** – an AI interface that generates full React/Tailwind components from text prompts.

I tried to launch it on X (Twitter) yesterday, but my ad account got nuked immediately (apparently "AI generation" is a sensitive category now? Who knows).

So, I'm pivoting to Reddit.

**The Problem:**
I hate "No-Code" tools. They trap you. You build a site, and then you can't export the code, or if you can, it's unreadable spaghetti HTML.

**The Solution:**
HatchIt is different.
1.  **It writes real code:** Next.js 16, Tailwind CSS, Lucide Icons.
2.  **It runs in the browser:** I'm using a custom implementation of `@babel/standalone` to compile the AI's output in real-time inside your browser.
3.  **You own it:** There is an "Export" button. You get the `.tsx` file. You can `npm install` it and never talk to me again.

**The Stack:**
*   Next.js 16 (App Router)
*   Supabase (Auth/DB)
*   Gemini 2.0 Flash (The brains)
*   Sandpack/Babel (The preview engine)

I'd love for you guys to break it. The "Builder" is free to try (you get free generations daily).

**Link:** [https://hatchit.dev](https://hatchit.dev/?utm_source=reddit_organic&utm_medium=social&utm_campaign=sideproject_launch)

Let me know if the code quality holds up to your standards.

---

## POST 2: Target `r/nextjs`
**Theme:** The "Technical Showcase" (Dev Focus)
**Best Time:** 2 hours after Post 1

**TITLE:**
I built a "Prompt-to-UI" engine that outputs clean Next.js 16 + Tailwind (AST-validated)

**BODY:**
Hi r/nextjs,

I wanted to share a project I've been working on called **HatchIt**. It's a "text-to-app" interface, but unlike V0 or others, I focused heavily on **code quality** and **ownership**.

**How it works technically:**
1.  **Prompt Engineering:** It uses a multi-shot prompt system with Gemini 2.0 to enforce strict React + Tailwind syntax.
2.  **AST Validation:** Before the code is rendered, I run it through a parser to catch common LLM hallucinations (like importing non-existent icons or unclosed tags).
3.  **In-Browser Compilation:** It uses `@babel/standalone` to transform the JSX into executable JavaScript on the client side, rendering it into a sandboxed preview.

**Why?**
I wanted a tool that could scaffold a landing page or a dashboard component in 30 seconds, but give me code I could actually paste into my VS Code project without spending an hour refactoring it.

**Features:**
*   Full Tailwind support (arbitrary values, dark mode).
*   Lucide React icons built-in.
*   Responsive by default.
*   **Export:** One-click download of the `.tsx` file.

It's currently in v1. I'm looking for feedback on the generated code structure. Does it follow the patterns you actually use?

**Try it here:** [https://hatchit.dev/builder](https://hatchit.dev/builder?utm_source=reddit_organic&utm_medium=social&utm_campaign=nextjs_launch)

(P.S. It's free to try, no credit card required).
