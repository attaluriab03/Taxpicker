# Taxpicker — Client Handoff Document

## 1. Project Overview

**Taxpicker** is a full-stack crypto tax tool comparison platform built with Next.js 14 and Supabase.

### What it does
- Aggregates, reviews, and compares crypto tax software tools
- Displays verified pricing, features, supported exchanges, and user ratings
- Provides educational articles on crypto taxation
- Tracks affiliate link clicks with GDPR consent gating
- Includes a full CMS admin panel for managing all content

### Tech Stack
| Service | Purpose | Docs |
|---|---|---|
| [Next.js 14](https://nextjs.org/docs) | Frontend + API routes (App Router) | nextjs.org/docs |
| [Tailwind CSS](https://tailwindcss.com) | Styling | tailwindcss.com |
| [shadcn/ui](https://ui.shadcn.com) | UI component library | ui.shadcn.com |
| [Supabase](https://supabase.com/docs) | Database, auth, storage, realtime | supabase.com/docs |
| [Anthropic Claude API](https://docs.anthropic.com) | AI Auto-Fill in admin CMS | docs.anthropic.com |
| [Vercel](https://vercel.com/docs) | Hosting & deployment | vercel.com/docs |

### Architecture
```
Browser → Next.js App Router (Vercel)
                ↓
        API Routes (/api/*)
                ↓
    Supabase (PostgreSQL + Auth + Storage + Realtime)
    Anthropic Claude API (AI Auto-Fill only)
```

---

## 2. Credentials & Services Checklist

### Anthropic Console (console.anthropic.com)
- [ ] Create an account at console.anthropic.com
- [ ] Add a payment method under Billing
- [ ] Go to API Keys → Create a new key named "taxpicker-production"
- [ ] Set a monthly spend alert (recommended: $20/month)
- [ ] Copy the key — you will only see it once
- [ ] Estimated cost: ~$0.003 per AI Auto-Fill call

### Supabase (supabase.com)
- [ ] Transfer project ownership OR create a new project and migrate
- [ ] If creating new project: run SCHEMA.sql in the SQL editor
- [ ] Update all three Supabase environment variables in your hosting platform
- [ ] Verify RLS policies are enabled (see SCHEMA.sql)
- [ ] Create the "assets" storage bucket (see SCHEMA.sql comments)

### Vercel (vercel.com) — or your hosting platform
- [ ] Transfer project ownership
- [ ] Update all environment variables (see Section 3)
- [ ] Verify the build completes successfully after handoff
- [ ] Set a custom domain

### Domain Registrar
- [ ] Transfer domain ownership to client's registrar account
- [ ] Update DNS to point to Vercel

---

## 3. Environment Variables Reference

| Variable | Description | Where to find |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key for AI Auto-Fill | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase → Project Settings → API |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server-only) | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for canonical tags | Set to your production domain |

**Security rules:**
- `ANTHROPIC_API_KEY` and `SUPABASE_SECRET_KEY` must NEVER be exposed in client-side code
- Never commit `.env.local` to Git (it is already in `.gitignore`)
- Rotate any key immediately if it is ever accidentally exposed

---

## 4. Swapping the Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign in
2. Navigate to **API Keys** in the left sidebar
3. Click **Create Key**, name it "taxpicker-production", and copy it
4. Go to **Vercel → Your Project → Settings → Environment Variables**
5. Find `ANTHROPIC_API_KEY` and click **Edit**
6. Paste the new key and click **Save**
7. Go to **Deployments** and click **Redeploy** on the latest deployment
8. Test: open the admin panel at `/admin/tools/new`, enter a tool name and URL, and click **AI Auto-Fill**

---

## 5. Swapping Supabase Credentials

### Migrating to a new Supabase project:
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the entire contents of `SCHEMA.sql`
3. Export data from the original project: **Database → Backups → Export**
4. Import data into the new project
5. Update these three variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
6. Redeploy

### Creating the Storage bucket:
1. In Supabase, go to **Storage**
2. Create a bucket named `assets` with **Public** access enabled
3. Upload tool logos to `assets/logos/`
4. Copy the public URL and use it in the tool's Logo URL field

---

## 6. Admin Panel Guide

### Accessing the admin panel
Navigate to `/admin/login` in your browser and sign in with your admin credentials. Unauthenticated visitors are automatically redirected to the login page.

### Adding a new tool
1. Go to `/admin/tools/new`
2. Enter the **Tool Name** (required)
3. Enter the **Website URL** (required for AI Auto-Fill)
4. Click **AI Auto-Fill** and wait ~5 seconds for Claude to populate all fields
5. Review every field — correct any inaccuracies
6. Enter the **Affiliate URL** (the tracked referral link — required)
7. Upload the official tool logo to Supabase Storage and paste the public URL
8. Set **Is Recommended** if this tool should appear at the top of all listings with the Recommended badge
9. Set **Is Featured** to highlight the tool visually
10. Tick all 6 items in the **Verification Checklist**
11. Click **Save as Draft** to save without publishing
12. Preview the tool at `/tools/{slug}`
13. Click **Publish** to make it live

### Managing articles
1. Go to `/admin/articles/new`
2. Enter title, meta description, author, and tags
3. Write content in Markdown format
4. Click **Save Draft** or **Publish**

**Publish/unpublish from the articles list:** The articles table at `/admin/articles` shows each article's status (Draft, Scheduled, Published). Use the action buttons to publish a draft (sets `published_at` to now), unpublish a live article (clears `published_at`), or delete. Changes appear on the public `/blog` page immediately — no cache delay.

### Viewing click analytics
Go to `/admin/clicks` to see all affiliate link clicks, including timestamps, IP addresses, and GDPR consent status.

---

## 7. Adding New Tools — Step by Step

1. Go to `/admin/tools/new`
2. Enter the tool name and official website URL
3. Click **"AI Auto-Fill"** and wait for fields to populate
4. Review every field and correct any inaccuracies
5. Upload the official tool logo
6. Enter the affiliate URL (tracked referral link)
7. Toggle **Is Recommended** if this tool should appear at the top of all listings with the Recommended badge
8. Tick all items in the verification checklist
9. Click **Save as Draft**
10. Preview the tool detail page at `/tools/{slug}`
11. Click **Publish** when satisfied

---

## 8. Admin Authentication

### Overview
The admin panel at `/admin` is protected by Supabase Auth. Only manually created users can log in — there is no public signup. Every request is validated server-side using `getUser()`.

### Creating a New Admin User
1. Go to **Supabase Dashboard → Authentication → Users → Add User**
2. Enter the email address and a strong password
3. Tick **"Auto Confirm User"**
4. Click **Create User**
5. The user can now log in at `/admin/login`

### Deleting an Admin User
1. Go to **Supabase Dashboard → Authentication → Users**
2. Click the user row to open it
3. Click **Delete User**
4. The session is immediately invalidated — they cannot access the admin panel again

### Recommended Credential Handoff Flow
1. During build and demo: developer uses a placeholder admin account (e.g. `admin@taxpicker.com`)
2. Before final handoff: create a new user with the client's real email address
3. Have the client test login at `/admin/login`
4. Once confirmed working, delete the developer's placeholder account
5. Client now has sole admin access

### Resetting an Admin Password
1. **Supabase Dashboard → Authentication → Users → click the user**
2. Click **Send Password Recovery** to email a reset link
3. Or delete and recreate the user with a new password for private admin accounts

### Security Notes
- `ANTHROPIC_API_KEY` must never be committed to Git
- `SUPABASE_SECRET_KEY` must never be in client-side code
- All API keys live only in the hosting platform's environment variables (Vercel)
- Rotate any key immediately if it is ever accidentally exposed
- RLS policies in Supabase protect all data at the database level
- Never share admin credentials between people — each person gets their own account
- Public signups are disabled — admin users can only be created in the Supabase dashboard
- Sessions are validated server-side on every request using `getUser()`, not `getSession()`
- Rotating Supabase keys in Vercel environment variables will immediately invalidate all active sessions
- Change the admin password immediately after receiving it from the developer

---

## 9. Ongoing Costs (Estimated Monthly)

| Service | Free Tier | Paid |
|---|---|---|
| Vercel | Free for hobby projects | Pro: $20/month |
| Supabase | 500MB DB, 1GB storage free | Pro: $25/month |
| Anthropic API | Pay per use | ~$0.003 per auto-fill call |
| Domain | N/A | ~$10–15/year |

**Total at launch (free tiers):** $0/month + domain cost
**Total at scale:** ~$55/month

---

## 10. Support & Maintenance

### Documentation
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Anthropic: [docs.anthropic.com](https://docs.anthropic.com)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com)
- Tailwind CSS: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Maintenance tasks
- Verify tool pricing and features quarterly (use the admin verification checklist)
- Monitor Anthropic API usage in the Anthropic console
- Monitor Supabase storage usage
- Check for Next.js security updates periodically

---

## 11. CMS — Editing Page Content

### Overview

Every user-facing text string on the public website (headings, descriptions, legal pages, etc.) is stored in the Supabase `site_content` table and editable through the admin panel at `/admin/content`. You never need to touch code to update these strings.

Content is organised as: **page → section → key**. For example, the homepage hero heading is `homepage → hero → title_line_1`.

---

### How to edit page content

1. Go to `/admin/content` in the admin panel
2. Choose the page you want to edit from the sidebar (Homepage, About, FAQ, or a legal page)
3. Edit the fields directly in the text boxes
4. Click **Save Changes** in the sticky bar that appears at the bottom of the screen
5. Changes are published immediately — reload the public page to confirm

The sticky bar only appears when you have unsaved changes. It disappears automatically after a successful save.

---

### What can be edited per page

#### Homepage (`/admin/content/homepage`)

| Section | Fields |
|---|---|
| Hero Section | Trusted badge text, Headline line 1, Headline line 2, Hero description |
| Metrics Bar | 4 metric number/label pairs (e.g. "50K+" / "Users Helped") |
| Comparison Table | Section title (currently "Refine Results") |
| "Why" Section | Section title and subtitle |
| Feature Matrix | Section title and description |

#### About (`/admin/content/about`)

| Section | Fields |
|---|---|
| Hero | Page title, Page description |
| Why Section | Section title, Section description |
| Methodology | Section title, Section description |
| Affiliate Disclosure | Section title |
| CTA | Title, Description, Button text |

#### FAQ Page (`/admin/content/faq`)

| Section | Fields |
|---|---|
| Page Header | Page title, Page description |

The individual FAQ items (questions and answers) are managed separately — see **Managing Global FAQ Items** below.

#### Legal Pages

Each legal page has three editable fields:

| Field | Description |
|---|---|
| Page Title | The `<h1>` shown at the top of the page |
| Last Updated | Date string shown below the title (e.g. "April 27, 2026") |
| Page Content | Full page body in Markdown format |

Legal pages and their admin paths:

| Page | Admin path | Public URL |
|---|---|---|
| Privacy Policy | `/admin/content/privacy-policy` | `/privacy-policy` |
| Terms of Use | `/admin/content/terms` | `/terms` |
| Affiliate Disclosure | `/admin/content/affiliate-disclosure` | `/affiliate-disclosure` |
| Cookie Policy | `/admin/content/cookie-policy` | `/cookie-policy` |
| Disclaimer | `/admin/content/disclaimer` | `/disclaimer` |

---

### Markdown reference (for legal page content)

Legal page body content is written in Markdown. Here are the most common elements:

| Syntax | Output |
|---|---|
| `## Heading` | Large section heading |
| `### Sub-heading` | Smaller sub-heading |
| `**bold text**` | **Bold text** |
| `*italic text*` | *Italic text* |
| `[Link text](https://url.com)` | Clickable hyperlink |
| `- Item` | Bulleted list item |
| `1. Item` | Numbered list item |
| `` `inline code` `` | Inline code |
| `> blockquote` | Indented callout/quote |

You can preview any changes by clicking the **Preview** button at the top of the legal page editor (opens the public page in a new tab). Remember to **Save Changes** before previewing — the preview shows the live database content.

---

### Editing tools (tool detail pages)

Tool content — name, description, pricing, features, pros/cons, FAQs, and supported exchanges — is all managed through the **Tools** section of the admin panel.

#### Editing a published tool

1. Go to `/admin/tools` and find the tool
2. Click **Edit**
3. Make your changes
4. Click **Save Changes** — changes publish immediately, no checklist required for existing tools
5. To take a tool offline temporarily, click **Unpublish & Save as Draft**

#### Adding / editing pricing tiers

In the **Pricing** section of the tool form:

- Click **+ Add Tier** to add a new pricing card
- Set the tier name (e.g. "Starter", "Pro", "Business")
- Enter the price — use a number (e.g. `49`) for numeric pricing, `0` for Free, or any text (e.g. `Custom`) for non-numeric values
- Toggle the **Popular** switch on the tier you want to highlight — only one tier can be Popular at a time
- Click the **×** on any tier card to remove it
- Tiers display as cards on the public tool page; more than 4 wrap to a second row automatically

#### Adding / editing tool FAQs

In the **FAQs** section at the bottom of the tool form:

- Click **+ Add FAQ** to add a new question/answer pair
- Type the question and answer in the fields provided
- FAQs display as a collapsible accordion on the public tool detail page
- Reorder by dragging (or use the ↑ ↓ arrows if drag is unavailable)
- Click **Remove** to delete a FAQ

#### Managing user reviews for a tool

In the **Reviews** section at the bottom of the tool form (only visible when editing an existing tool):

- Existing reviews are listed with the reviewer name, rating, and comment
- Click the trash icon to delete an inappropriate review (a confirmation dialog will appear)
- To add a test review, fill in the **Add Review** form and click **Add Review**
- Reviews display as cards on the public tool detail page; the first 3 are shown by default, the rest expand on click

---

### Managing global FAQ items (the FAQ page)

The FAQ page at `/faq` displays a curated set of question/answer pairs managed in the `faq_items` table.

1. Go to `/admin/content/faq` in the admin panel
2. The **FAQ Items** section lists all existing questions
3. To **add** a new item: fill in the question and answer in the form at the bottom and click **Add FAQ**
4. To **edit** an item: click the **Edit** button on any row, update the fields, and click **Save**
5. To **reorder** items: click **↑** or **↓** on any row to move it
6. To **publish/unpublish** an item: toggle the **Published** switch — only published items appear on the public FAQ page
7. To **delete** an item: click the trash icon and confirm the dialog

---

### Re-seeding content (after Supabase migration)

If you migrate to a new Supabase project and need to re-populate all default content:

```bash
npx tsx scripts/seed-content.ts
npx tsx scripts/seed-filters.ts   # seeds filter_options table
```

Both scripts upsert safely (they can be re-run without duplicating data). Run them from the project root with `.env.local` present.

---

## 12. Filter System

### Overview

Every filter option on the homepage — Region, Trading Volume, Price Range, User Type, and Required Features — is stored in the `filter_options` Supabase table and manageable from **Admin → Filters**. There are no hardcoded filter values in the codebase; all lists come from the database.

The `filter_options` table has eight categories:

| Category | Used in |
|---|---|
| `region` | Region filter (homepage + Feature Matrix) · Tool edit form |
| `price_range` | Price Range filter (homepage) — stores threshold values, not tool array data |
| `trading_volume` | Trading Volume filter (homepage) · Tool edit form |
| `user_type` | User Type filter (homepage) · Tool edit form |
| `required_features` | Required Features filter · Feature Comparison Matrix · Tool edit form |
| `supported_exchanges` | Tool edit form · Tool detail page |
| `supported_wallets` | Tool edit form · Tool detail page |
| `tax_report_types` | Tool edit form · Tool detail page |

---

### How tools connect to filters

Every tool has fields that connect it to the homepage filters:

| Tool field | Homepage filter | How to set |
|---|---|---|
| `supported_regions` | Region filter | Dropdown on tool edit form → Supported Regions |
| `trading_volume` | Trading Volume filter | Dropdown on tool edit form → Trading Volume |
| `user_type` | User Type filter | Dropdown on tool edit form → User Type |
| `features` | Required Features filter | Dropdown on tool edit form → Features |
| `pricing_type` | Pricing Model filter (Free/Freemium/Paid) | Radio buttons on tool edit form → Pricing section |
| `price_from` | Price Range filter | Computed automatically from pricing tiers |

A tool only appears in filter results if its field contains the selected value. For example, selecting "United States" in the Region filter returns only tools where `supported_regions` contains `US`.

---

### Adding a new region

1. Go to **Admin → Filters → Regions tab**
2. Fill in:
   - **Label**: `Japan` (shown to users)
   - **Value**: `JP` (stored in `tools.supported_regions`)
   - **Display Order**: lower number = shown first in the filter
3. Click **Add Option**
4. The region immediately appears in the Region filter on the homepage and the Feature Matrix
5. Go to **Admin → Tools** and edit any tool that supports Japan — select `Japan` under Supported Regions

---

### Adding a new feature filter option

1. Go to **Admin → Filters → Required Features tab**
2. Fill in:
   - **Label**: `Options Trading Support`
   - **Value**: `Options Trading Support` (for features, value = label — must exactly match what you'll enter in the tool's Features field)
   - **Display Order**: order in the filter and Feature Matrix rows
3. Click **Add Option**
4. The feature immediately appears in the Required Features filter and as a new row in the Feature Matrix
5. Edit any tool that supports this feature — select it under Features

---

### Deactivating a filter option

Clicking the toggle next to an active option will prompt a confirmation. Deactivating:
- Hides the option from the public filter immediately
- Does **not** remove it from tools that already have it selected (data is preserved)
- Can be reversed by clicking the toggle again (no confirmation needed to reactivate)

---

### Tools schema — filter-related columns

| Column | Type | Description |
|---|---|---|
| `supported_regions` | `text[]` | Region codes (e.g. `US`, `GB`) from `filter_options.region` |
| `trading_volume` | `text[]` | Volume codes (e.g. `casual`, `high`) from `filter_options.trading_volume` |
| `user_type` | `text[]` | User type codes (e.g. `beginner`, `business`) from `filter_options.user_type` |
| `features` | `text[]` | Feature strings matching `filter_options.required_features.value` |
| `supported_countries` | `text[]` | Legacy column — kept for backward compat; prefer `supported_regions` |

After adding new tools via the admin form, `supported_countries` is no longer populated. It is kept in the database schema for backward compatibility with old tool data.

---

## 13. Pricing System

### Overview

Pricing is split into two independent concepts that power two independent homepage filters:

| Concept | Column | Filter | Editable |
|---|---|---|---|
| Pricing Model | `pricing_type` | "Pricing Model" (Free / Freemium / Paid) | Radio buttons in tool form |
| Price From | `price_from` | "Price Range" (threshold-based) | Computed automatically from tiers |

---

### Pricing Model (`pricing_type`)

Three options — **Free**, **Freemium**, **Paid** — selected via radio buttons in the Pricing section of the tool edit form. This is a direct database value; it is never derived from tiers.

- **Free**: Tool costs nothing at all.
- **Freemium**: Tool has a free tier plus paid tiers.
- **Paid**: Tool is paid-only (no free tier).

The homepage "Pricing Model" filter is hardcoded to these three values — it does not read from `filter_options`.

---

### Price From (`price_from`) and the Price Range filter

`price_from` is computed automatically from the tool's pricing tiers: it is the lowest numeric paid price across all tiers. You never edit this column directly — it is set by the admin form when you save.

The **Price Range** filter uses threshold values stored in `filter_options` under the `price_range` category. Each threshold has a `metadata.max` field (a number). When a user selects a Price Range filter, the homepage shows only tools where `price_from ≤ max`.

**Example:** A threshold "Under $100/year" with `metadata.max = 100` shows all free tools plus any paid/freemium tool with `price_from ≤ 100`.

**The tool edit form shows a live "Price Range Filter Value" indicator** below the pricing tiers section. This updates in real time as you change tier prices — it shows the computed `price_from` and which threshold bucket the tool would fall into. No save is required to see the indicator update.

---

### Adding a new Price Range threshold

1. Go to **Admin → Filters → Price Range tab**
2. Fill in:
   - **Label**: `Under $50/year` (shown to users in the filter)
   - **Value**: `under_50` (any unique slug — not stored on tools)
   - **Max Price (USD/year)**: `50` (the threshold number — tools with `price_from ≤ 50` match)
   - **Display Order**: controls order in the dropdown
3. Click **Add Option**
4. The new threshold immediately appears in the Price Range filter on the homepage

**Note:** `price_range` values are NOT stored in tool arrays. Deleting a `price_range` filter option only removes the threshold; no tool data is changed.

---

### Pricing tiers (the Pricing section in the tool form)

Tiers are display-only — they render as cards on the public tool detail page. They also drive `price_from`.

- **Name**: e.g. "Starter", "Pro", "Business"
- **Price**: enter a number (`49`) for paid, `0` for Free, or text (`Custom`) for non-numeric
- **Popular**: highlights one tier with a blue "Popular" badge — only one per tool
- `price_from` is set to the minimum numeric price > 0 across all tiers on save; if all tiers are free (`0`), `price_from` is set to `0`
