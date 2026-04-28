'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTooltip from '@/components/admin/AdminTooltip'
import { toast } from '@/lib/use-toast'

interface FaqItem {
  id: string
  question: string
  answer: string
  display_order: number
  is_published: boolean
}

type ConfirmState = {
  open: boolean
  id: string
  question: string
}
const CLOSED_CONFIRM: ConfirmState = { open: false, id: '', question: '' }

interface EditState {
  id: string
  question: string
  answer: string
}

export default function FaqItemsManager() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmState>(CLOSED_CONFIRM)
  const [deleting, setDeleting] = useState(false)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [addingNew, setAddingNew] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faq')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setItems(json.data ?? [])
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Load failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function patchItem(id: string, body: Partial<FaqItem>) {
    const res = await fetch(`/api/admin/faq/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Update failed')
    return json as FaqItem
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const a = items[index]
    const b = items[targetIndex]
    const key = `move-${a.id}`
    setActionLoading(key)
    try {
      await Promise.all([
        patchItem(a.id, { display_order: b.display_order }),
        patchItem(b.id, { display_order: a.display_order }),
      ])
      const next = [...items]
      next[index] = { ...a, display_order: b.display_order }
      next[targetIndex] = { ...b, display_order: a.display_order }
      next.sort((x, y) => x.display_order - y.display_order)
      setItems(next)
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Reorder failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleTogglePublished(item: FaqItem) {
    const key = `toggle-${item.id}`
    setActionLoading(key)
    try {
      const updated = await patchItem(item.id, { is_published: !item.is_published })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_published: updated.is_published } : i))
      toast({ title: updated.is_published ? 'FAQ item published' : 'FAQ item unpublished' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSaveEdit() {
    if (!editState) return
    setSavingEdit(true)
    try {
      const updated = await patchItem(editState.id, {
        question: editState.question,
        answer: editState.answer,
      })
      setItems((prev) => prev.map((i) => i.id === editState.id ? { ...i, question: updated.question, answer: updated.answer } : i))
      setEditState(null)
      toast({ title: 'FAQ item updated' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/faq/${confirmDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id))
      setConfirmDelete(CLOSED_CONFIRM)
      toast({ title: 'FAQ item deleted' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setDeleting(false)
    }
  }

  async function handleAddNew() {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ variant: 'destructive', title: 'Question and answer are required' })
      return
    }
    setAddingNew(true)
    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Create failed')
      setItems((prev) => [...prev, json])
      setNewQuestion('')
      setNewAnswer('')
      setShowAddForm(false)
      toast({ title: 'FAQ item added' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Create failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setAddingNew(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading FAQ items…</span>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-slate-900">FAQ Items</h2>
          <p className="text-xs text-slate-500 mt-0.5">{items.length} items · drag arrows to reorder</p>
        </div>
        <Button
          size="sm"
          onClick={() => { setShowAddForm(true); setNewQuestion(''); setNewAnswer('') }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isEditing = editState?.id === item.id
          const moveKey = `move-${item.id}`
          const toggleKey = `toggle-${item.id}`

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                item.is_published ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={editState.question}
                      onChange={(e) => setEditState((s) => s ? { ...s, question: e.target.value } : s)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Answer</label>
                    <textarea
                      rows={4}
                      value={editState.answer}
                      onChange={(e) => setEditState((s) => s ? { ...s, answer: e.target.value } : s)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditState(null)}
                      disabled={savingEdit}
                      className="gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    >
                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4">
                  {/* Order badge */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-snug">{item.question}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.answer}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <AdminTooltip label="Move up">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0 || actionLoading === moveKey}
                      >
                        {actionLoading === moveKey ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </AdminTooltip>

                    <AdminTooltip label="Move down">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === items.length - 1 || actionLoading === moveKey}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </AdminTooltip>

                    <AdminTooltip label={item.is_published ? 'Unpublish' : 'Publish'}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => handleTogglePublished(item)}
                        disabled={actionLoading === toggleKey}
                      >
                        {actionLoading === toggleKey ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : item.is_published ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </AdminTooltip>

                    <AdminTooltip label="Edit">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => setEditState({ id: item.id, question: item.question, answer: item.answer })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </AdminTooltip>

                    <AdminTooltip label="Delete">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        onClick={() => setConfirmDelete({ open: true, id: item.id, question: item.question })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AdminTooltip>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add new form */}
        {showAddForm && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">New FAQ Item</p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter the question…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Answer</label>
              <textarea
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                disabled={addingNew}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNew}
                disabled={addingNew}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                {addingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {addingNew ? 'Adding…' : 'Add FAQ'}
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 && !showAddForm && (
          <div className="text-center py-10 text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-xl">
            No FAQ items yet. Click &ldquo;Add New FAQ&rdquo; to get started.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && setConfirmDelete(CLOSED_CONFIRM)}
        title="Delete FAQ Item"
        description={`Are you sure you want to delete "${confirmDelete.question}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
