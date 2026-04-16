export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-56 bg-slate-200 rounded" />
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-200" />
      </div>

      {/* Stat cards row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Stat cards row 2 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Tools table */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="h-5 w-24 bg-slate-200 rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-slate-100 last:border-0 flex gap-4">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
