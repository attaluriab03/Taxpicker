'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Star, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { toast } from '@/lib/use-toast'

type ToolRow = {
  id: string
  name: string
  slug: string
  rating: number | null
  is_published: boolean
  is_recommended: boolean
}

export default function AdminToolsTable({ tools }: { tools: ToolRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const filtered = search.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.slug.toLowerCase().includes(search.toLowerCase())
      )
    : tools

  const unpublish = async (tool: ToolRow) => {
    if (!confirm(`Unpublish "${tool.name}"? It will be hidden from the public site.`)) return
    setPendingId(tool.id)
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: false }),
      })
      if (!res.ok) throw new Error('Failed to unpublish')
      toast({ title: `"${tool.name}" unpublished` })
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setPendingId(null)
    }
  }

  const deleteTool = async (tool: ToolRow) => {
    if (!confirm(`Permanently delete "${tool.name}"? This cannot be undone.`)) return
    setPendingId(tool.id)
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: `"${tool.name}" deleted` })
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 mb-6">
      {/* Header with search */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Crypto Tax Tools</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Link href="/admin/tools/new">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-1" />
              Add New Tool
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tool
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Rating
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                {search ? `No tools match "${search}"` : 'No tools yet.'}
              </td>
            </tr>
          ) : (
            filtered.map((tool) => {
              const isLoading = pendingId === tool.id
              return (
                <tr key={tool.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium text-slate-900">{tool.name}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{tool.slug}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-slate-700">{tool.rating ?? 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={tool.is_published ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {tool.is_published ? 'Active' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/tools/${tool.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-700 text-xs h-7 px-2"
                        >
                          Edit
                        </Button>
                      </Link>
                      {tool.is_published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unpublish(tool)}
                          disabled={isLoading}
                          className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 text-xs h-7 px-2"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1" />
                          )}
                          Unpublish
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTool(tool)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      <div className="px-6 py-3 border-t border-slate-100">
        <Link href="/admin/tools" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all tools →
        </Link>
      </div>
    </div>
  )
}
