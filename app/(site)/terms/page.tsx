import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the Taxpicker crypto tax tool comparison platform.',
  robots: { index: false, follow: false },
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="space-y-8 text-slate-700 text-sm leading-7">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using Taxpicker ("the Platform"), you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
          <p>Taxpicker is an informational platform that aggregates, reviews, and compares crypto tax software tools. We provide editorial content, user reviews, pricing information, and feature comparisons. The Platform does not provide financial, tax, or legal advice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Informational Content Only</h2>
          <p>All content on Taxpicker is for informational purposes only. Nothing on this Platform constitutes professional financial, tax, investment, or legal advice. You should consult a qualified professional before making any decisions based on information found here.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Affiliate Relationships</h2>
          <p>Some links on this Platform are affiliate links. When you click these links and sign up for a service, we may earn a commission at no additional cost to you. Our editorial content is not influenced by affiliate relationships; however, you should be aware this relationship exists. See our full <a href="/affiliate-disclosure" className="text-blue-600 hover:underline">Affiliate Disclosure</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Accuracy of Information</h2>
          <p>While we strive to maintain accurate and up-to-date information, we do not guarantee the accuracy, completeness, or timeliness of any content on the Platform. Pricing and features of third-party tools may change without notice. Always verify information directly with the tool provider before making a purchase decision.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Intellectual Property</h2>
          <p>All original content on the Platform, including text, graphics, and code, is owned by Taxpicker or its content contributors. Tool logos and brand assets remain the property of their respective owners and are used for identification purposes only.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Prohibited Uses</h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Scrape or systematically download content without permission</li>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Interfere with the operation of the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Taxpicker shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Platform or any third-party tools you access through it.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contact</h2>
          <p>Questions about these Terms? Contact us at: <strong>legal@taxpicker.io</strong></p>
        </section>
      </div>
    </div>
  )
}
