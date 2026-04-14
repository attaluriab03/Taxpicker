import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import type { Tool } from '@/lib/supabase'
import ToolForm from '@/components/admin/ToolForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getTool(id: string): Promise<Tool | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('tools').select('*').eq('id', id).single()
  return data as Tool | null
}

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tool = await getTool(id)
  if (!tool) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/tools" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit Tool: {tool.name}</h1>
      <p className="text-slate-500 text-sm mb-8">
        {tool.is_published
          ? 'This tool is currently published. Changes will go live immediately on save.'
          : 'This tool is a draft. Complete the verification checklist before publishing.'}
      </p>
      <ToolForm initialData={tool} toolId={tool.id} />
    </div>
  )
}
