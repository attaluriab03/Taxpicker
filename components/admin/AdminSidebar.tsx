'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  FileText,
  BarChart2,
  ExternalLink,
  LogOut,
  Home,
  Info,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/clicks', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/filters', label: 'Filters', icon: SlidersHorizontal },
]

const contentNavItems = [
  { href: '/admin/content/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/content/about', label: 'About', icon: Info },
  { href: '/admin/content/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/content/privacy-policy', label: 'Privacy Policy', icon: FileText },
  { href: '/admin/content/terms', label: 'Terms', icon: FileText },
  { href: '/admin/content/affiliate-disclosure', label: 'Disclosure', icon: FileText },
  { href: '/admin/content/cookie-policy', label: 'Cookie Policy', icon: FileText },
  { href: '/admin/content/disclaimer', label: 'Disclaimer', icon: FileText },
]

interface AdminSidebarProps {
  userEmail: string | null
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-900 text-sm font-bold">
            T
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Taxpicker</div>
            <div className="text-xs text-slate-500">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Existing nav items */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href, item.exact)
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Site Content group */}
        <div className="mt-6">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Site Content
          </p>
          <div className="space-y-1">
            {contentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Site
        </a>

        {/* Signed-in user + Sign Out */}
        <div className="px-3 pt-2">
          {userEmail && (
            <p className="text-xs text-slate-500 truncate mb-2">{userEmail}</p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
