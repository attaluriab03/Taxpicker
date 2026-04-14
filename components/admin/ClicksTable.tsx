'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

interface Click {
  id: string
  clicked_at: string
  user_agent: string | null
  referrer: string | null
  ip: string | null
  gdpr_consent: boolean
  tools: { name: string; slug: string } | null
}

export default function ClicksTable({ clicks }: { clicks: Click[] }) {
  if (clicks.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-slate-400">
        <p>No affiliate clicks tracked yet.</p>
        <p className="text-xs mt-1">Clicks are only recorded when users have given GDPR consent.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide">Tool</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">Timestamp</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">IP</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">Referrer</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">GDPR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clicks.map((click) => (
            <tr key={click.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-medium text-slate-900">
                {(click.tools as any)?.name || click.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {new Date(click.clicked_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-slate-500 font-mono">
                {click.ip ? click.ip.slice(0, 12) + (click.ip.length > 12 ? '...' : '') : '—'}
              </td>
              <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                {click.referrer ? (
                  <span title={click.referrer}>
                    {click.referrer.replace(/^https?:\/\//, '').slice(0, 40)}
                    {click.referrer.length > 40 ? '...' : ''}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                {click.gdpr_consent ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
