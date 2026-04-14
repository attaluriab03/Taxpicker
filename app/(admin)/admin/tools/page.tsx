import { createServiceClient } from '@/lib/supabase'
import type { Tool } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Star, Edit, Trash2, ExternalLink } from 'lucide-react'

async function getTools(): Promise<Tool[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Tool[]) || []
}

export default async function AdminToolsPage() {
  const tools = await getTools()
  const published = tools.filter((t) => t.is_published)
  const drafts = tools.filter((t) => !t.is_published)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools</h1>
          <p className="text-slate-500 text-sm mt-1">
            {published.length} published · {drafts.length} draft
          </p>
        </div>
        <Link href="/admin/tools/new">
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Add New Tool
          </Button>
        </Link>
      </div>

      {drafts.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-amber-800">
          <span className="font-semibold">{drafts.length} draft{drafts.length !== 1 ? 's' : ''} pending review.</span>
          Review and publish them when ready.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tool</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pricing</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Flags</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tools.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                  No tools yet.{' '}
                  <Link href="/admin/tools/new" className="text-blue-600 hover:underline">
                    Add the first one.
                  </Link>
                </td>
              </tr>
            )}
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <span className="font-medium text-slate-900">{tool.name}</span>
                    {tool.website_url && (
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-slate-400 hover:text-blue-600 inline-flex items-center"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">{tool.slug}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs text-slate-600 capitalize">{tool.pricing_type}</div>
                  {tool.price_from && (
                    <div className="text-xs text-slate-400">${tool.price_from}/yr</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-slate-700">{tool.rating || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {tool.is_recommended && <Badge variant="recommended" className="text-xs">Rec</Badge>}
                    {tool.is_featured && <Badge variant="blue" className="text-xs">Featured</Badge>}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={tool.is_published ? 'success' : 'secondary'} className="text-xs">
                    {tool.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/tools/${tool.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-600">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/admin/tools/${tool.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-700">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
