import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Eye, Users, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Taxpicker',
  description: 'Learn about Taxpicker\'s mission to bring transparency to the crypto tax software industry.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">About Taxpicker</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We're on a mission to bring transparency to the crypto tax software industry. Our platform helps investors and businesses find the right solution through unbiased comparisons and comprehensive research.
        </p>
      </div>

      {/* Why section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">Why Taxpicker Exists</h2>
        <p className="text-center text-slate-500 mb-10">The problem we're solving in the crypto tax space</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              color: 'text-red-500',
              bg: 'bg-red-50',
              title: 'Overwhelming Choices',
              desc: 'The market has grown rapidly, with dozens of tools claiming to be the best. Finding the right one for your specific needs — DeFi, NFTs, specific countries — is exhausting.',
            },
            {
              icon: Eye,
              color: 'text-orange-500',
              bg: 'bg-orange-50',
              title: 'Hidden Limitations',
              desc: 'Many reviews are shallow or promotional. Real limitations in country support, DeFi accuracy, or NTF reporting often only surface after purchase.',
            },
            {
              icon: Shield,
              color: 'text-blue-500',
              bg: 'bg-blue-50',
              title: 'Lack of Transparency',
              desc: 'Most comparison sites have undisclosed affiliate relationships that bias their rankings and recommendations.',
            },
          ].map((item) => (
            <div key={item.title} className="border border-slate-200 rounded-xl p-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg} mb-4`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">Our Methodology</h2>
        <p className="text-center text-slate-500 mb-10">How we evaluate and compare crypto tax software</p>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: Eye,
              title: 'Hands-On Testing',
              desc: 'We sign up with real accounts and test tools directly with sample transaction data, including DeFi, NFTs, and multiple exchanges.',
            },
            {
              icon: Users,
              title: 'User Reviews',
              desc: 'We aggregate real user feedback and weight reviews from verified purchasers more heavily than anonymous submissions.',
            },
            {
              icon: Shield,
              title: 'Feature Analysis',
              desc: 'We map every tool against a standardized feature matrix covering 13+ key capabilities so comparisons are apples-to-apples.',
            },
            {
              icon: RefreshCw,
              title: 'Regular Updates',
              desc: 'We re-verify tool pricing and features quarterly and flag any tools that have not been verified recently.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 border border-slate-100 rounded-xl">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                <item.icon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="mb-16 border border-amber-200 bg-amber-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Affiliate Disclosure</h2>
        <p className="text-sm text-slate-700 mb-2">
          <strong>Transparency first:</strong> Taxpicker participates in affiliate programs with some of the tools we compare. We earn a commission when users sign up through our referral links at no extra cost to you.
        </p>
        <p className="text-sm text-slate-700 mb-2">
          <strong>Our Commitment:</strong> Affiliate relationships may influence rankings at the margin, but we will never recommend tools we believe are poor quality or misrepresent their capabilities.
        </p>
        <p className="text-sm text-slate-700 mb-4">
          <strong>Your Protection:</strong> We always disclose when links are affiliate links and provide full feature comparisons so you have the information to make your own decision.
        </p>
        <Link href="/affiliate-disclosure" className="text-sm text-amber-800 font-medium underline hover:text-amber-900">
          Read our full affiliate disclosure →
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Find Your Perfect Tax Tool?</h2>
        <p className="text-slate-400 mb-6">Use our comparison tool to find the right crypto tax software for your needs.</p>
        <Link href="/">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Compare Tools Now
          </Button>
        </Link>
      </section>
    </div>
  )
}
