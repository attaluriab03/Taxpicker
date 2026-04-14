'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackAffiliateClickClient } from '@/lib/tracking-client'
import type { Tool } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface AffiliateButtonProps {
  tool: Tool
  size?: 'default' | 'lg'
  className?: string
}

export default function AffiliateButton({ tool, size = 'default', className }: AffiliateButtonProps) {
  const handleClick = () => {
    trackAffiliateClickClient(tool.id)
  }

  return (
    <a
      href={tool.affiliate_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      className="block"
    >
      <Button
        size={size}
        className={cn(
          'w-full',
          tool.is_recommended ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800',
          className
        )}
      >
        Visit {tool.name}
        <ExternalLink className="h-4 w-4" />
      </Button>
    </a>
  )
}
