import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContentPageHeaderProps {
  title: string
  description: string
  previewUrl: string
}

export default function ContentPageHeader({ title, description, previewUrl }: ContentPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="flex items-center gap-2 shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview Page
          </Button>
        </Link>
      </div>
      <div className="border-t border-slate-200 mt-5" />
    </div>
  )
}
