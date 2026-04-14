'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ToolCard from './ToolCard'
import type { Tool } from '@/lib/supabase'

interface ToolExpandButtonProps {
  extraTools: Tool[]
  startRank: number
}

export default function ToolExpandButton({ extraTools, startRank }: ToolExpandButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    if (expanded) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setExpanded(false), 300)
    } else {
      setExpanded(true)
    }
  }

  if (extraTools.length === 0) return null

  return (
    <div>
      <div ref={topRef} />
      {expanded && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {extraTools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} rank={startRank + i} />
          ))}
        </div>
      )}

      <div className={expanded ? 'mt-4' : 'mt-2'}>
        <Button
          variant="outline"
          onClick={toggle}
          className="w-full border-dashed text-slate-600 hover:text-slate-900 hover:border-slate-400"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show {extraTools.length} More Tools
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
