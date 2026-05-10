# Taxpicker

A crypto tax software comparison site. Users filter and compare tools by region, pricing, features, and trading volume. Admins manage all content through a protected dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (admin-only) |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| AI | Anthropic Claude (Haiku + Sonnet) via web search tool |
| Validation | Zod |
| Deployment | Vercel |

---

## Project Structure

```
app/
  (site)/           Public-facing pages
    page.tsx          Homepage — tool list + feature matrix
    tools/[slug]/     Individual tool detail page
    blog/             Article listing + detail pages
    about/            About page
    faq/              FAQ page
    affiliate-disclosure/
    privacy-policy/
    terms/
    cookie-policy/
    disclaimer/

  (admin)/          Password-protected admin panel
    admin/
      page.tsx        Dashboard — stats, clicks, recent reviews
      tools/          Create, edit, publish/unpublish tools
      articles/       Create and edit blog articles
      filters/        Manage filter options (regions, features, etc.)
      content/        Edit all CMS text for every public page
      clicks/         Affiliate click log

  api/
    admin/
      tools/          CRUD for tools
      articles/       CRUD for articles
      faq/            CRUD for FAQ items
      filter-options/ CRUD for filter options
      content/        Content upsert
      autofill-tool/  AI-powered tool data generator
    track-click/      Public affiliate click tracking endpoint

components/
  tools/      ToolCard, FeatureMatrix, ToolFilters, AffiliateButton, ...
  admin/      ToolForm, ArticleForm, ContentEditor, ClicksTable, ...
  layout/     Header, Footer, CookieBanner
  compliance/ AffiliateBanner, DisclaimerCallout
  ui/         shadcn/ui primitives

lib/
  supabase.ts         Browser Supabase client + type definitions
  supabase-server.ts  Server-side Supabase client (cookies)
  content.ts          CMS helpers (getPageContent, updateContent)
  tracking.ts         Server action for affiliate click recording
  validation.ts       Shared Zod validators + isValidPrice()
  anthropic.ts        Claude client + autofill prompt
  metadata.ts         generateMetadata helpers
  countries.ts        Country list for region detection

middleware.ts   Route guard — redirects unauthenticated users away from /admin
```

---

## Database Schema

Run `SCHEMA.sql` in the Supabase SQL editor to create all tables.

### Tables

**`tools`** — core table for every reviewed crypto tax platform

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Display name |
| slug | TEXT | URL-safe identifier, unique |
| description | TEXT | Short marketing description |
| logo_url | TEXT | Hosted image URL |
| website_url | TEXT | Official site |
| pricing_type | ENUM | `free`, `freemium`, or `paid` |
| price_from | NUMERIC | Lowest paid plan starting price |
| pricing_details | TEXT | Human-readable pricing summary |
| features | JSONB | Array of feature strings |
| supported_countries | TEXT[] | ISO country codes |
| supported_exchanges | TEXT[] | Exchange names |
| supported_wallets | TEXT[] | Wallet names |
| tax_report_types | TEXT[] | Report types (Capital Gains, etc.) |
| pros / cons | TEXT[] | Editorial pros and cons |
| affiliate_url | TEXT | Monetised outbound link |
| rating | NUMERIC(3,2) | 0–5 editorial rating |
| is_published | BOOLEAN | Controls public visibility |
| is_featured | BOOLEAN | Appears in featured sorting |
| is_recommended | BOOLEAN | Gets "Recommended" badge |
| last_verified_at | TIMESTAMPTZ | When data was last checked |

**`articles`** — blog posts (markdown content, tag array, og image)

**`affiliate_clicks`** — one row per outbound click (tool_id, IP, user_agent, referrer, timestamp)

**`reviews`** — 1–5 star user reviews per tool

**`cookie_consents`** — GDPR consent records

**`filter_options`** — configurable filter values managed in admin (category, value, label, display_order)

**`site_content`** — key-value CMS store keyed by `(page, section, key)` — powers all editable text on the public site

### Row Level Security

- Public users: read published tools, read published articles, insert affiliate clicks, insert cookie consents
- Authenticated (admin): full access to all tables
- Realtime is enabled on `affiliate_clicks` for the live dashboard counter

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values.

```env
# Supabase — Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx

# Anthropic — console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-xxx

# Site URLs (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
NEXT_PUBLIC_DOMAIN=yourdomain.com
```

---

## Local Development

```bash
npm install
npm run dev        # http://localhost:3000
```

Admin panel is at `http://localhost:3000/admin`. Login with any Supabase Auth user that exists in your project.

### Seed scripts

```bash
npm run seed:content   # Populate site_content with default CMS values
npm run seed:filters   # Populate filter_options with default regions/features/etc.
```

