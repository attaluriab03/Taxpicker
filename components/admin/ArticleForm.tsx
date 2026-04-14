'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TagInput from './TagInput'
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

  const set = <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      toast({ variant: 'destructive', title: 'Title is required' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: slugify(form.title),
        content: form.content,
        author: form.author,
        meta_description: form.meta_description,
        og_image_url: form.og_image_url,
        tags: form.tags,
        published_at: publish ? new Date().toISOString() : null,
      }

      const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles'
      const method = articleId ? 'PUT' : 'POST'

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
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Article Details</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Complete Guide to Crypto Taxes in 2026"
            />
            {form.title && (
              <p className="text-xs text-slate-400">Slug: {slugify(form.title)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Input
              id="meta_description"
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
              placeholder="SEO description (150-160 characters)"
              maxLength={160}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="og_image_url">OG Image URL</Label>
              <Input
                id="og_image_url"
                type="url"
                value={form.og_image_url}
                onChange={(e) => set('og_image_url', e.target.value)}
                placeholder="https://..."
              />
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
        <h2 className="text-base font-semibold text-slate-900 mb-2">Content</h2>
        <p className="text-xs text-slate-500 mb-4">Supports Markdown. Use # for H1, ## for H2, - for lists.</p>
        <Textarea
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Write your article content in Markdown..."
          rows={24}
          className="font-mono text-sm"
        />
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
