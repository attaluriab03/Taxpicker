export const dynamic = 'force-dynamic'

import { createSupabaseServer } from '@/lib/supabase-server'
import type { Tool } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import AdminToolsPageTable from '@/components/admin/AdminToolsPageTable'

async function getTools(): Promise<Tool[]> {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Tool[]) || []
}

export default async function AdminToolsPage() {
  const tools = await getTools()
  const published = tools.filter((t) => t.is_published)
  const drafts = tools.filter((t) => !t.is_published)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools</h1>
          <p className="text-slate-500 text-sm mt-1">
            {published.length} published · {drafts.length} draft
          </p>
        </div>
        <Link href="/admin/tools/new">
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Add New Tool
          </Button>
        </Link>
      </div>

      {drafts.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-amber-800">
          <span className="font-semibold">{drafts.length} draft{drafts.length !== 1 ? 's' : ''} pending review.</span>
          Review and publish them when ready.
        </div>
      )}

      <AdminToolsPageTable tools={tools} />
    </div>
  )
}
