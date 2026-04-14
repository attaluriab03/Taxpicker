import type { Metadata } from 'next'
import CookieSettingsButton from '@/components/layout/CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Taxpicker cookie policy — full breakdown of cookies used, their purpose, and how to manage them.',
  robots: { index: false, follow: false },
}

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="space-y-8 text-slate-700 text-sm leading-7">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. We also use localStorage (a similar browser-based storage mechanism) to persist certain preferences.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 rounded-lg text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Name</th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Type</th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Purpose</th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Consent Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 px-3 py-2"><code>cookie_consent</code></td>
                  <td className="border border-slate-200 px-3 py-2">localStorage</td>
                  <td className="border border-slate-200 px-3 py-2">Stores your cookie consent preference (true/false). Used to avoid showing the consent banner on every visit.</td>
                  <td className="border border-slate-200 px-3 py-2">No (strictly necessary)</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-3 py-2">Affiliate Click Logs</td>
                  <td className="border border-slate-200 px-3 py-2">Server-side DB</td>
                  <td className="border border-slate-200 px-3 py-2">Tracks when users click affiliate links — records tool clicked, timestamp, IP, and user agent for commission attribution and analytics.</td>
                  <td className="border border-slate-200 px-3 py-2">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Strictly Necessary Cookies</h2>
          <p>The <code className="bg-slate-100 rounded px-1">cookie_consent</code> localStorage entry is strictly necessary for the operation of our consent management. It cannot be disabled as it is required to remember your preference.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Analytics & Tracking Cookies</h2>
          <p>With your consent, we track affiliate link clicks. This data is stored server-side in our secure Supabase database. No data is shared with third-party advertising networks. We do not use Google Analytics, Facebook Pixel, or similar third-party trackers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Manage Your Preferences</h2>
          <p>You can change your cookie consent at any time using the button below or via the "Cookie Settings" link in the footer:</p>
          <div className="mt-4">
            <CookieSettingsButton />
          </div>
          <p className="mt-4">You can also clear all cookies and localStorage by clearing your browser data. Note that this will reset your consent preference and the banner will reappear on your next visit.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
          <p>Cookie-related questions: <strong>privacy@taxpicker.io</strong></p>
        </section>
      </div>
    </div>
  )
}
