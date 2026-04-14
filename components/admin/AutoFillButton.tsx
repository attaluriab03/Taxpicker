'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AutoFillResult } from '@/lib/anthropic'

type AutoFillFormData = Omit<AutoFillResult, 'price_from'> & { price_from: string }

interface AutoFillButtonProps {
  name: string
  websiteUrl: string
  onFill: (data: Partial<AutoFillFormData>) => void
}

export default function AutoFillButton({ name, websiteUrl, onFill }: AutoFillButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAutoFill = async () => {
    if (!name.trim()) {
      setError('Please enter the tool name first.')
      return
    }
    if (!websiteUrl.trim()) {
      setError('Please enter the website URL first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/autofill-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, websiteUrl }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Auto-fill failed')
      }

      const data: AutoFillResult = await res.json()

      onFill({
        description: data.description,
        pricing_type: data.pricing_type,
        price_from: (data.price_from ?? 0).toString(),
        pricing_details: data.pricing_details,
        features: data.features,
        supported_countries: data.supported_countries,
        supported_exchanges: data.supported_exchanges,
        supported_wallets: data.supported_wallets,
        tax_report_types: data.tax_report_types,
        pros: data.pros,
        cons: data.cons,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to auto-fill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        onClick={handleAutoFill}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            AI Auto-Fill
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 max-w-[200px] text-right">{error}</p>
      )}
    </div>
  )
}
