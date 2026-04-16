import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Browser client for use in client components (handles auth sessions)
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

// Legacy singleton — kept for client components that import { supabase }
export const supabase = createClient()

// Server-side service role client for admin mutations/data-fetching in API routes
// This uses the secret key and bypasses RLS — never expose to the browser
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export type Database = {
  public: {
    Tables: {
      tools: {
        Row: Tool
        Insert: Omit<Tool, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tool, 'id' | 'created_at'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at'>>
      }
      affiliate_clicks: {
        Row: AffiliateClick
        Insert: Omit<AffiliateClick, 'id'>
        Update: Partial<Omit<AffiliateClick, 'id'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      cookie_consents: {
        Row: CookieConsent
        Insert: Omit<CookieConsent, 'id'>
        Update: Partial<Omit<CookieConsent, 'id'>>
      }
    }
  }
}

export type Tool = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  pricing_type: 'free' | 'freemium' | 'paid'
  price_from: number | null
  pricing_details: string | null
  features: string[]
  supported_countries: string[]
  supported_exchanges: string[]
  supported_wallets: string[]
  tax_report_types: string[]
  pros: string[]
  cons: string[]
  best_for: string[]
  affiliate_url: string
  rating: number | null
  review_count?: number
  is_published: boolean
  is_featured: boolean
  is_recommended: boolean
  last_verified_at: string | null
  last_verified_by: string | null
  created_at: string
  updated_at: string
}

export type Article = {
  id: string
  title: string
  slug: string
  content: string
  author: string | null
  published_at: string | null
  tags: string[]
  meta_description: string | null
  og_image_url: string | null
  created_at: string
  updated_at: string
}

export type AffiliateClick = {
  id: string
  tool_id: string
  clicked_at: string
  user_agent: string | null
  referrer: string | null
  ip: string | null
  gdpr_consent: boolean
}

export type Review = {
  id: string
  tool_id: string
  rating: number
  comment: string | null
  author: string | null
  created_at: string
}

export type CookieConsent = {
  id: string
  session_id: string
  consent_given: boolean
  consent_at: string
  ip: string | null
}
