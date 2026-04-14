'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'

const CHECKLIST_ITEMS = [
  { id: 'pricing', label: 'Pricing verified against official website' },
  { id: 'countries', label: 'Supported countries confirmed' },
  { id: 'features', label: 'Features list confirmed' },
  { id: 'affiliate', label: 'Affiliate link tested and working' },
  { id: 'logo', label: 'Logo is official brand asset' },
  { id: 'description', label: 'Description reviewed for accuracy' },
]

interface VerificationChecklistProps {
  onComplete: (allChecked: boolean) => void
}

export default function VerificationChecklist({ onComplete }: VerificationChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string, val: boolean) => {
    const next = { ...checked, [id]: val }
    setChecked(next)
    const allChecked = CHECKLIST_ITEMS.every((item) => next[item.id])
    onComplete(allChecked)
  }

  const checkedCount = Object.values(checked).filter(Boolean).length
  const total = CHECKLIST_ITEMS.length

  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Verification Checklist</h3>
        </div>
        <span className="text-xs text-slate-500">
          {checkedCount}/{total} checked
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        All items must be verified before publishing. This checklist resets on each visit to enforce re-verification after any edits.
      </p>
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Checkbox
              id={item.id}
              checked={!!checked[item.id]}
              onCheckedChange={(val) => toggle(item.id, !!val)}
            />
            <Label
              htmlFor={item.id}
              className="text-sm text-slate-700 cursor-pointer leading-tight"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
      {checkedCount === total && (
        <div className="mt-4 text-xs font-medium text-green-700 bg-green-50 rounded-lg px-3 py-2">
          All items verified — you can now publish this tool.
        </div>
      )}
    </div>
  )
}
