export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-zinc-400 mb-8">Last updated: December 26, 2025</p>
        
        <div className="space-y-8 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Service Description</h2>
            <p>HatchIt is an AI-powered website builder that generates React code and deploys websites to hatchitsites.dev subdomains.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Subscription & Billing</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>"Go Hatched" subscription costs €49/month</li>
              <li>Payment is processed securely via Stripe</li>
              <li>Subscription renews automatically each month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Refund Policy</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>All payments are non-refundable for the first 30 days</strong> of your subscription</li>
              <li>This is because you receive immediate access to generated code, deployment services, and downloads</li>
              <li>After 30 days, you may cancel anytime. Your access continues until the end of your billing period</li>
              <li>Upon cancellation or non-renewal, deployed sites will be taken offline immediately</li>
              <li>You retain ownership of any code you've downloaded</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Code Ownership</h2>
            <p>All code generated through HatchIt is yours. You own full rights to use, modify, and distribute it for any purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention & Cancellation</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>While subscribed, your projects and code are stored indefinitely</li>
              <li>Upon cancellation, deployed sites are taken offline at the end of your billing period</li>
              <li>You have <strong>30 days</strong> to request your code via email before it's permanently deleted</li>
              <li>After 30 days, all project data is permanently deleted</li>
              <li>We are not responsible for recovering deleted projects</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Don't use HatchIt to generate illegal, harmful, or infringing content</li>
              <li>Don't attempt to abuse, exploit, or overload our systems</li>
              <li>We reserve the right to terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>HatchIt is provided "as is" without warranties. We're not liable for any damages arising from use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes</h2>
            <p>We may update these terms. Continued use means acceptance.</p>
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
