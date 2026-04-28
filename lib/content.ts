import { createSupabaseServer } from '@/lib/supabase-server'

// Fetch all content for a specific page.
// Returns a flat key-value object keyed by "section.key".
export async function getPageContent(
  page: string
): Promise<Record<string, string>> {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('site_content')
    .select('key, value, section')
    .eq('page', page)

  if (!data) return {}

  return data.reduce((acc, row) => {
    acc[`${row.section}.${row.key}`] = row.value
    return acc
  }, {} as Record<string, string>)
}

// Get a single content value with fallback.
export function getContent(
  content: Record<string, string>,
  sectionKey: string,
  fallback: string = ''
): string {
  return content[sectionKey] ?? fallback
}

// Update a single content value via upsert.
export async function updateContent(
  page: string,
  section: string,
  key: string,
  value: string
): Promise<void> {
  const supabase = await createSupabaseServer()
  await supabase
    .from('site_content')
    .upsert(
      {
        page,
        section,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page,section,key' }
    )
}

// Batch update multiple content values for a page in a single call.
export async function batchUpdateContent(
  updates: Array<{
    page: string
    section: string
    key: string
    value: string
    content_type?: string
    label?: string
  }>
): Promise<void> {
  const supabase = await createSupabaseServer()
  await supabase
    .from('site_content')
    .upsert(
      updates.map((u) => ({
        ...u,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'page,section,key' }
    )
}
