'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Info } from 'lucide-react'

export default function AffiliateBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Info className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <p>
              Some links on this page are affiliate links. We may earn a commission if you sign up through them, at no extra cost to you.{' '}
              <Link
                href="/affiliate-disclosure"
                className="font-medium underline underline-offset-2 hover:text-amber-900"
              >
                Read our full affiliate disclosure.
              </Link>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
            aria-label="Dismiss affiliate notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
