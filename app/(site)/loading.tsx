export default function SiteLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="pt-16 pb-16 px-4" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFF 55%, #FFFFFF 100%)' }}>
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-4">
          <div className="h-6 w-48 bg-slate-200 rounded-full" />
          <div className="h-12 w-3/4 bg-slate-200 rounded-xl" />
          <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
          <div className="flex gap-12 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool card skeletons */}
      <div className="bg-slate-50 py-14 px-4">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
