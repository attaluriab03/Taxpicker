'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, ExternalLink, EyeOff, Globe, Trash2, Loader2, User } from 'lucide-react'
import { toast } from '@/lib/use-toast'
import type { Article } from '@/lib/supabase'
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

function articleStatus(article: Article): 'published' | 'scheduled' | 'draft' {
  if (!article.published_at) return 'draft'
  return new Date(article.published_at) <= new Date() ? 'published' : 'scheduled'
}

export default function AdminArticlesTable({ articles: initial }: { articles: Article[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [articles, setArticles] = useState<Article[]>(initial)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>(CLOSED_CONFIRM)
  const [actionLoading, setActionLoading] = useState(false)

  const closeConfirm = () => setConfirmDialog(CLOSED_CONFIRM)

  const publish = async (article: Article) => {
    setPendingId(article.id)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      if (!res.ok) throw new Error('Failed to publish')
      const updated: Article = await res.json()
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)))
      toast({ title: `"${article.title}" published` })
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setPendingId(null)
    }
  }

  const doUnpublish = async (article: Article) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish' }),
      })
      if (!res.ok) throw new Error('Failed to unpublish')
      const updated: Article = await res.json()
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)))
      toast({ title: `"${article.title}" unpublished` })
      closeConfirm()
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const doDelete = async (article: Article) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setArticles((prev) => prev.filter((a) => a.id !== article.id))
      toast({ title: `"${article.title}" deleted` })
      closeConfirm()
      startTransition(() => router.refresh())
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-16 text-center text-slate-400">
          <p>No articles yet.</p>
          <Link href="/admin/articles/new" className="text-blue-600 hover:underline text-sm mt-1 block">
            Write the first one.
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Author</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((article) => {
              const isLoading = pendingId === article.id
              const status = articleStatus(article)
              return (
                <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                  {/* Title */}
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-medium text-slate-900 line-clamp-1">{article.title}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{article.slug}</div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    {status === 'published' && (
                      <Badge variant="success" className="text-xs">Published</Badge>
                    )}
                    {status === 'scheduled' && (
                      <Badge variant="orange" className="text-xs">Scheduled</Badge>
                    )}
                    {status === 'draft' && (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </td>

                  {/* Published date */}
                  <td className="px-4 py-4 text-xs text-slate-600">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : <span className="text-slate-400">Not published</span>
                    }
                  </td>

                  {/* Author */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      {article.author || '—'}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs capitalize">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags?.length > 2 && (
                        <span className="text-xs text-slate-400">+{article.tags.length - 2}</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View live — only shown when published */}
                      {status === 'published' && (
                        <AdminTooltip label="View on public site">
                          <Link href={`/blog/${article.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-600">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </AdminTooltip>
                      )}

                      {/* Edit */}
                      <AdminTooltip label="Edit article">
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-700">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </AdminTooltip>

                      {/* Publish (draft only) */}
                      {status === 'draft' && (
                        <AdminTooltip label="Publish article">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => publish(article)}
                            disabled={isLoading}
                            className="h-7 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </AdminTooltip>
                      )}

                      {/* Unpublish (published or scheduled) */}
                      {status !== 'draft' && (
                        <AdminTooltip label="Unpublish article">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                title: 'Unpublish Article',
                                description: `"${article.title}" will be removed from the public blog immediately. You can re-publish it at any time.`,
                                confirmLabel: 'Unpublish',
                                variant: 'warning',
                                onConfirm: () => doUnpublish(article),
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

                      {/* Delete */}
                      <AdminTooltip label="Delete article">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              title: 'Delete Article',
                              description: `"${article.title}" will be permanently deleted and cannot be recovered. Are you sure?`,
                              confirmLabel: 'Delete Article',
                              variant: 'danger',
                              onConfirm: () => doDelete(article),
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
