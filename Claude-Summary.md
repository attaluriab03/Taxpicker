# Claude Session Summary

This document summarises every change made to the Taxpicker codebase across the Claude Code session.

---

## 1. Comparison Table Column Headers

**Problem:** The column headers (PLATFORM, RATING, STARTING PRICE, BEST FOR, ACTIONS) were inside the filter card container, making them visually disconnected from the tool rows below.

**Fix:** Separated the filter section into its own standalone card and moved the column header row into the comparison table card as its first child.

**File changed:** `app/(site)/page.tsx`

- Closed the filter card `<div>` immediately after `<ToolFilters />` 
- Created a new `rounded-2xl` table card starting with the column header `<div>`
- Removed `overflow-hidden` from the FeatureMatrix wrapper (was silently blocking sticky later)

---

## 2. Feature Comparison Matrix — Sticky Header (5 iterations)

**Goal:** The tool-name header row (showing avatar circles, tool names, pricing badges, and feature counts) should stick below the navbar as the user scrolls down through the feature rows.

### Iteration 1 — `sticky` on `<tr>`
Applied `sticky top-16 z-20` to the `<tr>` element. Caused a ~150px blank gap between the region filter and the matrix header due to `display: table-row` not supporting `position: sticky` cleanly.

### Iteration 2 — `sticky` on `<thead>`
Moved sticky from `<tr>` to `<thead>`. Resolved the blank gap but the header still did not stick. Root cause: HTML table elements (`<thead>`, `<tr>`) inside an `overflow-x: auto` container fail to stick in most browsers — a known table formatting context bug.

### Iteration 3 — Convert to div-based layout
Replaced the entire `<table>/<thead>/<tbody>` structure with div-based flex rows. The sticky header became `<div class="sticky top-16 z-20 flex bg-white shadow-sm">`. Both the header div and feature rows div were siblings inside the `overflow-x-auto` container.

Result: still not sticking. The `overflow-x-auto` container on the parent was still creating a scroll context that trapped sticky.

### Iteration 4 — Two separate scroll containers + `scrollLeft` sync
Moved the sticky header outside the `overflow-x-auto` container into its own `overflow-x-auto` wrapper (`headerScrollRef`). Synced `scrollLeft` between both containers via scroll event listeners.

Result: still not sticking. Any ancestor with `overflow` set to anything other than `visible` — even `overflow-x: auto` — creates a scroll container that blocks `position: sticky` because browsers implicitly also set `overflow-y: auto`.

### Iteration 5 — CSS `transform` approach (final, working)
**Root cause:** `position: sticky` requires zero overflow ancestors between the sticky element and the scroll root. Any `overflow-x/y: auto` ancestor breaks it regardless of axis.

**Fix:**
- Removed `headerScrollRef` and its `overflow-x-auto` wrapper entirely
- Made the sticky header a **direct child** of the `relative` wrapper with no overflow ancestor
- Used `overflow-hidden` on the sticky outer div so it clips content cleanly without creating a scroll container
- Added `headerOffset` state that tracks `scrollRef.scrollLeft` on every scroll event
- Applied `transform: translateX(-${headerOffset}px)` on the inner flex div to slide the header content left in sync with the feature rows scroll — no second scroll container required

**File changed:** `components/tools/FeatureMatrix.tsx`

Key structural change:
```
Before:
  <div ref={headerScrollRef} overflow-x-auto>   ← broke sticky
    <div sticky top-16>
      ...header content...
    </div>
  </div>
  <div ref={scrollRef} overflow-x-auto>
    ...feature rows...
  </div>

After:
  <div sticky top-16 overflow-hidden>            ← no overflow ancestor
    <div style={{ transform: `translateX(-${headerOffset}px)` }}>
      ...header content...
    </div>
  </div>
  <div ref={scrollRef} overflow-x-auto>         ← only scroll container
    ...feature rows...
  </div>
```

