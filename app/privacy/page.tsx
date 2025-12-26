export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-zinc-400 mb-8">Last updated: December 26, 2024</p>
        
        <div className="space-y-8 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Account info: email address, name (via Clerk authentication)</li>
              <li>Payment info: processed by Stripe (we don't store card details)</li>
              <li>Usage data: projects created, generations used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve the service</li>
              <li>To process payments</li>
              <li>To communicate about your account</li>
              <li>To prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Clerk</strong> - Authentication</li>
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>Vercel</strong> - Hosting and deployment</li>
              <li><strong>Anthropic</strong> - AI code generation</li>
            </ul>
            <p className="mt-2">Each has their own privacy policy governing their handling of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Account data retained while your account is active</li>
              <li>After cancellation, data deleted after 30 days</li>
              <li>You can request immediate deletion by contacting us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>We use essential cookies for authentication and functionality only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Access, correct, or delete your personal data</li>
              <li>Request a copy of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Security</h2>
            <p>We use industry-standard security measures. All data transmitted over HTTPS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes</h2>
            <p>We may update this policy. Check back periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:support@hatchit.dev" className="text-blue-400 hover:underline">support@hatchit.dev</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
