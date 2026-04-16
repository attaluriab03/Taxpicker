// lib/json-parser.ts

type ContentBlock = { type: string; text?: string }

/**
 * Escapes raw control characters (newlines, tabs, carriage returns, and any
 * other character below 0x20) that appear inside JSON string values.
 * Operates character-by-character so it only escapes within strings, leaving
 * structural JSON characters untouched.
 */
function sanitizeJsonString(raw: string): string {
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const code = raw.charCodeAt(i)

    if (escaped) {
      result += ch
      escaped = false
      continue
    }

    if (ch === '\\' && inString) {
      result += ch
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      result += ch
      continue
    }

    if (inString && code < 0x20) {
      // Replace bare control characters with their JSON escape sequences
      switch (ch) {
        case '\n': result += '\\n'; break
        case '\r': result += '\\r'; break
        case '\t': result += '\\t'; break
        default:   result += `\\u${code.toString(16).padStart(4, '0')}`; break
      }
      continue
    }

    result += ch
  }

  return result
}

/**
 * Applies additional repairs for malformed JSON before re-running
 * sanitizeJsonString():
 * - Strips markdown code fences
 * - Replaces curly/smart quotes with straight double quotes
 * - Replaces en/em dashes with hyphens
 * - Removes null bytes and BOM characters
 * - Fixes unescaped backslashes (backslashes not followed by a valid escape char)
 */
function repairJson(raw: string): string {
  let s = raw
    // Markdown fences
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    // Smart/curly quotes → straight double quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    // En/em dashes → hyphen
    .replace(/[\u2013\u2014]/g, '-')
    // Null bytes and BOM
    .replace(/\u0000/g, '')
    .replace(/^\uFEFF/, '')
    // Unescaped backslashes: a backslash not followed by valid JSON escape chars
    .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')

  return sanitizeJsonString(s)
}

/**
 * Extracts the outermost JSON object from a text string by finding the
 * first '{' and last '}'. Returns null if no object is found.
 */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

/**
 * Robustly extracts and parses a JSON object from Anthropic API response
 * content blocks. Processes text blocks in reverse order (last first) since
 * the JSON is typically in the final text block.
 *
 * Attempts three parsing layers per block:
 *   1. Direct JSON.parse()
 *   2. sanitizeJsonString() — escapes bare control characters inside strings
 *   3. repairJson() — broader repairs + re-sanitize
 */
export function safeParseJson(content: ContentBlock[]): unknown {
  const textBlocks = content
    .filter((b) => b.type === 'text' && typeof b.text === 'string' && b.text.length > 0)
    .reverse()

  for (const block of textBlocks) {
    const extracted = extractJsonObject(block.text!)
    if (!extracted) continue

    // Layer 1: direct parse
    try {
      return JSON.parse(extracted)
    } catch { /* fall through */ }

    // Layer 2: sanitize control characters
    try {
      return JSON.parse(sanitizeJsonString(extracted))
    } catch { /* fall through */ }

    // Layer 3: full repair + sanitize
    try {
      return JSON.parse(repairJson(extracted))
    } catch { /* fall through */ }
  }

  const blockTypes = content.map((b) => b.type).join(', ')
  throw new Error(
    `safeParseJson: could not extract valid JSON from any text block. ` +
    `Response blocks: [${blockTypes}]`
  )
}
