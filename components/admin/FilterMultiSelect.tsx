'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRAND_BLUE = '#2563EB'

export interface FilterOption {
  value: string
  label: string
}

interface FilterMultiSelectProps {
  label?: string
  value: string[]
  onChange: (values: string[]) => void
  options: FilterOption[]
  hint?: string
  placeholder?: string
}

export default function FilterMultiSelect({
  label,
  value,
  onChange,
  options,
  hint,
  placeholder = 'Select options…',
}: FilterMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  const removeItem = (v: string) => onChange(value.filter((x) => x !== v))

  const allSelected = options.length > 0 && value.length === options.length
  const hasSelection = value.length > 0

  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v

  return (
    <div className="space-y-2">
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-colors',
            hasSelection
              ? 'border-blue-500 ring-1 ring-blue-500/30'
              : 'border-slate-200 hover:border-slate-300'
          )}
        >
          <span className={cn('truncate text-sm', hasSelection ? 'text-slate-900' : 'text-slate-400')}>
            {hasSelection ? `${value.length} selected` : placeholder}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {hasSelection && (
              <span
                className="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
                style={{ backgroundColor: BRAND_BLUE, minWidth: '18px' }}
              >
                {value.length}
              </span>
            )}
            <ChevronDown
              className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')}
            />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Select all */}
            <button
              type="button"
              onClick={() => onChange(allSelected ? [] : options.map((o) => o.value))}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 border-b border-slate-100"
            >
              <span
                className={cn(
                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                  allSelected ? 'border-blue-600' : 'border-slate-300'
                )}
                style={allSelected ? { backgroundColor: BRAND_BLUE } : {}}
              >
                {allSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>
              <span className="font-medium">Select all</span>
            </button>

            {/* Options */}
            <div className="max-h-56 overflow-y-auto py-1">
              {options.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-slate-400 italic">Loading options…</p>
              ) : (
                options.map((opt) => {
                  const checked = value.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors',
                        checked ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                          checked ? 'border-blue-600' : 'border-slate-300'
                        )}
                        style={checked ? { backgroundColor: BRAND_BLUE } : {}}
                      >
                        {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className="leading-tight">{opt.label}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Clear all */}
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 border-t border-slate-100 hover:text-rose-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Selected pills */}
      {hasSelection && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800"
            >
              {labelFor(v)}
              <button
                type="button"
                onClick={() => removeItem(v)}
                className="ml-0.5 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
