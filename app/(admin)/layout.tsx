import { Toaster } from '@/components/ui/toaster'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 bg-slate-50 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
