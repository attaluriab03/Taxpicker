import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  subtitleColor?: string
  icon?: React.ReactNode
}

export default function StatsCard({
  title,
  value,
  subtitle,
  subtitleColor = 'text-green-600',
  icon,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      {subtitle && (
        <p className={cn('text-xs font-medium', subtitleColor)}>{subtitle}</p>
      )}
    </div>
  )
}
