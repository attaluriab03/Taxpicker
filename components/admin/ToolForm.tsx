'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TagInput from './TagInput'
import VerificationChecklist from './VerificationChecklist'
import AutoFillButton from './AutoFillButton'
import ConfirmDialog from './ConfirmDialog'
import { toast } from '@/lib/use-toast'
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
  supported_countries: string[]
  supported_exchanges: string[]
  supported_wallets: string[]
  tax_report_types: string[]
  pros: string[]
  cons: string[]
  faqs: Array<{ question: string; answer: string }>
  is_featured: boolean
  is_recommended: boolean
  is_published: boolean
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
    supported_countries: initialData?.supported_countries || [],
    supported_exchanges: initialData?.supported_exchanges || [],
    supported_wallets: initialData?.supported_wallets || [],
    tax_report_types: initialData?.tax_report_types || [],
    pros: initialData?.pros || [],
    cons: initialData?.cons || [],
    faqs: initialData?.faqs || [],
    is_featured: initialData?.is_featured || false,
    is_recommended: initialData?.is_recommended || false,
    is_published: initialData?.is_published || false,
  })

  const set = <K extends keyof ToolFormData>(key: K, value: ToolFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
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

  // ── AutoFill ─────────────────────────────────────────────────────────────
  const handleAutoFill = (data: Partial<ToolFormData>) => {
    setForm((prev) => ({ ...prev, ...data }))
    toast({ title: 'AI Auto-Fill complete', description: 'Review all fields before saving.' })
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = async (publish: boolean) => {
    if (!form.name) {
      toast({ variant: 'destructive', title: 'Name is required' })
      return
    }
    if (!form.affiliate_url) {
      toast({ variant: 'destructive', title: 'Affiliate URL is required' })
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
    <div className="max-w-4xl mx-auto space-y-8">
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
        <h2 className="text-base font-semibold text-slate-900 mb-5">Basic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tool Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. CryptoTaxCalculator"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={form.website_url}
              onChange={(e) => set('website_url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="2-3 sentences describing the tool..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              value={form.logo_url}
              onChange={(e) => set('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-slate-400">Upload to Supabase Storage and paste the public URL</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="affiliate_url">Affiliate URL <span className="text-red-500">*</span></Label>
            <Input
              id="affiliate_url"
              type="url"
              value={form.affiliate_url}
              onChange={(e) => set('affiliate_url', e.target.value)}
              placeholder="https://example.com/?ref=taxpicker"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Pricing Plans</h2>
        <p className="text-sm text-slate-500 mb-5">
          Add any number of pricing tiers. Enter a number for USD/year prices, or text like "Custom" for
          enterprise tiers. Mark one tier as Popular to highlight it on the detail page.
        </p>

        <div className="space-y-4">
          {/* Pricing type + internal notes */}
          <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <Label>Pricing Type</Label>
              <Select
                value={form.pricing_type}
                onValueChange={(v) => set('pricing_type', v as 'free' | 'freemium' | 'paid')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
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
                    onChange={(e) => updateTier(index, 'name', e.target.value)}
                    placeholder="e.g. Free, Starter, Pro, Enterprise"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price</Label>
                  <Input
                    value={tier.price}
                    onChange={(e) => updateTier(index, 'price', e.target.value)}
                    placeholder="49 or Custom"
                  />
                  <p className="text-xs text-slate-400">Number = USD/yr · Text = displayed as-is</p>
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
        </div>
      </section>

      {/* Features & capabilities */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Features &amp; Capabilities</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Features</Label>
            <TagInput
              value={form.features}
              onChange={(v) => set('features', v)}
              placeholder="Type feature and press Enter..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Supported Countries</Label>
              <TagInput
                value={form.supported_countries}
                onChange={(v) => set('supported_countries', v)}
                placeholder="US, UK, Canada..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supported Exchanges</Label>
              <TagInput
                value={form.supported_exchanges}
                onChange={(v) => set('supported_exchanges', v)}
                placeholder="Binance, Coinbase..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supported Wallets</Label>
              <TagInput
                value={form.supported_wallets}
                onChange={(v) => set('supported_wallets', v)}
                placeholder="MetaMask, Ledger..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax Report Types</Label>
              <TagInput
                value={form.tax_report_types}
                onChange={(v) => set('tax_report_types', v)}
                placeholder="Capital Gains, Income..."
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
                <Label>Question</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                  placeholder="e.g. Does this tool support DeFi transactions?"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Answer</Label>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                  placeholder="Enter the answer..."
                  rows={3}
                />
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
