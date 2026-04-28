'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/use-toast'

export interface ContentField {
  section: string
  key: string
  label: string
  hint?: string
  type: 'text' | 'textarea' | 'richtext'
}

export interface ContentSection {
  title: string
  description?: string
  fields: ContentField[]
}

interface Props {
  page: string
  sections: ContentSection[]
}

export default function ContentEditor({ page, sections }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [savedValues, setSavedValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/content/${page}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load')
        const map: Record<string, string> = {}
        for (const row of json.data ?? []) {
          map[`${row.section}.${row.key}`] = row.value ?? ''
        }
        setValues(map)
        setSavedValues(map)
      } catch (err: unknown) {
        toast({ variant: 'destructive', title: 'Load failed', description: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  const isDirty = Object.keys({ ...values, ...savedValues }).some(
    (k) => (values[k] ?? '') !== (savedValues[k] ?? '')
  )

  const setValue = useCallback((sk: string, val: string) => {
    setValues((prev) => ({ ...prev, [sk]: val }))
  }, [])

  const handleDiscard = useCallback(() => {
    setValues(savedValues)
  }, [savedValues])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updates = sections.flatMap((s) =>
        s.fields.map((f) => ({
          section: f.section,
          key: f.key,
          value: values[`${f.section}.${f.key}`] ?? '',
        }))
      )
      const res = await fetch(`/api/admin/content/${page}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      setSavedValues({ ...values })
      toast({ title: 'Changes saved' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }, [page, sections, values])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading content…</span>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-900 text-sm">{section.title}</h2>
              {section.description && (
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
              )}
            </div>
            <div className="px-5 py-4 space-y-5">
              {section.fields.map((field) => {
                const sk = `${field.section}.${field.key}`
                const val = values[sk] ?? ''
                return (
                  <div key={sk}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    {field.hint && (
                      <p className="text-xs text-slate-400 mb-1.5">{field.hint}</p>
                    )}
                    {field.type === 'text' ? (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setValue(sk, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={val}
                        onChange={(e) => setValue(sk, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-y"
                      />
                    ) : (
                      <textarea
                        rows={14}
                        value={val}
                        onChange={(e) => setValue(sk, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-y"
                        placeholder="Markdown supported…"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky save bar */}
      <div
        className={`fixed bottom-0 left-56 right-0 z-40 transition-transform duration-200 ${
          isDirty ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white border-t border-slate-200 shadow-lg px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">You have unsaved changes.</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={saving}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
