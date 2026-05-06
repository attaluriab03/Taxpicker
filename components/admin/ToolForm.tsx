'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import TagInput from './TagInput'
import FilterMultiSelect, { type FilterOption } from './FilterMultiSelect'
import VerificationChecklist from './VerificationChecklist'
import AutoFillButton from './AutoFillButton'
import ConfirmDialog from './ConfirmDialog'
import FieldError from './FieldError'
import { toast } from '@/lib/use-toast'
import { isValidPrice } from '@/lib/validation'
import type { Tool } from '@/lib/supabase'
import { Loader2, Save, Send } from 'lucide-react'

type PriceTier = {
  name: string
  price: string
  is_popular: boolean
}

type ToolFormData = {
  name: string
  website_url: string
  description: string
  logo_url: string
  affiliate_url: string
  pricing_type: 'free' | 'freemium' | 'paid'
  pricing_details: string
  pricing_tiers: PriceTier[]
  features: string[]
  supported_regions: string[]
  supported_exchanges: string[]
  supported_wallets: string[]
  tax_report_types: string[]
  trading_volume: string[]
  user_type: string[]
  pros: string[]
  cons: string[]
  faqs: Array<{ question: string; answer: string }>
  is_featured: boolean
  is_recommended: boolean
  is_published: boolean
}

type FilterOptionsMap = {
  region: FilterOption[]
  required_features: FilterOption[]
  supported_exchanges: FilterOption[]
  supported_wallets: FilterOption[]
  tax_report_types: FilterOption[]
  trading_volume: FilterOption[]
  user_type: FilterOption[]
}

type ReviewItem = {
  id: string
  author: string | null
  rating: number
  comment: string | null
  created_at: string
}

type ReviewConfirmState = { open: boolean; id: string; author: string | null }
const CLOSED_REVIEW_CONFIRM: ReviewConfirmState = { open: false, id: '', author: null }

interface ToolFormProps {
  initialData?: Partial<Tool>
  toolId?: string
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 tracking-tight">
      {Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')}
    </span>
  )
}

