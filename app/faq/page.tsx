import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ - HatchIt.dev | AI Website Builder Questions Answered',
  description: 'Frequently asked questions about HatchIt.dev, the AI-powered website builder. Learn about pricing, features, code ownership, deployment, and more.',
  openGraph: {
    title: 'FAQ - HatchIt.dev | AI Website Builder',
    description: 'Get answers to common questions about HatchIt.dev - the AI website builder that generates real React code.',
  },
}

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
        a: 'HatchIt.dev uses advanced AI to understand your description and generate clean React + Tailwind CSS code. The process is simple: 1) Describe your site (e.g., "A landing page for my coffee shop"), 2) Preview your site instantly, 3) Iterate by asking for changes ("Make the header sticky"), 4) Deploy to a live URL when ready.',
      },
      {
        q: 'Do I need coding experience to use HatchIt.dev?',
        a: 'No coding experience required! HatchIt.dev is designed for everyone - entrepreneurs, designers, marketers, and developers alike. Just describe what you want in plain English, and HatchIt.dev handles the code. However, if you do know code, you can view and edit the generated React code directly.',
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
        a: 'Yes! HatchIt.dev generates real React + Tailwind CSS code that follows best practices. The code includes Framer Motion animations, Lucide icons, and responsive design. You can download the full project and run it locally or deploy it anywhere.',
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
        a: 'HatchIt.dev is free to use for building and previewing. The "Go Hatched" subscription costs $49/month per live site and unlocks deployment, full code access, downloads, version history, and unlimited generations. V1 Early Bird users get 50% off their first month ($24).',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes! Free users get 10 AI generations per day, unlimited previewing, and full access to the builder. The free plan is perfect for experimenting and building your site. You only need to subscribe when you\'re ready to deploy or need unlimited generations.',
      },
      {
        q: 'What does "per live site" mean?',
        a: 'Each $49/month subscription covers one deployed website. If you want to deploy multiple sites, each one requires its own subscription. This keeps pricing simple and predictable.',
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
        a: 'Yes! Hosting is included in your $49/month subscription. Your site is hosted on fast, reliable infrastructure with SSL certificates included. No additional hosting fees.',
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

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <nav className="px-8 py-6 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
          </Link>
          <Link href="/builder" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-sm transition-all">
            Open Builder
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about HatchIt.dev, the AI website builder that generates real code.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {faqs.map((section) => (
            <a
              key={section.category}
              href={`#${section.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-300 hover:text-white transition-colors"
            >
              {section.category}
            </a>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-16">
          {faqs.map((section) => (
            <section key={section.category} id={section.category.toLowerCase().replace(/\s+/g, '-')}>
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-800/50 transition-colors list-none">
                      <h3 className="font-medium text-white pr-4">{faq.q}</h3>
                      <svg
                        className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-zinc-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Our team is here to help. Reach out through the chat widget or start building and use the in-app assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all"
            >
              Start Building Free
            </Link>
            <a
              href="mailto:support@hatchit.dev"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>

        {/* Schema.org FAQ markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.flatMap((section) =>
                section.questions.map((faq) => ({
                  '@type': 'Question',
                  name: faq.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.a,
                  },
                }))
              ),
            }),
          }}
        />
      </div>
    </div>
  )
}
