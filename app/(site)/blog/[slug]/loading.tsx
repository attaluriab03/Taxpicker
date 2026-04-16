export default function ArticleLoading() {
  return (
    <div className="animate-pulse mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <div className="h-4 w-36 bg-slate-200 rounded mb-6" />

      <div className="grid lg:grid-cols-4 gap-10">
        {/* Article */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tags */}
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <div className="h-9 w-3/4 bg-slate-200 rounded" />
            <div className="h-9 w-1/2 bg-slate-200 rounded" />
          </div>
          {/* Meta */}
          <div className="flex gap-4 pb-6 border-b border-slate-200">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
          {/* Hero image */}
          <div className="h-64 bg-slate-200 rounded-xl" />
          {/* Body paragraphs */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="h-48 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
