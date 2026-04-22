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
