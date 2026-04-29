'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface ValidationSummaryProps {
  errors: Record<string, string>
  title?: string
}

export default function ValidationSummary({
  errors,
  title = 'Please fix the following before saving',
}: ValidationSummaryProps) {
  const errorList = Object.values(errors).filter(Boolean)

  useEffect(() => {
    if (errorList.length > 0) {
      document.querySelector('[data-validation-summary]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [errorList.length])

  if (errorList.length === 0) return null

  return (
    <div data-validation-summary className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <p className="text-red-700 font-medium text-sm mb-2 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {title}
      </p>
      <ul className="space-y-1 list-disc list-inside">
        {errorList.map((message, i) => (
          <li key={i} className="text-red-600 text-sm">
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}
