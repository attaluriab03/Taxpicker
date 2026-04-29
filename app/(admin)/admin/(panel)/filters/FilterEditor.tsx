'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { Trash2, Plus, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/use-toast'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTooltip from '@/components/admin/AdminTooltip'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  category: string
  value: string
  label: string
  display_order: number
  is_active: boolean
  metadata?: { max?: number } | null
}

interface Category {
  value: string
  label: string
  hint: string
}

interface FilterEditorProps {
  categories: Category[]
}

interface AddForm {
  label: string
  value: string
  order: string
  maxPrice: string  // price_range only
}

export default function FilterEditor({ categories }: FilterEditorProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.value ?? '')
  const [optionsByCategory, setOptionsByCategory] = useState<Record<string, FilterOption[]>>({})
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [newForms, setNewForms] = useState<Record<string, AddForm>>(
    Object.fromEntries(categories.map((c) => [c.value, { label: '', value: '', order: '0', maxPrice: '' }]))
  )
  const [adding, setAdding] = useState<string | null>(null)

  const [confirmDeactivate, setConfirmDeactivate] = useState<{ open: boolean; option: FilterOption | null }>({
    open: false, option: null,
  })
  const [deactivating, setDeactivating] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; option: FilterOption | null }>({
    open: false, option: null,
  })
  const [deleting, setDeleting] = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [optionsRes, usageRes] = await Promise.all([
        fetch('/api/admin/filter-options/manage'),
        fetch('/api/admin/filter-options/manage/usage'),
      ])

      if (!optionsRes.ok) {
        const body = await optionsRes.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load options (HTTP ${optionsRes.status})`)
      }

      const { data: options } = await optionsRes.json()
      const grouped: Record<string, FilterOption[]> = {}
      for (const cat of categories) grouped[cat.value] = []
      for (const opt of options ?? []) {
        if (!grouped[opt.category]) grouped[opt.category] = []
        grouped[opt.category].push(opt)
      }
      setOptionsByCategory(grouped)

      if (usageRes.ok) {
        setUsageCounts((await usageRes.json()) ?? {})
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [categories])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Local state helpers ───────────────────────────────────────────────────────

  const updateOption = (id: string, patch: Partial<FilterOption>) => {
    setOptionsByCategory((prev) => {
      const next = { ...prev }
      for (const cat of Object.keys(next)) {
        next[cat] = next[cat].map((o) => (o.id === id ? { ...o, ...patch } : o))
      }
      return next
    })
  }

  const removeOption = (id: string) => {
    setOptionsByCategory((prev) => {
      const next = { ...prev }
      for (const cat of Object.keys(next)) {
        next[cat] = next[cat].filter((o) => o.id !== id)
      }
      return next
    })
  }

  const setForm = (cat: string, field: keyof AddForm, val: string) => {
    setNewForms((prev) => ({ ...prev, [cat]: { ...prev[cat], [field]: val } }))
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleAdd = async (category: string) => {
    const form = newForms[category]
    if (!form?.label.trim() || !form?.value.trim()) {
      toast({ variant: 'destructive', title: 'Label and Value are required' })
      return
    }

    // Validate Max Price for price_range
    if (category === 'price_range') {
      const n = parseInt(form.maxPrice, 10)
      if (!form.maxPrice || isNaN(n) || n <= 0) {
        toast({ variant: 'destructive', title: 'Max Price must be a positive number' })
        return
      }
    }

    setAdding(category)
    try {
      const body: Record<string, unknown> = {
        category,
        label: form.label.trim(),
        value: form.value.trim(),
        display_order: parseInt(form.order || '0', 10),
      }
      if (category === 'price_range') {
        body.metadata = { max: parseInt(form.maxPrice, 10) }
      }

      const res = await fetch('/api/admin/filter-options/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add option')

      setOptionsByCategory((prev) => ({
        ...prev,
        [category]: [...(prev[category] ?? []), json].sort((a, b) => a.display_order - b.display_order),
      }))
      setNewForms((prev) => ({ ...prev, [category]: { label: '', value: '', order: '0', maxPrice: '' } }))
      toast({ title: 'Option added' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setAdding(null)
    }
  }

  const handleToggleActive = (option: FilterOption) => {
    if (option.is_active) {
      setConfirmDeactivate({ open: true, option })
    } else {
      void patchOption(option.id, { is_active: true })
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!confirmDeactivate.option) return
    setDeactivating(true)
    await patchOption(confirmDeactivate.option.id, { is_active: false })
    setDeactivating(false)
    setConfirmDeactivate({ open: false, option: null })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete.option) return
    setDeleting(true)
    const option = confirmDelete.option
    try {
      const res = await fetch(`/api/admin/filter-options/manage/${option.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete option')
      removeOption(option.id)
      setUsageCounts((prev) => { const next = { ...prev }; delete next[option.value]; return next })
      const affected = json.affected_tools ?? 0
      toast({
        title: 'Option deleted',
        description: affected > 0 ? `Removed from ${affected} tool${affected === 1 ? '' : 's'}.` : undefined,
      })
      startTransition(() => {})
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setDeleting(false)
      setConfirmDelete({ open: false, option: null })
    }
  }

  const patchOption = async (id: string, patch: Partial<FilterOption>) => {
    try {
      const res = await fetch(`/api/admin/filter-options/manage/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update option')
      updateOption(id, json)
      startTransition(() => {})
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : String(err) })
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const activeCategory = categories.find((c) => c.value === activeTab)
  const options = optionsByCategory[activeTab] ?? []
  const form = newForms[activeTab] ?? { label: '', value: '', order: '0', maxPrice: '' }
  const deleteOption = confirmDelete.option
  const deleteCount = deleteOption ? (usageCounts[deleteOption.value] ?? 0) : 0
  const isPriceRange = activeTab === 'price_range'

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200">
        {categories.map((cat) => {
          const total = (optionsByCategory[cat.value] ?? []).length
          const active = (optionsByCategory[cat.value] ?? []).filter((o) => o.is_active).length
          return (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              className={cn(
                'flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === cat.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              {cat.label}
              <span className={cn(
                'ml-1.5 text-xs rounded-full px-1.5 py-0.5',
                activeTab === cat.value ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              )}>
                {loading ? '…' : active}
                {!loading && total !== active && <span className="ml-0.5 opacity-60">/{total}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p-6">
        {/* Hint */}
        {activeCategory && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{activeCategory.hint}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load filter options</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-red-600 underline hover:text-red-800"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && options.length === 0 && (
          <p className="text-sm text-slate-400 py-4 mb-4">No options yet for this category. Add one below.</p>
        )}

        {/* Options table */}
        {!loading && !error && options.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Label</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Value</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-16">Order</th>
                  {isPriceRange && (
                    <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-28">Threshold</th>
                  )}
                  {!isPriceRange && (
                    <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-28">Usage</th>
                  )}
                  <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-24">Status</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {options.map((opt) => {
                  const usedBy = usageCounts[opt.value] ?? 0
                  const threshold = opt.metadata?.max
                  return (
                    <tr key={opt.id} className={cn('transition-colors', !opt.is_active && 'bg-slate-50')}>
                      <td className={cn('px-4 py-3 font-medium', opt.is_active ? 'text-slate-800' : 'text-slate-400')}>
                        {opt.label}
                      </td>
                      <td className={cn('px-4 py-3 font-mono text-xs', opt.is_active ? 'text-slate-500' : 'text-slate-400')}>
                        {opt.value}
                      </td>
                      <td className={cn('px-4 py-3 text-center', opt.is_active ? 'text-slate-500' : 'text-slate-400')}>
                        {opt.display_order}
                      </td>
                      {isPriceRange ? (
                        <td className="px-4 py-3 text-center">
                          {threshold !== undefined && threshold !== null ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              ${threshold}/year
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-center">
                          {usedBy > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {usedBy} tool{usedBy === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {opt.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <AdminTooltip label={opt.is_active ? 'Deactivate (hide from filters)' : 'Reactivate'}>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(opt)}
                              className={cn(
                                'p-1.5 rounded transition-colors',
                                opt.is_active
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                              )}
                            >
                              {opt.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </AdminTooltip>
                          <AdminTooltip label="Permanently delete">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ open: true, option: opt })}
                              className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AdminTooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add option form */}
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Option
          </p>
          <div className={cn('grid gap-3', isPriceRange ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
            <div className="space-y-1">
              <Label className="text-xs">Label <span className="text-red-500">*</span></Label>
              <Input
                value={form.label}
                onChange={(e) => setForm(activeTab, 'label', e.target.value)}
                placeholder="e.g. Under $50/year"
                className="h-9 text-sm"
              />
              <p className="text-xs text-slate-400">Shown in the filter dropdown</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value <span className="text-red-500">*</span></Label>
              <Input
                value={form.value}
                onChange={(e) => setForm(activeTab, 'value', e.target.value)}
                placeholder="e.g. under_50"
                className="h-9 text-sm font-mono"
              />
              <p className="text-xs text-slate-400">Unique key per category</p>
            </div>
            {isPriceRange && (
              <div className="space-y-1">
                <Label className="text-xs">Max Price (USD/year) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={form.maxPrice}
                  onChange={(e) => setForm(activeTab, 'maxPrice', e.target.value)}
                  placeholder="e.g. 50"
                  className="h-9 text-sm"
                  min="1"
                />
                <p className="text-xs text-slate-400">Tools with price_from ≤ this appear in results</p>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Display Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm(activeTab, 'order', e.target.value)}
                className="h-9 text-sm"
                min="0"
              />
              <p className="text-xs text-slate-400">Lower = shown first</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              onClick={() => handleAdd(activeTab)}
              disabled={adding === activeTab || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm"
            >
              {adding === activeTab ? 'Adding…' : 'Add Option'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeactivate.open}
        onOpenChange={(open) => !open && setConfirmDeactivate({ open: false, option: null })}
        title="Deactivate Filter Option"
        description={`Deactivating "${confirmDeactivate.option?.label}" will hide it from all filters immediately. Tools that currently have this option selected will keep their data.`}
        confirmLabel="Deactivate"
        variant="warning"
        onConfirm={handleConfirmDeactivate}
        loading={deactivating}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && setConfirmDelete({ open: false, option: null })}
        title="Permanently Delete Filter Option"
        description={
          deleteCount > 0
            ? `This will permanently delete "${deleteOption?.label}" and remove it from ${deleteCount} tool${deleteCount === 1 ? '' : 's'}. This cannot be undone.`
            : `This will permanently delete "${deleteOption?.label}". This cannot be undone.`
        }
        confirmLabel="Delete Permanently"
        variant="danger"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}
