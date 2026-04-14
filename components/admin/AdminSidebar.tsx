'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  FileText,
  BarChart2,
  Settings,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/clicks', label: 'Analytics', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
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
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Site
        </a>
      </div>
    </aside>
  )
}
