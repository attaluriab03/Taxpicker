import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Full explanation of Taxpicker\'s affiliate relationships and how commissions may influence our content.',
  robots: { index: false, follow: false },
}

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10">
        <p className="text-sm text-amber-800 font-medium">
          In the interest of full transparency: Taxpicker participates in affiliate programs with some of the tools we compare. We earn a commission when users sign up through our links. This does not affect the price you pay.
        </p>
      </div>

      <div className="space-y-8 text-slate-700 text-sm leading-7">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">What Are Affiliate Links?</h2>
          <p>When you click a "Get Started," "Visit Website," or similar call-to-action button on Taxpicker, you may be directed to the tool's website via a tracked referral link. If you sign up or purchase a plan, we may receive a commission from the tool provider at no additional cost to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Commitment to Objectivity</h2>
          <p>We are committed to providing honest, unbiased reviews. Our editorial rankings and feature comparisons are based on objective criteria including: feature set, pricing value, user reviews, exchange support, and country availability.</p>
          <p className="mt-2">Affiliate relationships may influence the order in which some tools are presented, but we clearly label recommended tools and always provide full feature comparisons so you can make your own informed decision.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">How Ranking Works</h2>
          <p>Tools are ranked according to the following factors in order of weight:</p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Is Recommended status (editorially assigned by our team)</li>
            <li>Is Featured status</li>
            <li>User rating (average review score)</li>
            <li>Date added to the platform</li>
          </ol>
          <p className="mt-2">Affiliate commission rates do not directly determine ranking. However, we may choose to highlight tools with which we have stronger partnerships in the "Recommended" category if those tools also meet our quality criteria.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Your Trust Matters</h2>
          <p>We believe in being upfront. If you ever have questions about our relationship with any specific tool, or believe our reviews are inaccurate, please contact us. We take editorial integrity seriously.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">FTC Compliance</h2>
          <p>This disclosure is made in accordance with the Federal Trade Commission's (FTC) guidelines on endorsements and testimonials (16 CFR, Part 255). Similar requirements apply in the EU, UK, and other jurisdictions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
          <p>Questions about our affiliate relationships? Contact us at: <strong>partnerships@taxpicker.io</strong></p>
        </section>
      </div>
    </div>
  )
}
