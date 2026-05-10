'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TagInput from './TagInput'
import FieldError from './FieldError'
import { toast } from '@/lib/use-toast'
import type { Article } from '@/lib/supabase'
import { Loader2, Save, Send } from 'lucide-react'

type ArticleFormData = {
  title: string
  content: string
  author: string
  meta_description: string
  og_image_url: string
  tags: string[]
  publish: boolean
}

interface ArticleFormProps {
  initialData?: Partial<Article>
  articleId?: string
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

function isValidHttpsUrl(val: string) {
  if (!val) return true
  try {
    const u = new URL(val)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ArticleForm({ initialData, articleId }: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ArticleFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    author: initialData?.author || '',
    meta_description: initialData?.meta_description || '',
    og_image_url: initialData?.og_image_url || '',
    tags: initialData?.tags || [],
    publish: !!initialData?.published_at,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const validate = (publish: boolean): boolean => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.length > 200) errs.title = 'Title must be under 200 characters'
    if (form.author && form.author.length > 100) errs.author = 'Author must be under 100 characters'
    if (form.meta_description && form.meta_description.length > 160)
      errs.meta_description = 'Meta description must be 160 characters or fewer'
    if (form.og_image_url && !isValidHttpsUrl(form.og_image_url))
      errs.og_image_url = 'OG Image URL must be a valid https:// URL'
    if (publish && !form.content.trim()) errs.content = 'Content is required when publishing'
    if (publish && !form.meta_description.trim())
      errs.meta_description = 'Meta description is required for published articles'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const save = async (publish: boolean) => {
    if (!validate(publish)) {
      toast({ variant: 'destructive', title: 'Please fix the errors below' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.title),
        content: form.content,
        author: form.author.trim(),
        meta_description: form.meta_description.trim(),
        og_image_url: form.og_image_url.trim(),
        tags: form.tags,
        published_at: publish ? new Date().toISOString() : null,
      }

      const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles'
      const method = articleId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save article')
      }

      toast({
        title: publish ? 'Article published!' : 'Draft saved',
        description: publish ? `${form.title} is now live.` : `${form.title} saved as draft.`,
      })
      startTransition(() => router.push('/admin/articles'))
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setSaving(false)
    }
  }

  const metaLen = form.meta_description.length
  const metaOverLimit = metaLen > 160

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Article Details</h2>
        <p className="text-xs text-slate-400 mb-5">
          Fields marked <span className="text-red-500">*</span> are required.
          Required fields can be skipped when saving as draft.
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Complete Guide to Crypto Taxes in 2026"
              className={errors.title ? 'border-red-400 focus:ring-red-400' : ''}
            />
            {form.title && !errors.title && (
              <p className="text-xs text-slate-400">Slug: /blog/{slugify(form.title)}</p>
            )}
            <FieldError error={errors.title} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meta_description">
              Meta Description <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-slate-400 ml-1">(required to publish)</span>
            </Label>
            <Input
              id="meta_description"
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
              placeholder="SEO description (150–160 characters ideal)"
              className={errors.meta_description ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <div className="flex items-center justify-between">
              <FieldError error={errors.meta_description} />
              <span className={`text-xs ml-auto ${metaOverLimit ? 'text-red-500 font-medium' : metaLen > 140 ? 'text-amber-500' : 'text-slate-400'}`}>
                {metaLen}/160
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Author name"
                className={errors.author ? 'border-red-400 focus:ring-red-400' : ''}
              />
              <FieldError error={errors.author} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="og_image_url">OG Image URL</Label>
              <Input
                id="og_image_url"
                type="url"
                value={form.og_image_url}
                onChange={(e) => set('og_image_url', e.target.value)}
                onBlur={() => {
                  if (form.og_image_url && !isValidHttpsUrl(form.og_image_url)) {
                    setErrors((prev) => ({ ...prev, og_image_url: 'Must be a valid https:// URL' }))
                  }
                }}
                placeholder="https://..."
                className={errors.og_image_url ? 'border-red-400 focus:ring-red-400' : ''}
              />
              <FieldError error={errors.og_image_url} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput
              value={form.tags}
              onChange={(v) => set('tags', v)}
              placeholder="Add tags: crypto, taxes, defi..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Content</h2>
        <p className="text-xs text-slate-500 mb-4">Supports Markdown. Use # for H1, ## for H2, - for lists.</p>
        <Textarea
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Write your article content in Markdown..."
          rows={24}
          className={`font-mono text-sm ${errors.content ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        <FieldError error={errors.content} />
      </div>

      <div className="flex items-center justify-between gap-4 pb-8">
        <Button variant="outline" onClick={() => router.push('/admin/articles')} disabled={saving}>
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => save(true)} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}
