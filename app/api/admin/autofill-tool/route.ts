// app/api/admin/autofill-tool/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, AUTOFILL_PROMPT } from '@/lib/anthropic'
import { safeParseJson } from '@/lib/json-parser'

const MODELS = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6'] as const

// Recursively strip <cite index="...">...</cite> tags from all string values
function stripCiteTags(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').trim()
  }
  if (Array.isArray(value)) {
    return value.map(stripCiteTags)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripCiteTags(v)])
    )
  }
  return value
}

const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305' as const,
  name: 'web_search' as const,
}

async function callWithFallback(name: string, url: string) {
  const client = getAnthropicClient()
  let lastError: unknown

  for (const model of MODELS) {
    try {
      return await client.messages.create({
        model,
        max_tokens: 4000,
        tools: [WEB_SEARCH_TOOL],
        messages: [{ role: 'user', content: AUTOFILL_PROMPT(name, url) }],
      })
    } catch (err: any) {
      // 529 = overloaded — try next model; anything else re-throw immediately
      if (err?.status === 529 || err?.type === 'overloaded_error') {
        lastError = err
        continue
      }
      throw err
    }
  }

  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const { name, url } = await request.json()

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Tool name and URL are required' },
        { status: 400 }
      )
    }

    // Try once, then retry once on failure
    let response
    try {
      response = await callWithFallback(name, url)
    } catch {
      response = await callWithFallback(name, url)
    }

    const parsed = safeParseJson(response.content as { type: string; text?: string }[])

    // Strip <cite index="...">...</cite> tags that the web search tool
    // injects into Claude's text for source attribution
    const sanitized = stripCiteTags(parsed)

    return NextResponse.json({ data: sanitized })

  } catch (error) {
    console.error('AutoFill error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tool data' },
      { status: 500 }
    )
  }
}