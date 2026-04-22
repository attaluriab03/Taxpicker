'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Edit, ExternalLink, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { toast } from '@/lib/use-toast'
import type { Tool } from '@/lib/supabase'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTooltip from '@/components/admin/AdminTooltip'

type ConfirmState = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  variant: 'danger' | 'warning' | 'default'
  onConfirm: () => void
}

const CLOSED_CONFIRM: ConfirmState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: '',
  variant: 'danger',
  onConfirm: () => {},
}

export default function AdminToolsPageTable({ tools }: { tools: Tool[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>(CLOSED_CONFIRM)
  const [actionLoading, setActionLoading] = useState(false)

  const closeConfirm = () => setConfirmDialog(CLOSED_CONFIRM)

  const doUnpublish = async (tool: Tool) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: false }),
      })
      if (!res.ok) throw new Error('Failed to unpublish')
      toast({ title: `"${tool.name}" unpublished` })
      closeConfirm()
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const doDelete = async (tool: Tool) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: `"${tool.name}" deleted` })
      closeConfirm()
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-16 text-center text-slate-400">
          No tools yet.{' '}
          <Link href="/admin/tools/new" className="text-blue-600 hover:underline">
            Add the first one.
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
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
            {tools.map((tool) => {
              const isLoading = pendingId === tool.id
              return (
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
                    <div className="flex items-center justify-end gap-1">
                      <AdminTooltip label="View on public site">
                        <Link href={`/tools/${tool.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-600">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </AdminTooltip>

                      <AdminTooltip label="Edit tool">
                        <Link href={`/admin/tools/${tool.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-700">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </AdminTooltip>

                      {tool.is_published && (
                        <AdminTooltip label="Unpublish tool">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                title: 'Unpublish Tool',
                                description: `"${tool.name}" will be removed from the public comparison table immediately. You can re-publish it at any time.`,
                                confirmLabel: 'Unpublish',
                                variant: 'warning',
                                onConfirm: () => doUnpublish(tool),
                              })
                            }
                            disabled={isLoading}
                            className="h-7 px-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </AdminTooltip>
                      )}

                      <AdminTooltip label="Delete tool">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              title: 'Delete Tool',
                              description: `"${tool.name}" will be permanently deleted and removed from the public site. This cannot be undone.`,
                              confirmLabel: 'Delete Tool',
                              variant: 'danger',
                              onConfirm: () => doDelete(tool),
                            })
                          }
                          disabled={isLoading}
                          className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </AdminTooltip>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        loading={actionLoading}
      />
    </>
  )
}