---

## Key Features

### Tool Comparison (Homepage)

The homepage fetches tools from Supabase server-side and applies URL search-param filters before rendering:

- **Region** — `?regions=US,UK` — filters with `contains` on `supported_regions`
- **Pricing model** — `?pricing=freemium` — exact match on `pricing_type`
- **Price range** — `?priceRange=under100` — post-fetch filter using `metadata.max` from `filter_options`
- **Features** — `?features=DeFi,NFT` — each feature must be present in the `features` JSONB array
- **Trading volume** — `?volume=high` — `contains` on `trading_volume`
- **User type** — `?userType=trader` — `contains` on `user_type`

Filters are rendered client-side in `ToolFilters.tsx` and push to the URL via `router.push`, causing a server re-fetch.

### Feature Comparison Matrix

`FeatureMatrix.tsx` renders all tools in a horizontally scrollable grid with a sticky header row. The sticky header uses a CSS `transform: translateX` approach rather than a second scroll container — this avoids the known browser bug where `position: sticky` fails inside any ancestor with `overflow` set to anything other than `visible`.

### Affiliate Click Tracking

Every "Visit Site" button calls `trackAffiliateClick(toolId)` — a Next.js server action in `lib/tracking.ts`. It inserts a row into `affiliate_clicks` capturing the tool ID, timestamp, IP, user agent, and referrer. The admin dashboard shows a live counter powered by Supabase Realtime subscriptions.

### AI Auto-Fill (Admin)

When creating or editing a tool, the admin can click **Auto-Fill**. This calls `POST /api/admin/autofill-tool` with the tool name and URL. The API uses Claude (Haiku first, falls back to Sonnet on overload) with the built-in `web_search` tool to research the tool and return a structured JSON payload that pre-populates the form fields.

### CMS Content System

All user-facing text (hero copy, section headings, FAQ items, legal pages) is stored in the `site_content` table and editable in the admin under `/admin/content/*`. `getPageContent(page)` fetches all keys for a page as a flat `Record<string, string>`; `getContent(content, 'section.key', 'fallback')` retrieves a value with a hardcoded default so the site never shows empty text even before CMS data is seeded.

### Admin Routing

`middleware.ts` protects all `/admin/*` routes. It calls `supabase.auth.getUser()` (validates the JWT server-side on every request) and redirects unauthenticated requests to the login page. The admin panel also supports a dedicated subdomain (`admin.yourdomain.com`) — the middleware detects this via the `host` header and adjusts login/redirect URLs accordingly.

---

## Admin Panel Pages

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — tool stats, click counts, recent reviews, top tools |
| `/admin/tools` | List all tools; publish/unpublish/delete |
| `/admin/tools/new` | Create a tool (manual or AI auto-fill) |
| `/admin/tools/[id]/edit` | Edit an existing tool |
| `/admin/articles` | List articles with publish status |
| `/admin/articles/new` | Write a new article (markdown) |
| `/admin/articles/[id]/edit` | Edit an article |
| `/admin/filters` | Add/edit/reorder filter options for all filter categories |
| `/admin/content/homepage` | Edit hero copy, stats, section headings |
| `/admin/content/about` | Edit the About page |
| `/admin/content/faq` | Manage FAQ question/answer pairs |
| `/admin/content/privacy-policy` | Edit legal pages (markdown) |
| `/admin/clicks` | Full affiliate click log with timestamps and metadata |

---

## Adding a New Tool

1. Go to `/admin/tools/new`
2. Enter the tool name and website URL, then click **Auto-Fill** to let Claude research and populate the form
3. Review all fields — pricing tiers, features, supported regions, pros/cons
4. Set `is_published` to publish immediately, or save as draft
5. Optionally mark as `is_featured` or `is_recommended` to boost sort order

Price field accepts: a plain number (`49`), `Free`, or `Custom`. It displays as `$49 USD/yr` on the public site.

---

## SEO

- `app/sitemap.ts` generates a dynamic XML sitemap including all published tools and articles
- `app/robots.ts` disallows `/admin`
- Each tool page calls `toolMetadata(tool)` to generate Open Graph and Twitter card metadata
- Homepage uses JSON-LD `ItemList` schema for the top 10 tools
- `public/llms.txt` documents the site structure for AI crawlers

---

## Deployment

The project is designed for Vercel. Set all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

For the admin subdomain (`admin.yourdomain.com`), add it as an additional domain in Vercel and configure it to point to the same deployment. The middleware handles routing based on the `host` header — no separate Next.js project is needed.

See `Domain-Setup.md` for full DNS and subdomain configuration instructions.
