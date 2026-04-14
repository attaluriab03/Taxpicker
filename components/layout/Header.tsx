'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Manrope } from 'next/font/google'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
})

// Blue extracted from Figma design: #2563EB
const BRAND_BLUE = '#2563EB'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Resources' },
  { href: '/faq', label: 'FAQ' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2 font-bold flex-shrink-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              T
            </div>
            <span
              className={`text-xl font-extrabold tracking-tight ${manrope.className}`}
              style={{ color: BRAND_BLUE }}
            >
              Taxpicker
            </span>
          </Link>

          {/* Desktop nav — absolutely centered */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger — right */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
