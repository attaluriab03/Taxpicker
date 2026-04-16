import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageCircle, Headphones, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about crypto tax software, how to choose the right tool, compliance, and security.',
}

const faqSections = [
  {
    title: 'General Questions',
    faqs: [
      {
        q: 'Where do I begin with crypto taxes?',
        a: 'Start by gathering all your transaction records from every exchange and wallet you\'ve used. Then choose a crypto tax software that supports all your exchanges, import your data, and generate your tax report. Our comparison tool can help you find the right software for your situation.',
      },
      {
        q: 'How does crypto tax software work?',
        a: 'Crypto tax software connects to your exchanges and wallets (via API or CSV import), fetches your transaction history, and calculates your capital gains, income, and other taxable events using FIFO, LIFO, HIFO, or other accounting methods. It then generates tax reports you can use to file your taxes.',
      },
      {
        q: 'Do I need dedicated crypto tax software?',
        a: 'For simple situations (a few trades on one exchange), a spreadsheet may work. But for anyone with multiple exchanges, DeFi transactions, staking rewards, or NFTs, dedicated software will save hours and reduce errors significantly.',
      },
      {
        q: 'Is crypto tax software legally required?',
        a: 'No software is legally required. However, in most countries you are legally required to accurately report crypto transactions on your tax return. Using software helps ensure accuracy and provides documentation in case of an audit.',
      },
    ],
  },
  {
    title: 'Crypto Tax Questions',
    faqs: [
      {
        q: 'What crypto transactions are taxable?',
        a: 'In most countries, taxable events include: selling crypto for fiat, trading one crypto for another, using crypto to purchase goods/services, receiving crypto as income (mining, staking, DeFi yield), and receiving airdrops. Simply holding crypto is generally not taxable.',
      },
      {
        q: 'How does NFT taxation work?',
        a: 'NFTs are generally treated as property for tax purposes. Selling an NFT for a gain triggers a capital gains tax event. Creating and selling NFTs may be treated as ordinary income. Some tools specifically support NFT tracking while others have limited support.',
      },
      {
        q: 'What is tax-loss harvesting?',
        a: 'Tax-loss harvesting involves selling crypto assets at a loss to offset capital gains in the same tax year, reducing your overall tax liability. Many crypto tax tools include features to identify tax-loss harvesting opportunities.',
      },
      {
        q: 'Can I amend past years\' crypto tax returns?',
        a: 'Yes, in most countries you can file amended returns for prior years. Most crypto tax software allows you to generate reports for past years. Consulting a tax professional is recommended for amended filings.',
      },
    ],
  },
  {
    title: 'Choosing the Right Tool',
    faqs: [
      {
        q: 'Which tool should I use for DeFi?',
        a: 'For DeFi users, CryptoTaxCalculator and Koinly are generally considered to have the strongest DeFi support. Look for tools that support on-chain transactions, LP positions, yield farming, and the specific chains you use.',
      },
      {
        q: 'Which tools work in my country?',
        a: 'Most tools support US, UK, Canada, and Australia. European support varies more significantly. Use our filter tool on the homepage to find tools that support your specific country. Always verify country support on the tool\'s official website before subscribing.',
      },
      {
        q: 'Can I try a tool before buying?',
        a: 'Most major crypto tax tools offer a free tier with limited transactions (usually 25-100) or a free trial period. We recommend importing your data and reviewing the report before upgrading to a paid plan.',
      },
    ],
  },
  {
    title: 'Compliance & Security',
    faqs: [
      {
        q: 'Is my data safe with crypto tax software?',
        a: 'Reputable crypto tax tools use encryption, secure cloud storage, and do not store your private keys. We recommend using read-only API keys where possible when connecting exchanges. Review each tool\'s security page and privacy policy before connecting your accounts.',
      },
      {
        q: 'Can I use the reports with a CPA?',
        a: 'Yes. Most crypto tax tools generate CPA-friendly exports including Form 8949 (US), Schedule D, and CSV exports. Many CPAs now accept these reports directly. Check the tool\'s export formats against what your CPA requires.',
      },
      {
        q: 'What if my data gets audited?',
        a: 'Most tools provide audit trail reports that document every transaction, the accounting method used, and how each gain/loss was calculated. These reports are designed to be defensible in an audit scenario.',
      },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((section) =>
    section.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    }))
  ),
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <MessageCircle className="h-7 w-7 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Find answers to common questions about crypto tax software, compliance, and choosing the right tool.
        </p>
      </div>

      {/* FAQ sections */}
      <div className="space-y-10 mb-16">
        {faqSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.title}</h2>
            <Accordion type="single" collapsible className="border border-slate-200 rounded-xl overflow-hidden">
              {section.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`${section.title}-${i}`}
                  className="px-5 last:border-0"
                >
                  <AccordionTrigger className="text-sm font-medium text-slate-900 text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      {/* Still have questions */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200">
            <Headphones className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Still Have Questions?</h2>
        <p className="text-slate-500 mb-6">Can't find the answer you're looking for? Our team is always here to help.</p>
        <div className="max-w-md mx-auto space-y-4">
          <form className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      {/* Support cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, title: 'Tax Guides', desc: 'Read our in-depth crypto tax guides', href: '/blog' },
          { icon: Headphones, title: 'Email Support', desc: 'support@taxpicker.io', href: 'mailto:support@taxpicker.io' },
          { icon: MessageCircle, title: 'Request Review', desc: 'Suggest a tool for us to review', href: 'mailto:reviews@taxpicker.io' },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="group border border-slate-200 rounded-xl p-5 text-center hover:shadow-sm transition-shadow hover:border-blue-200"
          >
            <div className="flex justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors">
                <card.icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{card.title}</h3>
            <p className="text-xs text-slate-500">{card.desc}</p>
          </a>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  )
}
