'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const CONSENT_KEY = 'cookie_consent'

export function getCookieConsent(): boolean | null {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem(CONSENT_KEY)
  if (val === null) return null
  return val === 'true'
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_KEY)
    if (existing === null) setVisible(true)

    const handler = () => setVisible(true)
    window.addEventListener('show-cookie-banner', handler)
    return () => window.removeEventListener('show-cookie-banner', handler)
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'true')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1">
              We use cookies
            </p>
            <p className="text-xs text-slate-400 leading-5">
              We use cookies and similar tracking technologies to enable affiliate click tracking and analytics. This only activates after you give consent.{' '}
              <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline">
                Cookie Policy
              </Link>{' '}
              ·{' '}
              <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          <button
            onClick={reject}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={reject}
            className="bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            Reject All
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