export default function ToolForm({ initialData, toolId }: ToolFormProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [verificationPassed, setVerificationPassed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [priceRangeOptions, setPriceRangeOptions] = useState<Array<{ value: string; label: string; metadata?: { max?: number } | null }>>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptionsMap>({
    region: [],
    required_features: [],
    supported_exchanges: [],
    supported_wallets: [],
    tax_report_types: [],
    trading_volume: [],
    user_type: [],
  })

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ author: '', rating: '5', comment: '' })
  const [addingReview, setAddingReview] = useState(false)
  const [confirmDeleteReview, setConfirmDeleteReview] = useState<ReviewConfirmState>(CLOSED_REVIEW_CONFIRM)
  const [deletingReview, setDeletingReview] = useState(false)

  const [form, setForm] = useState<ToolFormData>({
    name: initialData?.name || '',
    website_url: initialData?.website_url || '',
    description: initialData?.description || '',
    logo_url: initialData?.logo_url || '',
    affiliate_url: initialData?.affiliate_url || '',
    pricing_type: initialData?.pricing_type || 'freemium',
    pricing_details: initialData?.pricing_details || '',
    pricing_tiers: initialData?.pricing_tiers || [],
    features: initialData?.features || [],
    supported_regions: initialData?.supported_regions || [],
    supported_exchanges: initialData?.supported_exchanges || [],
    supported_wallets: initialData?.supported_wallets || [],
    tax_report_types: initialData?.tax_report_types || [],
    trading_volume: initialData?.trading_volume || [],
    user_type: initialData?.user_type || [],
    pros: initialData?.pros || [],
    cons: initialData?.cons || [],
    faqs: initialData?.faqs || [],
    is_featured: initialData?.is_featured || false,
    is_recommended: initialData?.is_recommended || false,
    is_published: initialData?.is_published || false,
  })

  const set = <K extends keyof ToolFormData>(key: K, value: ToolFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key as string]; return next })
  }

  function isValidHttpsUrl(val: string) {
    if (!val) return true
    try { return new URL(val).protocol === 'https:' } catch { return false }
  }

  function setUrlError(field: string, val: string, label: string) {
    if (val && !isValidHttpsUrl(val)) {
      setFieldErrors((prev) => ({ ...prev, [field]: `${label} must be a valid https:// URL` }))
    }
  }

  function validateForm(publish: boolean): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Tool name is required'
    else if (form.name.length > 100) errs.name = 'Tool name must be under 100 characters'
    if (!form.affiliate_url.trim()) errs.affiliate_url = 'Affiliate URL is required'
    else if (!isValidHttpsUrl(form.affiliate_url)) errs.affiliate_url = 'Affiliate URL must be a valid https:// URL'
    if (form.website_url && !isValidHttpsUrl(form.website_url)) errs.website_url = 'Website URL must be a valid https:// URL'
    if (form.logo_url && !isValidHttpsUrl(form.logo_url)) errs.logo_url = 'Logo URL must be a valid https:// URL'
    if (form.description && form.description.length > 1000) errs.description = 'Description must be under 1000 characters'
    if (form.pricing_details && form.pricing_details.length > 200) errs.pricing_details = 'Pricing notes must be under 200 characters'
    form.pricing_tiers.forEach((tier, i) => {
      if (tier.name && tier.name.length > 50) errs[`tier_name_${i}`] = `Tier ${i + 1} name must be under 50 characters`
      if (tier.price && !isValidPrice(tier.price)) {
        errs[`tier_price_${i}`] = 'Enter a number (e.g. 49), "Free", or "Custom". No letters, symbols, or currency signs allowed.'
      }
    })
    form.faqs.forEach((faq, i) => {
      if (faq.question && faq.question.length > 300) errs[`faq_question_${i}`] = `FAQ ${i + 1} question must be under 300 characters`
      if (faq.answer && faq.answer.length > 1000) errs[`faq_answer_${i}`] = `FAQ ${i + 1} answer must be under 1000 characters`
    })
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Pricing tier helpers ─────────────────────────────────────────────────
  const addTier = () =>
    set('pricing_tiers', [...form.pricing_tiers, { name: '', price: '', is_popular: false }])

  const removeTier = (index: number) =>
    set('pricing_tiers', form.pricing_tiers.filter((_, i) => i !== index))

  const updateTier = (index: number, field: 'name' | 'price', value: string) =>
    set('pricing_tiers', form.pricing_tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)))

  const togglePopular = (index: number) =>
    set('pricing_tiers', form.pricing_tiers.map((t, i) => ({
      ...t,
      is_popular: i === index ? !t.is_popular : false,
    })))

  // ── FAQ helpers ──────────────────────────────────────────────────────────
  const addFaq = () => set('faqs', [...form.faqs, { question: '', answer: '' }])

  const removeFaq = (index: number) =>
    set('faqs', form.faqs.filter((_, i) => i !== index))

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) =>
    set('faqs', form.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)))

  // ── Reviews ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toolId) return
    setReviewsLoading(true)
    fetch(`/api/admin/tools/${toolId}/reviews`)
      .then((r) => r.json())
      .then((json) => setReviews(json.data || []))
      .catch(() => toast({ variant: 'destructive', title: 'Failed to load reviews' }))
      .finally(() => setReviewsLoading(false))
  }, [toolId])

  const handleAddReview = async () => {
    if (!toolId) return
    setAddingReview(true)
    try {
      const res = await fetch(`/api/admin/tools/${toolId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newReview.author.trim() || null,
          rating: Number(newReview.rating),
          comment: newReview.comment.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add review')
      setReviews((prev) => [json, ...prev])
      setNewReview({ author: '', rating: '5', comment: '' })
      toast({ title: 'Review added' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setAddingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!toolId) return
    setDeletingReview(true)
    try {
      const res = await fetch(`/api/admin/tools/${toolId}/reviews/${confirmDeleteReview.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete review')
      setReviews((prev) => prev.filter((r) => r.id !== confirmDeleteReview.id))
      setConfirmDeleteReview(CLOSED_REVIEW_CONFIRM)
      toast({ title: 'Review deleted' })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setDeletingReview(false)
    }
  }

  // ── Load filter options ──────────────────────────────────────────────────
  useEffect(() => {
    const categories = [
      'region',
      'required_features',
      'supported_exchanges',
      'supported_wallets',
      'tax_report_types',
      'trading_volume',
      'user_type',
    ] as const

    Promise.all([
      ...categories.map((cat) =>
        fetch(`/api/admin/filter-options?category=${cat}`)
          .then((r) => r.json())
          .then((json) => ({ cat, data: (json.data || []) as FilterOption[] }))
      ),
      fetch('/api/admin/filter-options?category=price_range')
        .then((r) => r.json())
        .then((json) => ({ cat: 'price_range' as const, data: json.data || [] })),
    ]).then((results) => {
      const map = {} as FilterOptionsMap
      for (const { cat, data } of results) {
        if (cat === 'price_range') {
          setPriceRangeOptions(data)
        } else {
          map[cat as keyof FilterOptionsMap] = data
        }
      }
      setFilterOptions(map)
    })
  }, [])

  // ── AutoFill ─────────────────────────────────────────────────────────────
  const handleAutoFill = (data: Partial<ToolFormData>) => {
    setForm((prev) => ({ ...prev, ...data }))
    toast({ title: 'AI Auto-Fill complete', description: 'Review all fields before saving.' })
  }

  // ── Computed price_from display ──────────────────────────────────────────
  const computedPriceFrom = useMemo(() => {
    if (!form.pricing_tiers || form.pricing_tiers.length === 0) return null
    const numericPrices = form.pricing_tiers
      .map((t) => parseFloat(t.price))
      .filter((p) => !isNaN(p) && p > 0)
    if (numericPrices.length === 0) return 0
    return Math.min(...numericPrices)
  }, [form.pricing_tiers])

  const nextThreshold = useMemo(() => {
    if (computedPriceFrom === null || computedPriceFrom === 0) return null
    const sorted = priceRangeOptions
      .map((o) => o.metadata?.max)
      .filter((n): n is number => n !== undefined && n > computedPriceFrom)
      .sort((a, b) => a - b)
    return sorted[0] ?? null
  }, [computedPriceFrom, priceRangeOptions])

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = async (publish: boolean) => {
    if (!validateForm(publish)) {
      toast({ variant: 'destructive', title: 'Please fix the errors below' })
      document.querySelector('[data-tool-form-top]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: slugify(form.name),
        description: form.description || null,
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        pricing_details: form.pricing_details || null,
        pricing_tiers: form.pricing_tiers,
        // backward compat: price_from = first paid tier's numeric price
        price_from: (() => {
          const first = form.pricing_tiers.find((t) => { const n = parseFloat(t.price); return !isNaN(n) && n > 0 })
          return first ? parseFloat(first.price) : null
        })(),
        faqs: form.faqs,
        supported_regions: form.supported_regions,
        trading_volume: form.trading_volume,
        user_type: form.user_type,
        is_published: publish,
      }

      const url = toolId ? `/api/admin/tools/${toolId}` : '/api/admin/tools'
      const method = toolId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save tool')
      }

      toast({
        variant: 'success' as any,
        title: publish ? 'Tool published!' : 'Draft saved',
        description: publish
          ? `${form.name} is now live on the site.`
          : `${form.name} saved as draft.`,
      })
      router.refresh()
      startTransition(() => {
        router.push('/admin/tools')
      })
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  const isPublishEnabled = verificationPassed && !saving
  const isEditing = !!toolId
  const wasPublished = !!initialData?.is_published

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-tool-form-top>
      {/* AI Auto-Fill */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">AI Auto-Fill</h3>
            <p className="text-xs text-slate-600">
              Enter the tool name and website URL below, then click "AI Auto-Fill" to automatically populate all fields using Claude AI. All fields remain editable.
            </p>
          </div>
          <AutoFillButton
            name={form.name}
            websiteUrl={form.website_url}
            onFill={handleAutoFill}
          />
        </div>
      </div>

      {/* Basic info */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Basic Information</h2>
        <p className="text-xs text-slate-400 mb-5">
          Fields marked <span className="text-red-500">*</span> are required.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tool Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. CryptoTaxCalculator"
              className={fieldErrors.name ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <FieldError error={fieldErrors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={form.website_url}
              onChange={(e) => set('website_url', e.target.value)}
              onBlur={() => setUrlError('website_url', form.website_url, 'Website URL')}
              placeholder="https://example.com"
              className={fieldErrors.website_url ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <FieldError error={fieldErrors.website_url} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="2-3 sentences describing the tool..."
              rows={3}
              className={fieldErrors.description ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <FieldError error={fieldErrors.description} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              value={form.logo_url}
              onChange={(e) => set('logo_url', e.target.value)}
              onBlur={() => setUrlError('logo_url', form.logo_url, 'Logo URL')}
              placeholder="https://example.com/logo.png"
              className={fieldErrors.logo_url ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <p className="text-xs text-slate-400">Upload to Supabase Storage and paste the public URL</p>
            <FieldError error={fieldErrors.logo_url} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="affiliate_url">Affiliate URL <span className="text-red-500">*</span></Label>
            <Input
              id="affiliate_url"
              type="url"
              value={form.affiliate_url}
              onChange={(e) => set('affiliate_url', e.target.value)}
              onBlur={() => setUrlError('affiliate_url', form.affiliate_url, 'Affiliate URL')}
              placeholder="https://example.com/?ref=taxpicker"
              className={fieldErrors.affiliate_url ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <FieldError error={fieldErrors.affiliate_url} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Pricing Plans</h2>
        <p className="text-sm text-slate-500 mb-5">
          Add the pricing tiers for this tool as they appear on the tool's official website. Each tier will be shown as a pricing card on the tool detail page.
        </p>

        <div className="space-y-4">
          {/* Pricing Model — hardcoded radio buttons */}
          <div className="pb-4 border-b border-slate-100 space-y-3">
            <Label>Pricing Model <span className="text-red-500">*</span></Label>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                { value: 'free', label: 'Free', description: 'Tool is completely free to use with no payment required' },
                { value: 'freemium', label: 'Freemium', description: 'Tool has a free tier and paid upgrade options' },
                { value: 'paid', label: 'Paid', description: 'Tool requires payment to use — no meaningful free tier' },
              ] as const).map((opt) => {
                const selected = form.pricing_type === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('pricing_type', opt.value)}
                    className={`text-left p-3 rounded-lg border-2 transition-colors ${
                      selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${selected ? 'text-blue-700' : 'text-slate-800'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 leading-snug">{opt.description}</div>
                  </button>
                )
              })}
            </div>
            <div className="space-y-1.5 mt-2">
              <Label htmlFor="pricing_details">Pricing Notes</Label>
              <Input
                id="pricing_details"
                value={form.pricing_details}
                onChange={(e) => set('pricing_details', e.target.value)}
                placeholder="Internal notes..."
              />
            </div>
          </div>

          {/* Dynamic tier rows */}
          {form.pricing_tiers.map((tier, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tier {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePopular(index)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      tier.is_popular
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-slate-500 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    ★ Popular
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="text-red-400 hover:text-red-600 h-7 px-2"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Plan Name</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => { updateTier(index, 'name', e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n[`tier_name_${index}`]; return n }) }}
                    placeholder="e.g. Free, Starter, Pro, Enterprise"
                    className={fieldErrors[`tier_name_${index}`] ? 'border-red-400 focus:ring-red-400' : ''}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    The plan name shown on the pricing card e.g. Starter, Pro, Premium, Enterprise
                  </p>
                  <FieldError error={fieldErrors[`tier_name_${index}`]} />
                </div>
                <div className="space-y-1">
                  <Label>
                    Price <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={tier.price}
                    onChange={(e) => {
                      const val = e.target.value
                      updateTier(index, 'price', val)
                      if (val && !isValidPrice(val)) {
                        setFieldErrors((p) => ({ ...p, [`tier_price_${index}`]: 'Enter a number (e.g. 49), "Free", or "Custom" only' }))
                      } else {
                        setFieldErrors((p) => { const n = { ...p }; delete n[`tier_price_${index}`]; return n })
                      }
                    }}
                    onBlur={(e) => {
                      let val = e.target.value.trim()
                      if (val === '0') val = 'Free'
                      if (val.toLowerCase() === 'free') val = 'Free'
                      if (val.toLowerCase() === 'custom') val = 'Custom'
                      const num = parseFloat(val)
                      if (!isNaN(num) && val.includes('.')) val = String(parseFloat(val))
                      updateTier(index, 'price', val)
                      if (val && !isValidPrice(val)) {
                        setFieldErrors((p) => ({ ...p, [`tier_price_${index}`]: 'Enter a number (e.g. 49), "Free", or "Custom" only' }))
                      } else {
                        setFieldErrors((p) => { const n = { ...p }; delete n[`tier_price_${index}`]; return n })
                      }
                    }}
                    placeholder="e.g. 49"
                    className={fieldErrors[`tier_price_${index}`] ? 'border-red-400 focus:ring-red-400' : ''}
                  />
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Enter a number only — it will display as "$[number] USD/yr" on the public site. Use <span className="font-medium text-slate-600">Free</span> for free tiers, or <span className="font-medium text-slate-600">Custom</span> for enterprise pricing where the cost varies. Do not include $, USD, /yr, letters, or any other characters — just the number.
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Examples: 49 → "$49 USD/yr" · 0 → "Free" · Free → "Free" · Custom → "Custom"
                  </p>
                  <FieldError error={fieldErrors[`tier_price_${index}`]} />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addTier}
            className="w-full border-dashed"
          >
            + Add Pricing Tier
          </Button>

          {/* Computed price_from display */}
          <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-600">Price Range Filter Value</p>
            <p className="text-sm text-slate-900 mt-1">
              {computedPriceFrom === null
                ? 'No tiers added yet'
                : computedPriceFrom === 0
                ? 'Free (this tool will match any price range filter)'
                : nextThreshold !== null
                ? `$${computedPriceFrom}/year — appears in "Under $${nextThreshold}/year" and higher ranges`
                : `$${computedPriceFrom}/year — above all current price range thresholds`
              }
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Computed from the lowest paid tier price. Used for price range filtering — never shown to visitors.
            </p>
          </div>
        </div>
      </section>

      {/* Features & capabilities */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Features &amp; Capabilities</h2>
        <p className="text-sm text-slate-500 mb-5">
          All selections connect directly to the homepage filters — what you choose here determines which filters this tool appears under.
        </p>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Features</Label>
            <FilterMultiSelect
              value={form.features}
              onChange={(v) => set('features', v)}
              options={filterOptions.required_features}
              hint="Connects to the Required Features filter on the homepage and the Feature Comparison Matrix."
              placeholder="Select features this tool supports…"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Supported Regions</Label>
              <FilterMultiSelect
                value={form.supported_regions}
                onChange={(v) => set('supported_regions', v)}
                options={filterOptions.region}
                hint="Connects to the Region filter on the homepage and Feature Matrix."
                placeholder="Select supported regions…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Trading Volume</Label>
              <FilterMultiSelect
                value={form.trading_volume}
                onChange={(v) => set('trading_volume', v)}
                options={filterOptions.trading_volume}
                hint="Connects to the Trading Volume filter on the homepage."
                placeholder="Select suitable volume ranges…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>User Type</Label>
              <FilterMultiSelect
                value={form.user_type}
                onChange={(v) => set('user_type', v)}
                options={filterOptions.user_type}
                hint="Connects to the User Type filter on the homepage."
                placeholder="Select user types this tool suits…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Supported Exchanges</Label>
              <FilterMultiSelect
                value={form.supported_exchanges}
                onChange={(v) => set('supported_exchanges', v)}
                options={filterOptions.supported_exchanges}
                placeholder="Select exchanges…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Supported Wallets</Label>
              <FilterMultiSelect
                value={form.supported_wallets}
                onChange={(v) => set('supported_wallets', v)}
                options={filterOptions.supported_wallets}
                placeholder="Select wallets…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tax Report Types</Label>
              <FilterMultiSelect
                value={form.tax_report_types}
                onChange={(v) => set('tax_report_types', v)}
                options={filterOptions.tax_report_types}
                placeholder="Select report types…"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pros & Cons */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Pros &amp; Cons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Pros</Label>
            <TagInput
              value={form.pros}
              onChange={(v) => set('pros', v)}
              placeholder="Add a pro..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cons</Label>
            <TagInput
              value={form.cons}
              onChange={(v) => set('cons', v)}
              placeholder="Add a con..."
            />
          </div>
        </div>
      </section>

      {/* Tool FAQs */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Tool FAQs</h2>
        <p className="text-sm text-slate-500 mb-5">
          These appear as an expandable FAQ section on the tool detail page. Add common questions users have about this specific tool.
        </p>

        <div className="space-y-4">
          {form.faqs.map((faq, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">FAQ {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaq(index)}
                  className="text-red-500 hover:text-red-700 h-7 px-2"
                >
                  Remove
                </Button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Question</Label>
                  <span className={`text-xs ${faq.question.length > 300 ? 'text-red-500' : 'text-slate-400'}`}>{faq.question.length}/300</span>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) => { updateFaq(index, 'question', e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n[`faq_question_${index}`]; return n }) }}
                  placeholder="e.g. Does this tool support DeFi transactions?"
                  className={fieldErrors[`faq_question_${index}`] ? 'border-red-400 focus:ring-red-400' : ''}
                />
                <FieldError error={fieldErrors[`faq_question_${index}`]} />
                {faq.question && !faq.question.trim().endsWith('?') && !fieldErrors[`faq_question_${index}`] && (
                  <p className="text-amber-500 text-xs">Tip: Questions typically end with ?</p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Answer</Label>
                  <span className={`text-xs ${faq.answer.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>{faq.answer.length}/1000</span>
                </div>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => { updateFaq(index, 'answer', e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n[`faq_answer_${index}`]; return n }) }}
                  placeholder="Enter the answer..."
                  rows={3}
                  className={fieldErrors[`faq_answer_${index}`] ? 'border-red-400 focus:ring-red-400' : ''}
                />
                <FieldError error={fieldErrors[`faq_answer_${index}`]} />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addFaq}
            className="w-full border-dashed"
          >
            + Add FAQ
          </Button>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Reviews</h2>

        {!isEditing ? (
          <p className="text-sm text-slate-500">
            Save the tool as a draft first, then you can add reviews from the edit page.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Manage user reviews shown on the tool detail page.
            </p>

            {/* Existing reviews */}
            {reviewsLoading ? (
              <div className="flex items-center gap-2 py-4 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading reviews…</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3 mb-6">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-800">
                            {review.author || 'Anonymous'}
                          </span>
                          <Stars rating={review.rating} />
                          <span className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600">{review.comment}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConfirmDeleteReview({ open: true, id: review.id, author: review.author })
                        }
                        className="text-red-400 hover:text-red-600 h-7 px-2 shrink-0"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-6">No reviews yet.</p>
            )}

            {/* Add review form */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Add Review</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Author Name</Label>
                  <Input
                    value={newReview.author}
                    onChange={(e) => setNewReview((p) => ({ ...p, author: e.target.value }))}
                    placeholder="e.g. John D."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <Select
                    value={newReview.rating}
                    onValueChange={(v) => setNewReview((p) => ({ ...p, rating: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">★★★★★ (5)</SelectItem>
                      <SelectItem value="4">★★★★☆ (4)</SelectItem>
                      <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                      <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                      <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Comment</Label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Enter review comment..."
                  rows={3}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddReview}
                disabled={addingReview}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addingReview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {addingReview ? 'Adding…' : 'Add Review'}
              </Button>
            </div>
          </>
        )}
      </section>

      {/* Visibility toggles */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Visibility &amp; Flags</h2>
        <div className="space-y-4">
          {[
            {
              id: 'is_recommended',
              label: 'Is Recommended',
              desc: 'Pins tool to top of all listings with a "Recommended" badge',
              key: 'is_recommended' as const,
            },
            {
              id: 'is_featured',
              label: 'Is Featured',
              desc: 'Highlights the tool visually in listings',
              key: 'is_featured' as const,
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <Switch
                checked={form[item.key]}
                onCheckedChange={(v) => set(item.key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Verification checklist — only required when publishing for the first time */}
      {!wasPublished && <VerificationChecklist onComplete={setVerificationPassed} />}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/tools')}
          disabled={saving}
        >
          Cancel
        </Button>

        {wasPublished ? (
          /* Published tool — save without re-verification */
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => save(false)}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Unpublish &amp; Save as Draft
            </Button>
            <Button
              onClick={() => save(true)}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        ) : (
          /* Draft — require checklist to publish */
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => save(false)}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save as Draft
            </Button>
            <Button
              onClick={() => save(true)}
              disabled={!isPublishEnabled || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              title={!verificationPassed ? 'Complete the verification checklist to publish' : ''}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Publish
            </Button>
          </div>
        )}
      </div>

      {/* Review delete confirmation */}
      <ConfirmDialog
        open={confirmDeleteReview.open}
        onOpenChange={(open) => !open && setConfirmDeleteReview(CLOSED_REVIEW_CONFIRM)}
        title="Delete Review"
        description={`Delete review by "${confirmDeleteReview.author || 'Anonymous'}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteReview}
        loading={deletingReview}
      />
    </div>
  )
}
