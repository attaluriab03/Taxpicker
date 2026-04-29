'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { Trash2, Plus, Eye, EyeOff, AlertTriangle, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/use-toast'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTooltip from '@/components/admin/AdminTooltip'
import FieldError from '@/components/admin/FieldError'
import { cn } from '@/lib/utils'
import { lookupCountry, isValidRegionCode } from '@/lib/countries'

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
  labelExample: string
  valueExample: string
}

interface FilterEditorProps {
  categories: Category[]
}

interface AddForm {
  label: string
  value: string
  order: string
  maxPrice: string
}

interface EditState {
  id: string
  label: string
  value: string
  order: string
  maxPrice: string
  category: string
}

const COLLAPSE_THRESHOLD = 10

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
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({})
  const [formErrors, setFormErrors] = useState<Record<string, Record<string, string>>>({})

  const [editState, setEditState] = useState<EditState | null>(null)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [savingEdit, setSavingEdit] = useState(false)

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
      if (usageRes.ok) setUsageCounts((await usageRes.json()) ?? {})
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [categories])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Helpers ───────────────────────────────────────────────────────────────────

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

  function autoValue(label: string): string {
    return label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '').slice(0, 50)
  }

  function clearFormError(cat: string, field: string) {
    setFormErrors((prev) => {
      const next = { ...prev, [cat]: { ...(prev[cat] ?? {}) } }
      delete next[cat][field]
      return next
    })
  }

  function getFormError(cat: string, field: string): string | undefined {
    return formErrors[cat]?.[field]
  }

  // ── Add form state ────────────────────────────────────────────────────────────

  const setForm = (cat: string, field: keyof AddForm, val: string, skipAutoValue = false) => {
    setNewForms((prev) => {
      const updated: AddForm = { ...prev[cat], [field]: val }
      if (cat === 'region') {
        // For region tab: value is the ISO code, label always syncs from lookup
        if (field === 'value') {
          updated.label = lookupCountry(val) ?? ''
        }
      } else if (field === 'label' && !skipAutoValue && cat !== 'price_range') {
        updated.value = autoValue(val)
      }
      return { ...prev, [cat]: updated }
    })
    clearFormError(cat, field)
  }

  // ── Add validation ────────────────────────────────────────────────────────────

  function validateAddForm(category: string): Record<string, string> {
    const form = newForms[category]
    const errs: Record<string, string> = {}

    if (category === 'price_range') {
      const n = parseInt(form.maxPrice, 10)
      if (!form.maxPrice) errs.maxPrice = 'Max price is required'
      else if (isNaN(n)) errs.maxPrice = 'Max price must be a whole number'
      else if (n <= 0) errs.maxPrice = 'Max price must be greater than $0'
      else if (n > 100000) errs.maxPrice = 'Max price seems too high — please check the value'
      else if ((optionsByCategory[category] ?? []).some((o) => o.value === `under_${n}`))
        errs.maxPrice = `"Under $${n}/year" already exists`
    } else if (category === 'region') {
      const code = form.value.trim().toUpperCase()
      if (!code) errs.value = 'Country/region code is required'
      else if (!isValidRegionCode(code)) errs.value = `"${code}" is not a recognised country or region code`
      if (!form.label.trim()) errs.label = 'Country name is required'
      if ((optionsByCategory[category] ?? []).some(
        (o) => o.value.toUpperCase() === code
      )) errs.value = `"${code}" already exists in Regions`
    } else {
      if (!form.label.trim()) errs.label = 'Label is required'
      else if (form.label.length > 100) errs.label = 'Label must be under 100 characters'
      if (!form.value.trim()) errs.value = 'Value is required'
      else if (form.value.length > 50) errs.value = 'Value must be under 50 characters'
      else if ((optionsByCategory[category] ?? []).some(
        (o) => o.value.toLowerCase() === form.value.trim().toLowerCase()
      )) errs.value = `"${form.value.trim()}" already exists in this category`
      if (form.order && isNaN(parseInt(form.order, 10))) errs.order = 'Display order must be a whole number'
    }

    return errs
  }

  // ── Edit validation ───────────────────────────────────────────────────────────

  function validateEditForm(state: EditState): Record<string, string> {
    const errs: Record<string, string> = {}
    const category = state.category
    const othersInCat = (optionsByCategory[category] ?? []).filter((o) => o.id !== state.id)

    if (category === 'price_range') {
      const n = parseInt(state.maxPrice, 10)
      if (!state.maxPrice) errs.maxPrice = 'Max price is required'
      else if (isNaN(n)) errs.maxPrice = 'Max price must be a whole number'
      else if (n <= 0) errs.maxPrice = 'Max price must be greater than $0'
      else if (n > 100000) errs.maxPrice = 'Max price seems too high — please check the value'
      else if (othersInCat.some((o) => o.value === `under_${n}`))
        errs.maxPrice = `"Under $${n}/year" already exists`
    } else if (category === 'region') {
      const code = state.value.trim().toUpperCase()
      if (!code) errs.value = 'Country/region code is required'
      else if (!isValidRegionCode(code)) errs.value = `"${code}" is not a recognised country or region code`
      if (!state.label.trim()) errs.label = 'Country name is required'
      if (othersInCat.some((o) => o.value.toUpperCase() === code))
        errs.value = `"${code}" already exists in Regions`
    } else {
      if (!state.label.trim()) errs.label = 'Label is required'
      else if (state.label.length > 100) errs.label = 'Label must be under 100 characters'
      if (!state.value.trim()) errs.value = 'Value is required'
      else if (state.value.length > 50) errs.value = 'Value must be under 50 characters'
      else if (othersInCat.some((o) => o.value.toLowerCase() === state.value.trim().toLowerCase()))
        errs.value = `"${state.value.trim()}" already exists in this category`
      if (state.order && isNaN(parseInt(state.order, 10))) errs.order = 'Display order must be a whole number'
    }

    return errs
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleAdd = async (category: string) => {
    const errs = validateAddForm(category)
    if (Object.keys(errs).length > 0) {
      setFormErrors((prev) => ({ ...prev, [category]: errs }))
      return
    }
    setFormErrors((prev) => ({ ...prev, [category]: {} }))

    const form = newForms[category]
    setAdding(category)
    try {
      let label = form.label.trim()
      let value = form.value.trim()
      const body: Record<string, unknown> = { category, display_order: parseInt(form.order || '0', 10) }

      if (category === 'price_range') {
        const n = parseInt(form.maxPrice, 10)
        label = `Under $${n.toLocaleString()}/year`
        value = `under_${n}`
        body.metadata = { max: n }
        body.display_order = n
      } else if (category === 'region') {
        value = value.toUpperCase()
        label = lookupCountry(value) ?? label
      }

      body.label = label
      body.value = value

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

  const openEdit = (opt: FilterOption) => {
    setEditState({
      id: opt.id,
      category: opt.category,
      label: opt.label,
      value: opt.value,
      order: String(opt.display_order),
      maxPrice: opt.metadata?.max !== undefined ? String(opt.metadata.max) : '',
    })
    setEditErrors({})
  }

  const handleSaveEdit = async () => {
    if (!editState) return
    const errs = validateEditForm(editState)
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return }
    setEditErrors({})
    setSavingEdit(true)
    try {
      const category = editState.category
      let label = editState.label.trim()
      let value = editState.value.trim()
      const body: Record<string, unknown> = { display_order: parseInt(editState.order || '0', 10) }

      if (category === 'price_range') {
        const n = parseInt(editState.maxPrice, 10)
        label = `Under $${n.toLocaleString()}/year`
        value = `under_${n}`
        body.metadata = { max: n }
        body.display_order = n
      } else if (category === 'region') {
        value = value.toUpperCase()
        label = lookupCountry(value) ?? label
      }

      body.label = label
      body.value = value

      const res = await fetch(`/api/admin/filter-options/manage/${editState.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update option')
      updateOption(editState.id, json)
      setEditState(null)
      toast({ title: 'Option updated' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setSavingEdit(false)
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
  const isExpanded = expandedTabs[activeTab] ?? false
  const isCollapsible = options.length > COLLAPSE_THRESHOLD
  const visibleOptions = isCollapsible && !isExpanded ? options.slice(0, COLLAPSE_THRESHOLD) : options
  const hiddenCount = options.length - COLLAPSE_THRESHOLD
  const form = newForms[activeTab] ?? { label: '', value: '', order: '0', maxPrice: '' }
  const deleteOption = confirmDelete.option
  const deleteCount = deleteOption ? (usageCounts[deleteOption.value] ?? 0) : 0
  const isPriceRange = activeTab === 'price_range'
  const isRegion = activeTab === 'region'

  // Live region lookup preview for add form
  const regionPreview = isRegion && form.value
    ? lookupCountry(form.value.trim())
    : undefined

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
                  {isPriceRange ? (
                    <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-28">Threshold</th>
                  ) : (
                    <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-28">Usage</th>
                  )}
                  <th className="text-center px-4 py-2.5 font-semibold text-slate-600 w-24">Status</th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleOptions.map((opt) => {
                  const isEditing = editState?.id === opt.id
                  const usedBy = usageCounts[opt.value] ?? 0
                  const threshold = opt.metadata?.max

                  if (isEditing && editState) {
                    return (
                      <tr key={opt.id} className="bg-blue-50/40">
                        <td colSpan={6} className="px-4 py-3">
                          {/* Inline edit form */}
                          {editState.category === 'price_range' ? (
                            <div className="flex flex-wrap items-end gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Max Price (USD/year) <span className="text-red-500">*</span></Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-sm">Under $</span>
                                  <Input
                                    type="number"
                                    value={editState.maxPrice}
                                    onChange={(e) => { setEditState((s) => s ? { ...s, maxPrice: e.target.value } : s); setEditErrors((p) => { const n = { ...p }; delete n.maxPrice; return n }) }}
                                    className={cn('h-8 text-sm w-28', editErrors.maxPrice ? 'border-red-400' : '')}
                                    min="1" max="100000"
                                  />
                                  <span className="text-slate-500 text-sm">/year</span>
                                </div>
                                <FieldError error={editErrors.maxPrice} />
                              </div>
                              <EditActions onSave={handleSaveEdit} onCancel={() => { setEditState(null); setEditErrors({}) }} saving={savingEdit} />
                            </div>
                          ) : editState.category === 'region' ? (
                            <div className="flex flex-wrap items-end gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">ISO Code <span className="text-red-500">*</span></Label>
                                <Input
                                  value={editState.value}
                                  onChange={(e) => {
                                    const code = e.target.value.toUpperCase()
                                    setEditState((s) => s ? { ...s, value: code, label: lookupCountry(code) ?? '' } : s)
                                    setEditErrors((p) => { const n = { ...p }; delete n.value; return n })
                                  }}
                                  placeholder="e.g. JP"
                                  className={cn('h-8 text-sm font-mono w-24', editErrors.value ? 'border-red-400' : '')}
                                />
                                <FieldError error={editErrors.value} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Country Name <span className="text-red-500">*</span></Label>
                                <Input
                                  value={editState.label}
                                  onChange={(e) => { setEditState((s) => s ? { ...s, label: e.target.value } : s); setEditErrors((p) => { const n = { ...p }; delete n.label; return n }) }}
                                  className={cn('h-8 text-sm w-48', editErrors.label ? 'border-red-400' : '')}
                                />
                                <FieldError error={editErrors.label} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Order</Label>
                                <Input
                                  type="number"
                                  value={editState.order}
                                  onChange={(e) => setEditState((s) => s ? { ...s, order: e.target.value } : s)}
                                  className="h-8 text-sm w-20"
                                  min="0"
                                />
                              </div>
                              <EditActions onSave={handleSaveEdit} onCancel={() => { setEditState(null); setEditErrors({}) }} saving={savingEdit} />
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-end gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Label <span className="text-red-500">*</span></Label>
                                <Input
                                  value={editState.label}
                                  onChange={(e) => { setEditState((s) => s ? { ...s, label: e.target.value } : s); setEditErrors((p) => { const n = { ...p }; delete n.label; return n }) }}
                                  className={cn('h-8 text-sm w-48', editErrors.label ? 'border-red-400' : '')}
                                />
                                <FieldError error={editErrors.label} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Value <span className="text-red-500">*</span></Label>
                                <Input
                                  value={editState.value}
                                  onChange={(e) => { setEditState((s) => s ? { ...s, value: e.target.value } : s); setEditErrors((p) => { const n = { ...p }; delete n.value; return n }) }}
                                  className={cn('h-8 text-sm font-mono w-40', editErrors.value ? 'border-red-400' : '')}
                                />
                                <FieldError error={editErrors.value} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Order</Label>
                                <Input
                                  type="number"
                                  value={editState.order}
                                  onChange={(e) => setEditState((s) => s ? { ...s, order: e.target.value } : s)}
                                  className="h-8 text-sm w-20"
                                  min="0"
                                />
                              </div>
                              <EditActions onSave={handleSaveEdit} onCancel={() => { setEditState(null); setEditErrors({}) }} saving={savingEdit} />
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  }

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
                          <AdminTooltip label="Edit">
                            <button
                              type="button"
                              onClick={() => openEdit(opt)}
                              className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </AdminTooltip>
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

                {isCollapsible && (
                  <tr>
                    <td colSpan={6} className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedTabs((prev) => ({ ...prev, [activeTab]: !isExpanded }))}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isExpanded ? 'Show fewer' : `Show ${hiddenCount} more…`}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add option form */}
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Option
          </p>

          {isPriceRange ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Max Price (USD/year) <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm flex-shrink-0">Under $</span>
                  <Input
                    type="number"
                    value={form.maxPrice}
                    onChange={(e) => setForm(activeTab, 'maxPrice', e.target.value)}
                    placeholder="e.g. 50"
                    className={cn('h-9 text-sm w-32', getFormError(activeTab, 'maxPrice') ? 'border-red-400 focus:ring-red-400' : '')}
                    min="1" max="100000" step="1"
                  />
                  <span className="text-slate-500 text-sm flex-shrink-0">/year</span>
                </div>
                <FieldError error={getFormError(activeTab, 'maxPrice')} />
                {form.maxPrice && !isNaN(parseInt(form.maxPrice, 10)) && parseInt(form.maxPrice, 10) > 0 && !getFormError(activeTab, 'maxPrice') && (
                  <p className="text-xs text-slate-500 mt-1">
                    Will be added as: <span className="font-medium text-slate-700">"Under ${parseInt(form.maxPrice, 10).toLocaleString()}/year"</span>
                  </p>
                )}
                <p className="text-xs text-slate-400">Tools with a starting price at or below this amount will match this filter.</p>
              </div>
            </div>
          ) : isRegion ? (
            /* Region tab: ISO code first, country name auto-fills */
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ISO Country Code <span className="text-red-500">*</span></Label>
                <Input
                  value={form.value}
                  onChange={(e) => setForm(activeTab, 'value', e.target.value.toUpperCase(), true)}
                  placeholder="e.g. JP"
                  className={cn('h-9 text-sm font-mono uppercase', getFormError(activeTab, 'value') ? 'border-red-400 focus:ring-red-400' : '')}
                  maxLength={6}
                />
                <FieldError error={getFormError(activeTab, 'value')} />
                {regionPreview && !getFormError(activeTab, 'value') && (
                  <p className="text-xs text-emerald-600 font-medium">✓ {regionPreview}</p>
                )}
                {form.value && !regionPreview && !getFormError(activeTab, 'value') && (
                  <p className="text-xs text-slate-400">Enter a valid ISO 3166-1 alpha-2 code (e.g. US, GB, JP) or broad region (e.g. EU, APAC)</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Country / Region Name <span className="text-red-500">*</span></Label>
                <Input
                  value={form.label}
                  onChange={(e) => { setNewForms((p) => ({ ...p, [activeTab]: { ...p[activeTab], label: e.target.value } })); clearFormError(activeTab, 'label') }}
                  placeholder="Auto-filled from code"
                  className={cn('h-9 text-sm', getFormError(activeTab, 'label') ? 'border-red-400 focus:ring-red-400' : '')}
                />
                <FieldError error={getFormError(activeTab, 'label')} />
                {!getFormError(activeTab, 'label') && <p className="text-xs text-slate-400">Auto-filled from the ISO code lookup</p>}
              </div>
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
          ) : (
            /* All other categories */
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Label <span className="text-red-500">*</span></Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm(activeTab, 'label', e.target.value)}
                  placeholder={activeCategory ? `e.g. ${activeCategory.labelExample}` : ''}
                  className={cn('h-9 text-sm', getFormError(activeTab, 'label') ? 'border-red-400 focus:ring-red-400' : '')}
                />
                <FieldError error={getFormError(activeTab, 'label')} />
                {!getFormError(activeTab, 'label') && <p className="text-xs text-slate-400">Shown in the filter dropdown</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value <span className="text-red-500">*</span></Label>
                <Input
                  value={form.value}
                  onChange={(e) => setForm(activeTab, 'value', e.target.value, true)}
                  placeholder={activeCategory ? `e.g. ${activeCategory.valueExample}` : ''}
                  className={cn('h-9 text-sm font-mono', getFormError(activeTab, 'value') ? 'border-red-400 focus:ring-red-400' : '')}
                />
                <FieldError error={getFormError(activeTab, 'value')} />
                {!getFormError(activeTab, 'value') && <p className="text-xs text-slate-400">Auto-generated from label. Edit if needed.</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Display Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm(activeTab, 'order', e.target.value)}
                  className={cn('h-9 text-sm', getFormError(activeTab, 'order') ? 'border-red-400 focus:ring-red-400' : '')}
                  min="0"
                />
                <FieldError error={getFormError(activeTab, 'order')} />
                {!getFormError(activeTab, 'order') && <p className="text-xs text-slate-400">Lower = shown first</p>}
              </div>
            </div>
          )}

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

function EditActions({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="flex items-center gap-2 pb-0.5">
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 gap-1.5"
      >
        {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        {saving ? 'Saving…' : 'Save'}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={saving}
        className="h-8 px-3 gap-1.5"
      >
        <X className="h-3.5 w-3.5" />
        Cancel
      </Button>
    </div>
  )
}
