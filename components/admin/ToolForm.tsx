'use client'

import { useState, useTransition } from 'react'
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
import { toast } from '@/lib/use-toast'
import type { Tool } from '@/lib/supabase'
import { Loader2, Save, Send } from 'lucide-react'

type ToolFormData = {
  name: string
  website_url: string
  description: string
  logo_url: string
  affiliate_url: string
  pricing_type: 'free' | 'freemium' | 'paid'
  price_from: string
  pricing_details: string
  features: string[]
  supported_countries: string[]
  supported_exchanges: string[]
  supported_wallets: string[]
  tax_report_types: string[]
  pros: string[]
  cons: string[]
  is_featured: boolean
  is_recommended: boolean
  is_published: boolean
}

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

export default function ToolForm({ initialData, toolId }: ToolFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [verificationPassed, setVerificationPassed] = useState(false)

  const [form, setForm] = useState<ToolFormData>({
    name: initialData?.name || '',
    website_url: initialData?.website_url || '',
    description: initialData?.description || '',
    logo_url: initialData?.logo_url || '',
    affiliate_url: initialData?.affiliate_url || '',
    pricing_type: initialData?.pricing_type || 'freemium',
    price_from: initialData?.price_from?.toString() || '',
    pricing_details: initialData?.pricing_details || '',
    features: initialData?.features || [],
    supported_countries: initialData?.supported_countries || [],
    supported_exchanges: initialData?.supported_exchanges || [],
    supported_wallets: initialData?.supported_wallets || [],
    tax_report_types: initialData?.tax_report_types || [],
    pros: initialData?.pros || [],
    cons: initialData?.cons || [],
    is_featured: initialData?.is_featured || false,
    is_recommended: initialData?.is_recommended || false,
    is_published: initialData?.is_published || false,
  })

  const set = <K extends keyof ToolFormData>(key: K, value: ToolFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAutoFill = (data: Partial<ToolFormData>) => {
    setForm((prev) => ({ ...prev, ...data }))
    toast({ title: 'AI Auto-Fill complete', description: 'Review all fields before saving.' })
  }

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
        price_from: form.price_from ? parseFloat(form.price_from) : null,
        is_published: publish,
        features: form.features,
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
      startTransition(() => router.push('/admin/tools'))
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const isPublishEnabled = verificationPassed && !saving
  const isEditing = !!toolId

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
            <Label htmlFor="website_url">Website URL <span className="text-red-500">*</span></Label>
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
        <h2 className="text-base font-semibold text-slate-900 mb-5">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Pricing Type</Label>
            <Select
              value={form.pricing_type}
              onValueChange={(v) => set('pricing_type', v as 'free' | 'freemium' | 'paid')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_from">Price From (USD/yr)</Label>
            <Input
              id="price_from"
              type="number"
              value={form.price_from}
              onChange={(e) => set('price_from', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <Label htmlFor="pricing_details">Pricing Details</Label>
            <Input
              id="pricing_details"
              value={form.pricing_details}
              onChange={(e) => set('pricing_details', e.target.value)}
              placeholder="Free plan, $49/yr Starter, $99/yr Pro..."
            />
          </div>
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

      {/* Verification checklist */}
      <VerificationChecklist onComplete={setVerificationPassed} />

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/tools')}
          disabled={saving}
        >
          Cancel
        </Button>
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
      </div>
    </div>
  )
}
