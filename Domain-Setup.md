# 🌐 Setting Up Your Website Domain
### A Step-by-Step Guide for Connecting Your Domain to Your Website

## What We're Setting Up

By the end of this guide, the website will be live at two addresses:

| Address | What It Is |
|---|---|
| `https://taxpicker.com` | The public-facing website — the one your customers will visit |
| `https://admin.taxpicker.com` | The private admin panel (CMS) |

---

## Part 1 — Log In to GoDaddy

1. Go to **godaddy.com** in your web browser
2. Click **Sign In** in the top right corner
3. Enter your GoDaddy email address and password
4. Once logged in, click on your **name or profile icon** in the top right
5. Click **My Products** from the dropdown menu

You should now see a page showing all the products you have purchased, including your domain name.

---

## Part 2 — Get to Your Domain's DNS Settings

1. On the **My Products** page, find the **Domains** section
2. You will see your domain name listed (e.g. `yourdomain.com`)
3. Click directly on the **domain name** to open its settings
4. On the next page, click the **DNS** tab at the top

You are now in the DNS Zone Editor — this is where we will add the records that connect your domain to your website.

> **⚠️ Important:** You will see a list of existing DNS records on this page. **Do not delete or change any existing records**. We are only adding new ones.

---

## Part 3 — Add the DNS Records

You need to add **3 records** in total. Your developer will give you the exact values to enter for each one. The steps for adding each record are the same.

### How to Add a Record (Do This 3 Times)

1. Click the **Add New Record** button (should be in the top right of the DNS records table)
2. A form will appear with fields to fill in
3. Fill in the fields exactly as shown in the tables below
4. **IMPORTANT**: Click **Save** after each record

---

### Record 1 — Connect The Main Website

This record connects `taxpicker.com` to the website.

| Field | What to Enter |
|---|---|
| **Type** | `A` |
| **Name** | `@` |
| **Value / Points To** | `216.198.79.1` |
| **TTL** | `600 seconds` (or select **Custom** and type `600`) |

> **What is `@`?** The `@` symbol means "the root domain" — in other words, `yourdomain.com` itself.

---

### Record 2 — Connect the www Version of Your Website

This record makes sure `www.taxpicker.com` also works and points to the right place.

| Field | What to Enter |
|---|---|
| **Type** | `CNAME` |
| **Name** | `www` |
| **Value / Points To** | `2adf077dff9f1309.vercel-dns-017.com.` |
| **TTL** | Leave as default, or type `3600` |

---

### Record 3 — Connect Your Admin Panel

This record sets up the private admin panel at `admin.yourdomain.com`.

| Field | What to Enter |
|---|---|
| **Type** | `CNAME` |
| **Name** | `admin` |
| **Value / Points To** | `2adf077dff9f1309.vercel-dns-017.com.` |
| **TTL** | Leave as default, or type `3600` |

---

### Save All Records

After adding all 3 records, make sure you have clicked **Save** after each one. GoDaddy does not save automatically — if you close the page without saving, the records will be lost and you will need to add them again.

To double-check, look at your DNS records list. You should now see your new records in the table.

---

## Part 4 — What Happens Next

Once you have saved all 3 records, the internet needs a little time to learn about your new setup. This is called **DNS propagation** and it is completely normal.

| Timeframe | What to Expect |
|---|---|
| **5–30 minutes** | Your website will start working for most people |
| **Up to 48 hours** | A small number of internet providers may take longer to update |

During this time your developer will:
- Confirm the domain is connected in Vercel (the hosting platform)
- Update some settings on the back end so everything points to the right place
- Test that both your website and admin panel are working correctly

**You do not need to do anything during this waiting period.** Just let your developer know you have finished adding the records.

---

## Part 5 — How to Check if It's Working

Once the waiting period is over, you can check if everything is set up correctly by:

1. Opening a new browser tab
2. Typing `https://taxpicker.com` in the address bar and pressing Enter
3. Your website should load

If it is not working after 48 hours, let your developer know and they will help troubleshoot.

You can also check propagation progress yourself using this free tool:

🔗 **dnschecker.org** — Type in your domain name, select **A** as the record type, and click Search. When most of the coloured dots turn green, your domain has propagated successfully.

---

## Troubleshooting — Common Issues

### "I can't find the Add New Record button"
Make sure you are on the **DNS tab** of your domain settings, not the general settings page. The button is usually labelled **Add New Record** or just **Add** and appears near the top right of the records table.

### "I accidentally deleted an existing record"
Contact your developer straight away. Do not try to re-add it yourself unless you know exactly what it was. Your developer can help restore it.

### "The Type dropdown doesn't have 'A' or 'CNAME'"
GoDaddy's interface sometimes shows a search box or a filter instead of a dropdown. Click on it and type `A` or `CNAME` to find the correct option.

### "It's been 48 hours and my website still isn't loading"
Double check that:
- The records were saved (check the DNS records list in GoDaddy)
- The values were entered exactly as shown — no extra spaces or characters
- Let your developer know so they can check the Vercel configuration as well

### "I see a GoDaddy page instead of my website"
This usually means the A record was saved but the Vercel setup has not been completed yet. Let your developer know you have finished the DNS setup and they will finalise the configuration on their end.

---

## Summary — Quick Reference

Here are all 3 records you need to add, in one place for easy reference:

| Type | Name | Value / Points To | TTL |
|---|---|---|---|
| `A` | `@` | `216.198.79.1` | `600` |
| `CNAME` | `www` | `2adf077dff9f1309.vercel-dns-017.com.` | `3600` |
| `CNAME` | `admin` | `2adf077dff9f1309.vercel-dns-017.com.` | `3600` |

---

## Need Help?

If you get stuck at any point, don't worry — just reach out to your developer and they will walk you through it. You can also contact GoDaddy support directly:

- **GoDaddy Help Centre:** godaddy.com/help
- **GoDaddy Phone Support:** Available 24/7 — the number is listed when you log in to your account

---