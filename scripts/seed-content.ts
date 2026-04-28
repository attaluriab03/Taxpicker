import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local into process.env
const envPath = resolve(process.cwd(), '.env.local')
try {
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  console.warn('Could not load .env.local — using existing process.env')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// ─── Site content rows ─────────────────────────────────────────────────────

type ContentRow = {
  page: string
  section: string
  key: string
  label: string
  content_type: string
  value: string
}

const PRIVACY_POLICY_MD = `## 1. Introduction

Taxpicker ("we," "us," or "our") operates the Taxpicker website. This Privacy Policy explains how we collect, use, and protect information about you when you use our platform.

## 2. Information We Collect

### 2.1 Automatically Collected Data

When you visit our site, we may collect:

- IP address and approximate geographic location
- Browser type and operating system
- Pages visited and time spent on each page
- Referring website URLs

### 2.2 Affiliate Click Data

With your cookie consent, we log affiliate link clicks including: tool clicked, timestamp, IP address, user agent, and referrer. This data is stored securely in Supabase and used only for internal analytics.

### 2.3 Cookie Consent Records

We store your consent preference (accept/reject) in your browser's localStorage. We also log consent events in our database to maintain compliance records.

## 3. How We Use Your Data

- To measure site performance and understand user behavior
- To track affiliate link performance (only with consent)
- To improve our tool listings and comparison features
- To comply with legal obligations

## 4. Data Storage

Your data is stored in Supabase, a secure cloud database platform with encryption at rest and in transit. Supabase infrastructure complies with SOC 2 Type II. We do not sell your personal data to third parties.

## 5. Cookies

We use cookies and localStorage for:

- **Functional:** Storing your cookie consent preference
- **Analytics:** Tracking page views and affiliate clicks (consent required)

For full details, see our [Cookie Policy](/cookie-policy).

## 6. Your GDPR Rights

If you are located in the European Economic Area (EEA), you have the following rights:

- **Right to Access:** Request a copy of the personal data we hold about you
- **Right to Rectification:** Correct inaccurate data
- **Right to Erasure:** Request deletion of your data ("right to be forgotten")
- **Right to Portability:** Receive your data in a machine-readable format
- **Right to Object:** Object to processing based on legitimate interests
- **Right to Withdraw Consent:** Withdraw cookie consent at any time via Cookie Settings in the footer

## 7. Data Retention

Affiliate click logs are retained for 24 months. Cookie consent records are retained for 36 months for compliance purposes. You may request deletion at any time.

## 8. Third-Party Links

Our site contains links to third-party tools. We are not responsible for the privacy practices of those sites and recommend you review their privacy policies independently.

## 9. Contact

For privacy-related requests or questions, contact us at: **privacy@taxpicker.io**`

const TERMS_MD = `## 1. Acceptance of Terms

By accessing and using Taxpicker ("the Platform"), you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform.

## 2. Description of Service

Taxpicker is an informational platform that aggregates, reviews, and compares crypto tax software tools. We provide editorial content, user reviews, pricing information, and feature comparisons. The Platform does not provide financial, tax, or legal advice.

## 3. Informational Content Only

All content on Taxpicker is for informational purposes only. Nothing on this Platform constitutes professional financial, tax, investment, or legal advice. You should consult a qualified professional before making any decisions based on information found here.

## 4. Affiliate Relationships

Some links on this Platform are affiliate links. When you click these links and sign up for a service, we may earn a commission at no additional cost to you. Our editorial content is not influenced by affiliate relationships; however, you should be aware this relationship exists. See our full [Affiliate Disclosure](/affiliate-disclosure).

## 5. Accuracy of Information

While we strive to maintain accurate and up-to-date information, we do not guarantee the accuracy, completeness, or timeliness of any content on the Platform. Pricing and features of third-party tools may change without notice. Always verify information directly with the tool provider before making a purchase decision.

## 6. Intellectual Property

All original content on the Platform, including text, graphics, and code, is owned by Taxpicker or its content contributors. Tool logos and brand assets remain the property of their respective owners and are used for identification purposes only.

## 7. Prohibited Uses

You may not:

- Scrape or systematically download content without permission
- Use the Platform for any unlawful purpose
- Attempt to gain unauthorized access to any part of the Platform
- Interfere with the operation of the Platform

## 8. Limitation of Liability

To the fullest extent permitted by law, Taxpicker shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Platform or any third-party tools you access through it.

## 9. Changes to Terms

We reserve the right to modify these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.

## 10. Contact

Questions about these Terms? Contact us at: **legal@taxpicker.io**`

const AFFILIATE_DISCLOSURE_MD = `> In the interest of full transparency: Taxpicker participates in affiliate programs with some of the tools we compare. We earn a commission when users sign up through our links. This does not affect the price you pay.

## What Are Affiliate Links?

When you click a "Get Started," "Visit Website," or similar call-to-action button on Taxpicker, you may be directed to the tool's website via a tracked referral link. If you sign up or purchase a plan, we may receive a commission from the tool provider at no additional cost to you.

## Our Commitment to Objectivity

We are committed to providing honest, unbiased reviews. Our editorial rankings and feature comparisons are based on objective criteria including: feature set, pricing value, user reviews, exchange support, and country availability.

Affiliate relationships may influence the order in which some tools are presented, but we clearly label recommended tools and always provide full feature comparisons so you can make your own informed decision.

## How Ranking Works

Tools are ranked according to the following factors in order of weight:

1. Is Recommended status (editorially assigned by our team)
2. Is Featured status
3. User rating (average review score)
4. Date added to the platform

Affiliate commission rates do not directly determine ranking. However, we may choose to highlight tools with which we have stronger partnerships in the "Recommended" category if those tools also meet our quality criteria.

## Your Trust Matters

We believe in being upfront. If you ever have questions about our relationship with any specific tool, or believe our reviews are inaccurate, please contact us. We take editorial integrity seriously.

## FTC Compliance

This disclosure is made in accordance with the Federal Trade Commission's (FTC) guidelines on endorsements and testimonials (16 CFR, Part 255). Similar requirements apply in the EU, UK, and other jurisdictions.

## Contact

Questions about our affiliate relationships? Contact us at: **partnerships@taxpicker.io**`

const COOKIE_POLICY_MD = `## What Are Cookies?

Cookies are small text files stored on your device when you visit a website. We also use localStorage (a similar browser-based storage mechanism) to persist certain preferences.

## Cookies We Use

| Name | Type | Purpose | Consent Required |
|------|------|---------|-----------------|
| \`cookie_consent\` | localStorage | Stores your cookie consent preference (true/false). Used to avoid showing the consent banner on every visit. | No (strictly necessary) |
| Affiliate Click Logs | Server-side DB | Tracks when users click affiliate links — records tool clicked, timestamp, IP, and user agent for commission attribution and analytics. | Yes |

## Strictly Necessary Cookies

The \`cookie_consent\` localStorage entry is strictly necessary for the operation of our consent management. It cannot be disabled as it is required to remember your preference.

## Analytics & Tracking Cookies

With your consent, we track affiliate link clicks. This data is stored server-side in our secure Supabase database. No data is shared with third-party advertising networks. We do not use Google Analytics, Facebook Pixel, or similar third-party trackers.

## How to Manage Your Preferences

You can change your cookie consent at any time using the Cookie Settings link in the footer.

You can also clear all cookies and localStorage by clearing your browser data. Note that this will reset your consent preference and the banner will reappear on your next visit.

## Contact

Cookie-related questions: **privacy@taxpicker.io**`

const DISCLAIMER_MD = `> **Important:** This content is for informational purposes only and does not constitute financial, tax, or legal advice. Always conduct your own research and consult a qualified professional before making any decisions.

## No Financial or Legal Advice

Taxpicker is an informational platform only. Nothing on this website constitutes financial, investment, tax, or legal advice. The content is provided for general informational purposes and should not be relied upon as a substitute for professional advice.

## No Responsibility for Decisions

Taxpicker and its operators bear no responsibility for any decisions made based on information found on this platform. You acknowledge that your use of any crypto tax tool, and any financial decisions you make as a result, are entirely at your own risk.

## Accuracy of Tool Information

While we make reasonable efforts to ensure the accuracy of tool listings, pricing, and feature information, we cannot guarantee that all information is current or correct. Crypto tax software pricing, features, and capabilities change frequently. Always verify details directly with the tool provider before purchasing.

## Third-Party Content

This platform contains links to third-party websites and tools. We have no control over the content, privacy practices, or reliability of those third-party services and accept no liability for them.

## Limitation of Liability

To the maximum extent permitted by applicable law, Taxpicker, its operators, employees, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:

- Your use of or reliance on information on this platform
- Errors or omissions in tool listings
- Any actions taken based on content published here
- Tax penalties, fines, or compliance issues resulting from tool use

## Professional Advice

We strongly recommend consulting a qualified tax professional or accountant for advice specific to your situation. Crypto tax laws vary significantly by country and change frequently.`

const LAST_UPDATED = 'April 27, 2026'

const siteContentRows: ContentRow[] = [
  // ── Homepage › hero ──────────────────────────────────────────────────────
  {
    page: 'homepage', section: 'hero', key: 'trusted_badge_text',
    label: 'Trusted Badge Text', content_type: 'text',
    value: 'Trusted by 50,000+ crypto investors',
  },
  {
    page: 'homepage', section: 'hero', key: 'title_line_1',
    label: 'Title Line 1', content_type: 'text',
    value: 'Find the Right Crypto Tax Tool',
  },
  {
    page: 'homepage', section: 'hero', key: 'title_line_2',
    label: 'Title Line 2', content_type: 'text',
    value: 'for You',
  },
  {
    page: 'homepage', section: 'hero', key: 'description',
    label: 'Hero Description', content_type: 'textarea',
    value: "Save hours of research and avoid costly mistakes. We've tested leading platforms across 15+ countries to help you find the right fit—fast.",
  },

  // ── Homepage › metrics ───────────────────────────────────────────────────
  {
    page: 'homepage', section: 'metrics', key: 'metric_1_value',
    label: 'Metric 1 Number', content_type: 'text', value: '50K+',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_1_label',
    label: 'Metric 1 Label', content_type: 'text', value: 'Users Helped',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_2_value',
    label: 'Metric 2 Number', content_type: 'text', value: '10+',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_2_label',
    label: 'Metric 2 Label', content_type: 'text', value: 'Platforms Reviewed',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_3_value',
    label: 'Metric 3 Number', content_type: 'text', value: '50+',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_3_label',
    label: 'Metric 3 Label', content_type: 'text', value: 'Evaluation Criteria',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_4_value',
    label: 'Metric 4 Number', content_type: 'text', value: '15+',
  },
  {
    page: 'homepage', section: 'metrics', key: 'metric_4_label',
    label: 'Metric 4 Label', content_type: 'text', value: 'Countries Supported',
  },

  // ── Homepage › comparison_table ──────────────────────────────────────────
  {
    page: 'homepage', section: 'comparison_table', key: 'section_title',
    label: 'Comparison Table Title', content_type: 'text',
    value: 'Refine Results',
  },
  {
    page: 'homepage', section: 'comparison_table', key: 'section_description',
    label: 'Comparison Table Description', content_type: 'textarea',
    value: '',
  },

  // ── Homepage › feature_matrix ────────────────────────────────────────────
  {
    page: 'homepage', section: 'feature_matrix', key: 'section_title',
    label: 'Feature Matrix Title', content_type: 'text',
    value: 'Feature Comparison Matrix',
  },
  {
    page: 'homepage', section: 'feature_matrix', key: 'section_description',
    label: 'Feature Matrix Description', content_type: 'text',
    value: 'Compare features across all platforms',
  },

  // ── About › hero ─────────────────────────────────────────────────────────
  {
    page: 'about', section: 'hero', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'About Taxpicker',
  },
  {
    page: 'about', section: 'hero', key: 'page_description',
    label: 'Page Description', content_type: 'textarea',
    value: "We're on a mission to bring transparency to the crypto tax software industry. Our platform helps investors and businesses find the right solution through unbiased comparisons and comprehensive research.",
  },

  // ── About › why ──────────────────────────────────────────────────────────
  {
    page: 'about', section: 'why', key: 'section_title',
    label: 'Why Section Title', content_type: 'text',
    value: 'Why Taxpicker Exists',
  },
  {
    page: 'about', section: 'why', key: 'section_description',
    label: 'Why Section Description', content_type: 'text',
    value: "The problem we're solving in the crypto tax space",
  },

  // ── About › methodology ──────────────────────────────────────────────────
  {
    page: 'about', section: 'methodology', key: 'section_title',
    label: 'Methodology Title', content_type: 'text',
    value: 'Our Methodology',
  },
  {
    page: 'about', section: 'methodology', key: 'section_description',
    label: 'Methodology Description', content_type: 'text',
    value: 'How we evaluate and compare crypto tax software',
  },

  // ── About › affiliate ────────────────────────────────────────────────────
  {
    page: 'about', section: 'affiliate', key: 'section_title',
    label: 'Affiliate Section Title', content_type: 'text',
    value: 'Affiliate Disclosure',
  },

  // ── About › cta ──────────────────────────────────────────────────────────
  {
    page: 'about', section: 'cta', key: 'section_title',
    label: 'CTA Title', content_type: 'text',
    value: 'Ready to Find Your Perfect Tax Tool?',
  },
  {
    page: 'about', section: 'cta', key: 'description',
    label: 'CTA Description', content_type: 'textarea',
    value: 'Use our comparison tool to find the right crypto tax software for your needs.',
  },
  {
    page: 'about', section: 'cta', key: 'button_text',
    label: 'CTA Button Text', content_type: 'text',
    value: 'Compare Tools Now',
  },

  // ── FAQ › hero ───────────────────────────────────────────────────────────
  {
    page: 'faq', section: 'hero', key: 'page_title',
    label: 'Page Title', content_type: 'text',
    value: 'Frequently Asked Questions',
  },
  {
    page: 'faq', section: 'hero', key: 'page_description',
    label: 'Page Description', content_type: 'textarea',
    value: 'Find answers to common questions about crypto tax software, compliance, and choosing the right tool.',
  },

  // ── Privacy Policy ───────────────────────────────────────────────────────
  {
    page: 'privacy-policy', section: 'page', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'Privacy Policy',
  },
  {
    page: 'privacy-policy', section: 'page', key: 'last_updated',
    label: 'Last Updated', content_type: 'text', value: LAST_UPDATED,
  },
  {
    page: 'privacy-policy', section: 'page', key: 'content',
    label: 'Page Content', content_type: 'richtext', value: PRIVACY_POLICY_MD,
  },

  // ── Terms ────────────────────────────────────────────────────────────────
  {
    page: 'terms', section: 'page', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'Terms of Use',
  },
  {
    page: 'terms', section: 'page', key: 'last_updated',
    label: 'Last Updated', content_type: 'text', value: LAST_UPDATED,
  },
  {
    page: 'terms', section: 'page', key: 'content',
    label: 'Page Content', content_type: 'richtext', value: TERMS_MD,
  },

  // ── Affiliate Disclosure ─────────────────────────────────────────────────
  {
    page: 'affiliate-disclosure', section: 'page', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'Affiliate Disclosure',
  },
  {
    page: 'affiliate-disclosure', section: 'page', key: 'last_updated',
    label: 'Last Updated', content_type: 'text', value: LAST_UPDATED,
  },
  {
    page: 'affiliate-disclosure', section: 'page', key: 'content',
    label: 'Page Content', content_type: 'richtext', value: AFFILIATE_DISCLOSURE_MD,
  },

  // ── Cookie Policy ────────────────────────────────────────────────────────
  {
    page: 'cookie-policy', section: 'page', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'Cookie Policy',
  },
  {
    page: 'cookie-policy', section: 'page', key: 'last_updated',
    label: 'Last Updated', content_type: 'text', value: LAST_UPDATED,
  },
  {
    page: 'cookie-policy', section: 'page', key: 'content',
    label: 'Page Content', content_type: 'richtext', value: COOKIE_POLICY_MD,
  },

  // ── Disclaimer ───────────────────────────────────────────────────────────
  {
    page: 'disclaimer', section: 'page', key: 'page_title',
    label: 'Page Title', content_type: 'text', value: 'Disclaimer',
  },
  {
    page: 'disclaimer', section: 'page', key: 'last_updated',
    label: 'Last Updated', content_type: 'text', value: LAST_UPDATED,
  },
  {
    page: 'disclaimer', section: 'page', key: 'content',
    label: 'Page Content', content_type: 'richtext', value: DISCLAIMER_MD,
  },
]

// ─── FAQ items ─────────────────────────────────────────────────────────────

type FaqItem = {
  question: string
  answer: string
  display_order: number
  is_published: boolean
}

const faqItems: FaqItem[] = [
  // General Questions (1–4)
  {
    display_order: 1,
    is_published: true,
    question: 'Where do I begin with crypto taxes?',
    answer: "Start by gathering all your transaction records from every exchange and wallet you've used. Then choose a crypto tax software that supports all your exchanges, import your data, and generate your tax report. Our comparison tool can help you find the right software for your situation.",
  },
  {
    display_order: 2,
    is_published: true,
    question: 'How does crypto tax software work?',
    answer: 'Crypto tax software connects to your exchanges and wallets (via API or CSV import), fetches your transaction history, and calculates your capital gains, income, and other taxable events using FIFO, LIFO, HIFO, or other accounting methods. It then generates tax reports you can use to file your taxes.',
  },
  {
    display_order: 3,
    is_published: true,
    question: 'Do I need dedicated crypto tax software?',
    answer: 'For simple situations (a few trades on one exchange), a spreadsheet may work. But for anyone with multiple exchanges, DeFi transactions, staking rewards, or NFTs, dedicated software will save hours and reduce errors significantly.',
  },
  {
    display_order: 4,
    is_published: true,
    question: 'Is crypto tax software legally required?',
    answer: 'No software is legally required. However, in most countries you are legally required to accurately report crypto transactions on your tax return. Using software helps ensure accuracy and provides documentation in case of an audit.',
  },

  // Crypto Tax Questions (5–8)
  {
    display_order: 5,
    is_published: true,
    question: 'What crypto transactions are taxable?',
    answer: 'In most countries, taxable events include: selling crypto for fiat, trading one crypto for another, using crypto to purchase goods/services, receiving crypto as income (mining, staking, DeFi yield), and receiving airdrops. Simply holding crypto is generally not taxable.',
  },
  {
    display_order: 6,
    is_published: true,
    question: 'How does NFT taxation work?',
    answer: 'NFTs are generally treated as property for tax purposes. Selling an NFT for a gain triggers a capital gains tax event. Creating and selling NFTs may be treated as ordinary income. Some tools specifically support NFT tracking while others have limited support.',
  },
  {
    display_order: 7,
    is_published: true,
    question: 'What is tax-loss harvesting?',
    answer: 'Tax-loss harvesting involves selling crypto assets at a loss to offset capital gains in the same tax year, reducing your overall tax liability. Many crypto tax tools include features to identify tax-loss harvesting opportunities.',
  },
  {
    display_order: 8,
    is_published: true,
    question: "Can I amend past years' crypto tax returns?",
    answer: 'Yes, in most countries you can file amended returns for prior years. Most crypto tax software allows you to generate reports for past years. Consulting a tax professional is recommended for amended filings.',
  },

  // Choosing the Right Tool (9–11)
  {
    display_order: 9,
    is_published: true,
    question: 'Which tool should I use for DeFi?',
    answer: 'For DeFi users, CryptoTaxCalculator and Koinly are generally considered to have the strongest DeFi support. Look for tools that support on-chain transactions, LP positions, yield farming, and the specific chains you use.',
  },
  {
    display_order: 10,
    is_published: true,
    question: 'Which tools work in my country?',
    answer: "Most tools support US, UK, Canada, and Australia. European support varies more significantly. Use our filter tool on the homepage to find tools that support your specific country. Always verify country support on the tool's official website before subscribing.",
  },
  {
    display_order: 11,
    is_published: true,
    question: 'Can I try a tool before buying?',
    answer: 'Most major crypto tax tools offer a free tier with limited transactions (usually 25-100) or a free trial period. We recommend importing your data and reviewing the report before upgrading to a paid plan.',
  },

  // Compliance & Security (12–14)
  {
    display_order: 12,
    is_published: true,
    question: 'Is my data safe with crypto tax software?',
    answer: "Reputable crypto tax tools use encryption, secure cloud storage, and do not store your private keys. We recommend using read-only API keys where possible when connecting exchanges. Review each tool's security page and privacy policy before connecting your accounts.",
  },
  {
    display_order: 13,
    is_published: true,
    question: 'Can I use the reports with a CPA?',
    answer: "Yes. Most crypto tax tools generate CPA-friendly exports including Form 8949 (US), Schedule D, and CSV exports. Many CPAs now accept these reports directly. Check the tool's export formats against what your CPA requires.",
  },
  {
    display_order: 14,
    is_published: true,
    question: 'What if my data gets audited?',
    answer: 'Most tools provide audit trail reports that document every transaction, the accounting method used, and how each gain/loss was calculated. These reports are designed to be defensible in an audit scenario.',
  },
]

// ─── Runner ────────────────────────────────────────────────────────────────

async function seedSiteContent() {
  console.log(`\nSeeding site_content (${siteContentRows.length} rows)…`)

  const { error } = await supabase
    .from('site_content')
    .upsert(
      siteContentRows.map((r) => ({
        ...r,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'page,section,key' }
    )

  if (error) {
    console.error('  ✗ site_content error:', error.message)
    throw error
  }

  console.log('  ✓ site_content seeded')
}

async function seedFaqItems() {
  console.log(`\nSeeding faq_items (${faqItems.length} rows)…`)

  const { count } = await supabase
    .from('faq_items')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log(`  ℹ faq_items already has ${count} rows — skipping insert (delete rows manually to re-seed)`)
    return
  }

  const { error } = await supabase
    .from('faq_items')
    .insert(faqItems)

  if (error) {
    console.error('  ✗ faq_items error:', error.message)
    throw error
  }

  console.log('  ✓ faq_items seeded')
}

async function verifyCounts() {
  console.log('\nVerification:')

  const { data: contentCounts } = await supabase
    .from('site_content')
    .select('page')

  if (contentCounts) {
    const byPage: Record<string, number> = {}
    for (const row of contentCounts) {
      byPage[row.page] = (byPage[row.page] ?? 0) + 1
    }
    console.log('\n  site_content rows by page:')
    for (const [page, count] of Object.entries(byPage).sort()) {
      console.log(`    ${page}: ${count}`)
    }
  }

  const { data: faqRows } = await supabase
    .from('faq_items')
    .select('display_order, question')
    .order('display_order')

  if (faqRows) {
    console.log(`\n  faq_items: ${faqRows.length} rows`)
    for (const row of faqRows) {
      console.log(`    [${row.display_order}] ${row.question.slice(0, 60)}`)
    }
  }
}

async function main() {
  console.log('=== Taxpicker content seed ===')
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

  await seedSiteContent()
  await seedFaqItems()
  await verifyCounts()

  console.log('\n✓ Seed complete\n')
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err)
  process.exit(1)
})
