// This file is server-side only — never import on the client
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
You are a crypto tax software research assistant. I need structured data about the tool "${name}" (website: ${url}).

Return ONLY a valid JSON object with no preamble, markdown, or explanation. The JSON must have exactly these fields:
{
  "description": "2-3 sentences describing the tool",
  "pricing_type": "free" | "freemium" | "paid",
  "price_from": <monthly USD cost as number, 0 if free>,
  "pricing_details": "Brief pricing summary",
  "features": ["feature1", "feature2", ...],
  "supported_countries": ["US", "UK", "Australia", ...],
  "supported_exchanges": ["Binance", "Coinbase", ...],
  "supported_wallets": ["MetaMask", "Ledger", ...],
  "tax_report_types": ["Capital Gains", "Income", ...],
  "pros": ["pro1", "pro2", ...],
  "cons": ["con1", "con2", ...]
}

Be accurate and concise. Use your knowledge of the tool to fill in all fields.
`.trim()
