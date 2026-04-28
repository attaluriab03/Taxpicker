export const dynamic = 'force-dynamic'

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
import { getPageContent, getContent } from '@/lib/content'
import { createSupabaseServer } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about crypto tax software, how to choose the right tool, compliance, and security.',
}

export default async function FAQPage() {
  const [content, { data: faqItems }] = await Promise.all([
    getPageContent('faq'),
    createSupabaseServer().then((sb) =>
      sb
        .from('faq_items')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
    ),
  ])

  const pageTitle = getContent(content, 'hero.page_title', 'Frequently Asked Questions')
  const pageDescription = getContent(
    content,
    'hero.page_description',
    'Find answers to common questions about crypto tax software, compliance, and choosing the right tool.'
  )

  // Build JSON-LD from DB items with page title/description fallbacks
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqItems ?? []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

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
          {pageTitle}
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          {pageDescription}
        </p>
      </div>

      {/* FAQ items */}
      <div className="mb-16">
        {(!faqItems || faqItems.length === 0) ? (
          <p className="text-slate-500 text-center py-8">No FAQ items found.</p>
        ) : (
          <Accordion type="single" collapsible className="border border-slate-200 rounded-xl overflow-hidden">
            {faqItems.map((faq, i) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${i}`}
                className="px-5 last:border-0"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-900 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
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
