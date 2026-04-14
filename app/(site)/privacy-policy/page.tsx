import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Taxpicker privacy policy covering data collection, cookies, Supabase storage, affiliate tracking, and GDPR user rights.',
  robots: { index: false, follow: false },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
          <p>Taxpicker ("we," "us," or "our") operates the Taxpicker website. This Privacy Policy explains how we collect, use, and protect information about you when you use our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
          <h3 className="text-base font-semibold text-slate-800 mb-2">2.1 Automatically Collected Data</h3>
          <p>When you visit our site, we may collect:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
            <li>IP address and approximate geographic location</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website URLs</li>
          </ul>
          <h3 className="text-base font-semibold text-slate-800 mb-2 mt-4">2.2 Affiliate Click Data</h3>
          <p>With your cookie consent, we log affiliate link clicks including: tool clicked, timestamp, IP address, user agent, and referrer. This data is stored securely in Supabase and used only for internal analytics.</p>
          <h3 className="text-base font-semibold text-slate-800 mb-2 mt-4">2.3 Cookie Consent Records</h3>
          <p>We store your consent preference (accept/reject) in your browser's localStorage. We also log consent events in our database to maintain compliance records.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>To measure site performance and understand user behavior</li>
            <li>To track affiliate link performance (only with consent)</li>
            <li>To improve our tool listings and comparison features</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Storage</h2>
          <p>Your data is stored in Supabase, a secure cloud database platform with encryption at rest and in transit. Supabase infrastructure complies with SOC 2 Type II. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Cookies</h2>
          <p>We use cookies and localStorage for:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
            <li><strong>Functional:</strong> Storing your cookie consent preference</li>
            <li><strong>Analytics:</strong> Tracking page views and affiliate clicks (consent required)</li>
          </ul>
          <p className="mt-2">For full details, see our <a href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Your GDPR Rights</h2>
          <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
            <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw cookie consent at any time via Cookie Settings in the footer</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention</h2>
          <p>Affiliate click logs are retained for 24 months. Cookie consent records are retained for 36 months for compliance purposes. You may request deletion at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Third-Party Links</h2>
          <p>Our site contains links to third-party tools. We are not responsible for the privacy practices of those sites and recommend you review their privacy policies independently.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact</h2>
          <p>For privacy-related requests or questions, contact us at: <strong>privacy@taxpicker.io</strong></p>
        </section>
      </div>
    </div>
  )
}
