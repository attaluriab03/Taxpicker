// lib/anthropic.ts

import Anthropic from '@anthropic-ai/sdk'

export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export type AutoFillResult = {
  description: string
  pricing_type: 'free' | 'freemium' | 'paid'
  price_from: number
  pricing_details: string
  features: string[]
  supported_countries: string[]
  supported_exchanges: string[]
  supported_wallets: string[]
  tax_report_types: string[]
  pros: string[]
  cons: string[]
}

export const AUTOFILL_PROMPT = (name: string, url: string) => `
You are a crypto tax software research assistant.
Your task is to gather accurate, up-to-date data
about the crypto tax tool "${name}" (website: ${url}).

Before generating your response, use the web search
tool to search for the following about "${name}":
1. Search "${name} crypto tax tool pricing plans"
   to find accurate current pricing
2. Search "${name} crypto tax supported exchanges
   wallets" to find integration data
3. Search "${name} crypto tax supported countries"
   to find country availability
4. Search "${name} crypto tax features review"
   to find feature list and pros/cons

Use the search results to populate the JSON
accurately with real, current data — not guesses.

CRITICAL INSTRUCTIONS FOR YOUR RESPONSE:
- Your entire response must be ONLY the JSON object
- Start your response with { and end with }
- Do NOT write any text before or after the JSON
- Do NOT use markdown code fences
- Do NOT include any explanation, summary, or preamble
- ANY text outside the JSON will cause a parse error

The JSON must have exactly these fields:

{
  "description": "2-3 sentences describing the tool accurately based on search results",
  "pricing_type": "free" | "freemium" | "paid",
  "price_from": <lowest monthly USD cost as number, 0 if free>,
  "pricing_details": "Accurate pricing tier summary from search results",
  "features": ["feature1", "feature2", ...],
  "supported_countries": ["US", "UK", "Australia", ...],
  "supported_exchanges": ["Binance", "Coinbase", ...],
  "supported_wallets": ["MetaMask", "Ledger", ...],
  "tax_report_types": ["Capital Gains", "Income", ...],
  "pros": ["pro1", "pro2", ...],
  "cons": ["con1", "con2", ...]
}

Rules:
- Use real data from search results — do not guess
- supported_countries must use full country names
  not abbreviations (e.g. "United States" not "US")
- price_from must be the lowest paid tier monthly
  cost in USD — use 0 only if there is a
  genuinely free tier with no credit card required
- features must reflect actual product features
  found in search results, not generic crypto
  tax tool features
- pros and cons must be based on real user
  feedback or review content found in searches
- If a field cannot be determined from search
  results, return an empty array [] for array
  fields or an empty string for string fields
  rather than guessing

CRITICAL OUTPUT RULES:
- Output only the raw JSON object — no surrounding
  text, no preamble, no explanation
- Never include literal newlines or tabs inside
  string values — use \\n or \\t if needed
- Never use curly quotes or smart quotes —
  only straight double quotes "
- Never include trailing commas after the last
  item in an object or array
- Use [] for unknown arrays and "" for unknown
  strings — never use null
`.trim()