'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is HatchIt.dev?',
        a: 'HatchIt.dev is an AI-powered website builder that generates real, production-ready React code. Simply describe what you want to build in plain English, and HatchIt.dev creates a fully functional website that you can preview, edit, and deploy instantly.',
      },
      {
        q: 'How does HatchIt.dev work?',
        a: 'HatchIt.dev uses a three-model AI pipeline. 1) Pick a template (Website, Portfolio, SaaS), 2) Set your branding (colors, fonts, business name), 3) Build section by section with AI help. Claude Sonnet generates your code, Claude Opus polishes it, and Gemini audits the result. Stuck on prompts? Hatch 🥚 writes them for you!',
      },
      {
        q: 'Do I need coding experience to use HatchIt.dev?',
        a: 'No coding experience required! HatchIt.dev is designed for everyone. Just describe what you want, or let Hatch 🥚 write your prompts for you. However, if you do know code, you can view and edit the generated React code directly.',
      },
      {
        q: 'Who is Hatch?',
        a: 'Hatch is your friendly egg companion! 🥚 She\'s an AI helper powered by Claude Haiku who writes prompts for you when you\'re stuck. Click the floating egg button while building, tell her about your section, and she\'ll craft the perfect prompt. She\'s cute, helpful, and genuinely excited about your business.',
      },
      {
        q: 'What can I build with HatchIt.dev?',
        a: 'HatchIt.dev is perfect for landing pages, business websites, portfolios, coming soon pages, pricing pages, contact forms, multi-page sites, and marketing sites. It\'s great for anything that\'s primarily informational or presentational.',
      },
      {
        q: 'What is HatchIt.dev NOT designed for?',
        a: 'HatchIt.dev is not designed for complex web applications with databases, user authentication systems, e-commerce stores with real payment processing, or apps requiring backend logic. It\'s focused on generating beautiful, functional frontend websites.',
      },
    ],
  },
  {
    category: 'Features & Capabilities',
    questions: [
      {
        q: 'Is the generated code real production code?',
        a: 'Yes! HatchIt.dev uses a three-model AI pipeline. Claude Sonnet 4 generates fast, clean React + Tailwind CSS code. Claude Opus 4 then refines it for accessibility, semantic HTML, and best practices. Finally, Gemini 2.5 Pro audits the result. You get production-ready code that follows best practices.',
      },
      {
        q: 'Can I edit the generated code?',
        a: 'Absolutely. Paid users get full access to view, edit, and download the source code. You can make changes directly in the Code tab, or describe changes in the chat and let the AI update it for you.',
      },
      {
        q: 'Does HatchIt.dev support multi-page websites?',
        a: 'Yes! You can create multi-page sites with proper routing. Add pages like /about, /contact, /services, etc. Each page can be generated and edited independently, and navigation between pages works automatically.',
      },
      {
        q: 'Can I use my own images and logos?',
        a: 'Yes. Click the Assets button to upload your logos, images, and icons. Then tell the AI to use them: "Use my uploaded logo in the header." Images are embedded directly in your site.',
      },
      {
        q: 'Do contact forms actually work?',
        a: 'HatchIt.dev generates forms that work with Formspree.io, a free form handling service. Sign up at formspree.io to get your form ID, then replace the placeholder ID in your generated code. Submissions will be sent to your email.',
      },
      {
        q: 'What animations are supported?',
        a: 'HatchIt.dev uses Framer Motion for animations. You can request hover effects, scroll animations, page transitions, and more. Just describe what you want: "Add a fade-in animation to the hero section" or "Make the cards scale up on hover."',
      },
      {
        q: 'Are the sites mobile-responsive?',
        a: 'Yes, all generated sites are fully responsive by default. HatchIt.dev uses Tailwind CSS breakpoints to ensure your site looks great on phones, tablets, and desktops. You can preview different device sizes in the builder.',
      },
    ],
  },
  {
    category: 'Pricing & Billing',
    questions: [
      {
        q: 'How much does HatchIt.dev cost?',
        a: 'HatchIt.dev is free to use for building and previewing. "Go Hatched" costs $24 to launch (early bird pricing), then $19/month to keep your site live. This includes deployment, full code access, downloads, version history, and unlimited edits.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes! Free users get 10 AI generations per day, unlimited previewing, and full access to the builder. The free plan is perfect for experimenting and building your site. You only need to subscribe when you\'re ready to deploy or need unlimited generations.',
      },
      {
        q: 'What does "per live site" mean?',
        a: 'Each subscription covers one deployed website. If you want to deploy multiple sites, each one requires its own subscription ($24 to launch, then $19/month). This keeps pricing simple and predictable.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription anytime from your account settings. Your site will remain live until the end of your current billing period. After that, it will be taken offline.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Payments are non-refundable for the first 30 days because you receive immediate access to code generation, deployment, and downloads. After 30 days, you can cancel anytime and your access continues until the end of your billing period.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards through Stripe, including Visa, Mastercard, American Express, and more. Payments are processed securely and we never store your card details.',
      },
    ],
  },
  {
    category: 'Deployment & Hosting',
    questions: [
      {
        q: 'How do I deploy my site?',
        a: 'Click the "Ship it" button, choose a name for your site, and click deploy. Your site will be live at yourname.hatchitsites.dev within seconds. It\'s that simple!',
      },
      {
        q: 'What URL will my site have?',
        a: 'Deployed sites are hosted at yourname.hatchitsites.dev. Choose any available name during deployment. Custom domains will be supported soon for connecting your own domain.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Custom domain support is coming soon! For now, sites are hosted on hatchitsites.dev subdomains. You\'ll be able to connect your own domain like www.yourbusiness.com.',
      },
      {
        q: 'Is hosting included in the subscription?',
        a: 'Yes! Hosting is included in your $19/month subscription. Your site is hosted on fast, reliable infrastructure with SSL certificates included. No additional hosting fees.',
      },
      {
        q: 'How fast are HatchIt.dev sites?',
        a: 'Very fast! Sites are deployed to Vercel\'s edge network, which means they load quickly from anywhere in the world. The React code is optimized and includes only what\'s needed.',
      },
      {
        q: 'Is SSL/HTTPS included?',
        a: 'Yes, all deployed sites automatically get SSL certificates and are served over HTTPS. Security is included at no extra cost.',
      },
    ],
  },
  {
    category: 'Code & Ownership',
    questions: [
      {
        q: 'Do I own the code HatchIt.dev generates?',
        a: 'Yes, 100%. All code generated through HatchIt.dev belongs to you. You have full rights to use, modify, distribute, and commercialize it however you want. No attribution required.',
      },
      {
        q: 'Can I download my project?',
        a: 'Yes, paid users can download their complete project as a zip file. The download includes all React components, configuration files, and everything needed to run the project locally or deploy elsewhere.',
      },
      {
        q: 'What\'s included in the download?',
        a: 'The download includes: React components for all pages, Tailwind CSS configuration, Next.js setup, package.json with dependencies, TypeScript configuration, and a README with setup instructions.',
      },
      {
        q: 'Can I host my site elsewhere?',
        a: 'Absolutely. Download your project and deploy it to any hosting provider that supports Next.js - Vercel, Netlify, AWS, or your own server. The code is standard React/Next.js.',
      },
      {
        q: 'Where is my code stored before I deploy?',
        a: 'Your projects and version history are stored locally in your browser (localStorage). This means your work is private and instant, but it also means you should deploy to save your work permanently.',
      },
      {
        q: 'How does version history work?',
        a: 'Every time you generate or update your site, a new version is saved automatically in your browser. You can undo changes with the "Undo last change" button. When you deploy, your latest code is pushed to Vercel\'s hosting infrastructure.',
      },
      {
        q: 'What happens to my code if I cancel?',
        a: 'Your deployed site goes offline at the end of your billing period. You have 30 days to download your code or request it via email. After 30 days, project data is permanently deleted. Any code you\'ve already downloaded is yours forever.',
      },
    ],
  },
  {
    category: 'Tips & Best Practices',
    questions: [
      {
        q: 'What makes a good prompt?',
        a: 'Keep it simple and specific. Good: "A landing page for a coffee shop with hero section, menu, and contact form." Avoid long, detailed prompts - it\'s better to build iteratively.',
      },
      {
        q: 'How should I approach building a site?',
        a: 'Start simple, then iterate. First prompt: "Landing page for a fitness studio." Then refine: "Make the header sticky." Then add: "Add a pricing section with 3 tiers." This approach gives better results than one massive prompt.',
      },
      {
        q: 'What if the preview shows an error?',
        a: 'Try clicking "Quick Fix" to automatically simplify the code. You can also view the Code tab to see what was generated, or use the Chat assistant for help troubleshooting.',
      },
      {
        q: 'How do I get help while building?',
        a: 'Switch to the Chat tab (💬) to talk to the HatchIt.dev assistant. It can help you plan your site, suggest prompts, troubleshoot issues, and guide you through the building process.',
      },
    ],
  },
  {
    category: 'Support & Contact',
    questions: [
      {
        q: 'How do I get help?',
        a: 'Use the chat widget in the bottom right corner for live support. You can also use the in-app Chat assistant for building help, or email us at support@hatchit.dev.',
      },
      {
        q: 'I found a bug. How do I report it?',
        a: 'Please report bugs through the chat widget or email support@hatchit.dev. Include what you were trying to do, what happened, and any error messages you saw. Screenshots help!',
      },
      {
        q: 'Can I request new features?',
        a: 'Yes! We love feedback. Use the chat widget or email us with your feature ideas. We\'re actively developing HatchIt.dev and user feedback shapes our roadmap.',
      },
    ],
  },
]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg">💬</span>
            <span>Questions & Answers</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Frequently Asked
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about HatchIt
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="relative px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {faqs.map((section) => (
              <button
                key={section.category}
                onClick={() => {
                  const element = document.getElementById(section.category.toLowerCase().replace(/\s+/g, '-'))
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-300 hover:text-white transition-colors"
              >
                {section.category}
              </button>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-16">
            {faqs.map((section) => (
              <section key={section.category} id={section.category.toLowerCase().replace(/\s+/g, '-')}>
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, idx) => {
                    const questionId = `${section.category}-${idx}`
                    const isOpen = openIndex === questionId
                    return (
                      <motion.div
                        key={idx}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : questionId)}
                          className="w-full text-left p-6 flex items-start justify-between gap-4 group"
                        >
                          <span className="font-semibold text-white group-hover:text-purple-400 transition-colors flex-1">{faq.q}</span>
                          <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            className="text-zinc-500 text-xl flex-shrink-0"
                          >
                            ↓
                          </motion.span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">{faq.a}</div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-16 p-8 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-amber-900/30 border border-purple-500/20 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-zinc-400 mb-6">Reach out on X or email us directly</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://x.com/HatchItD"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
              >
                @HatchItD on X
              </a>
              <a
                href="mailto:support@hatchit.dev"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
              >
                support@hatchit.dev
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