State/ref changes:
- Removed: `headerScrollRef`, `syncRowsToHeader` listener, `headerEl` variable, `syncHeaderToRows` function
- Added: `headerOffset: number` state
- `useEffect` now only: sets `showScrollHint` on mount, updates `headerOffset` and `showScrollHint` on scroll

---

## 3. Admin Tool Form — Pricing UX Improvements

**File changed:** `components/admin/ToolForm.tsx`

Changes:
- Updated the pricing section description to reference the tool's official website for accuracy
- Added a hint to the Plan Name field: "The plan name shown on the pricing card e.g. Starter, Pro, Premium, Enterprise"
- Marked the Price field as required (red asterisk)
- Added rich hint text explaining the `$[number] USD/yr` format with `Free` and `Custom` exceptions
- Added examples row: `49 → "$49 USD/yr" · 0 → "Free" · Free → "Free" · Custom → "Custom"`
- Added real-time `onChange` validation (shows error immediately on invalid input)
- Added `onBlur` auto-normalisation: `0 → Free`, `free → Free`, `custom → Custom`, trailing decimal zeros stripped

---

## 4. Strict Price Validation

**File changed:** `lib/validation.ts`

Added `isValidPrice(val: string): boolean`:
- Accepts: empty string, `Free` (any case), `Custom` (any case), or a plain non-negative number (`49`, `49.99`)
- Rejects: `$49`, `50k`, `49/yr`, `USD 49`, or anything with non-numeric characters
- Uses strict regex `/^\d+(\.\d+)?$/` so the entire string must be a valid number — unlike `parseFloat` which silently ignores trailing garbage

**File changed:** `components/admin/ToolForm.tsx`

Replaced the previous allowed-list + `parseFloat` validation with `isValidPrice` from `lib/validation.ts`.

---

## 5. Article Edit Bug Fix

**Problem:** Editing an existing article showed: `Failed to execute 'json' on 'Response': Unexpected end of JSON input`.

**Root cause:** `ArticleForm.tsx` was sending `PUT` requests for edits, but the API route at `app/api/admin/articles/[id]/route.ts` only defines a `PATCH` handler. Next.js returned a 405 Method Not Allowed with an **empty body**. The client then called `.json()` on the empty response body, throwing the JSON parse error.

**Fix:** Changed `'PUT'` → `'PATCH'` on line 102 of `ArticleForm.tsx`.

**File changed:** `components/admin/ArticleForm.tsx`

```ts
// Before
const method = articleId ? 'PUT' : 'POST'

// After
const method = articleId ? 'PATCH' : 'POST'
```

---

## 6. README.md — Full Documentation

**File changed:** `README.md` (rewritten from a single-line placeholder)

Sections written:
- Tech stack table (Next.js 14, Supabase, Claude, Tailwind, Zod, Vercel)
- Annotated project structure (app routes, components, lib)
- Database schema — all 7 tables with column details and RLS policy summary
- Environment variables — complete list with where to find each value
- Local development setup and seed scripts
- Key features: filtering system, feature matrix sticky header, affiliate click tracking, AI auto-fill, CMS content system, admin middleware + subdomain routing
- Admin panel pages — full route table
- Step-by-step guide for adding a new tool
- SEO setup (sitemap, robots, JSON-LD, llms.txt)
- Deployment notes (Vercel + admin subdomain)

---

## Files Changed Summary

| File | Change |
|---|---|
| `app/(site)/page.tsx` | Separated filter card from table card; removed overflow-hidden from matrix wrapper |
| `components/tools/FeatureMatrix.tsx` | Full sticky header rewrite — div layout + CSS transform approach |
| `components/admin/ToolForm.tsx` | Pricing UX improvements + strict price validation with isValidPrice |
| `lib/validation.ts` | Added `isValidPrice()` with strict regex |
| `components/admin/ArticleForm.tsx` | Fixed `PUT` → `PATCH` for article edit requests |
| `README.md` | Full documentation rewrite |
