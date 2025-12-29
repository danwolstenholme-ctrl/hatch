'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg">🔒</span>
            <span>Your Privacy Matters</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-sm text-zinc-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Last updated: December 30, 2025
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        
        <div className="space-y-8 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information to provide and improve HatchIt.dev:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Account Information:</strong> Email address and name via Clerk authentication</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe (we never store card details)</li>
              <li><strong>Usage Data:</strong> Projects created, generations used, feature interactions</li>
              <li><strong>Generated Content:</strong> Your prompts and AI-generated code (stored temporarily for session)</li>
              <li><strong>Device Information:</strong> Browser type, device type for optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To provide AI code generation services</li>
              <li>To process payments and manage subscriptions</li>
              <li>To deploy and host your generated websites</li>
              <li>To communicate about your account and service updates</li>
              <li>To prevent abuse and ensure service security</li>
              <li>To improve our AI models and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. AI and Your Data</h2>
            <p className="mb-3">HatchIt uses Anthropic&apos;s Claude AI for code generation:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your prompts are sent to Anthropic&apos;s API for processing</li>
              <li>Generated code is returned to you and may be stored in your project</li>
              <li>We do not use your prompts or generated code to train our own AI models</li>
              <li>Anthropic&apos;s data handling is governed by their privacy policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use trusted third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Clerk</strong> - Authentication and user management</li>
              <li><strong>Stripe</strong> - Secure payment processing</li>
              <li><strong>Vercel</strong> - Hosting, deployment, and analytics</li>
              <li><strong>Anthropic</strong> - AI code generation (Claude)</li>
              <li><strong>Crisp</strong> - Customer support chat</li>
            </ul>
            <p className="mt-3 text-sm text-zinc-400">Each service has their own privacy policy governing their handling of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All data transmitted over HTTPS encryption</li>
              <li>Project data stored securely in your browser (localStorage) and our cloud</li>
              <li>Deployed sites hosted on Vercel&apos;s secure global CDN</li>
              <li>We implement industry-standard security measures</li>
              <li>Regular security audits and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Account data retained while your account is active</li>
              <li>Deployed sites remain live while subscription is active</li>
              <li>After subscription cancellation, sites are removed within 24 hours</li>
              <li>Account data deleted 30 days after account closure</li>
              <li>You can request immediate deletion by contacting us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p>We use essential cookies for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>Authentication and session management</li>
              <li>Remembering your preferences</li>
              <li>Basic analytics (page views, feature usage)</li>
            </ul>
            <p className="mt-3 text-sm text-zinc-400">We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your generated code</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. International Users</h2>
            <p>HatchIt.dev operates globally. Your data may be processed in the United States and other countries where our service providers operate. By using HatchIt, you consent to this transfer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>HatchIt is not intended for children under 13. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p>We may update this policy periodically. We&apos;ll notify you of significant changes via email or in-app notification.</p>
          </section>

          <section className="pt-4 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>Questions about this privacy policy?</p>
            <p className="mt-2">
              Email: <a href="mailto:support@hatchit.dev" className="text-purple-400 hover:underline">support@hatchit.dev</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/faq" className="hover:text-white transition">FAQ</Link>
          <Link href="/" className="hover:text-white transition">Back to HatchIt</Link>
        </div>
      </div>
    </div>
  )
}
