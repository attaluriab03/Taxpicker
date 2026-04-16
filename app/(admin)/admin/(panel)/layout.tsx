import { Toaster } from '@/components/ui/toaster'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar userEmail={user?.email ?? null} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 bg-slate-50 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
