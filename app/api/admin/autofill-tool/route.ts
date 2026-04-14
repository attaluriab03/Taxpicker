import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, AUTOFILL_PROMPT, type AutoFillResult } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { name, websiteUrl } = await req.json()

    if (!name || !websiteUrl) {
      return NextResponse.json(
        { error: 'name and websiteUrl are required' },
        { status: 400 }
      )
    }

    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: AUTOFILL_PROMPT(name, websiteUrl),
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON — strip any accidental markdown fences
    const raw = content.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let parsed: AutoFillResult
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('Claude returned invalid JSON. Please try again.')
    }

    // Validate required fields
    if (!parsed.description || !parsed.pricing_type) {
      throw new Error('Incomplete response from Claude. Please try again.')
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Auto-fill error:', err)
    return NextResponse.json(
      { error: err.message || 'Auto-fill failed' },
      { status: 500 }
    )
  }
}
