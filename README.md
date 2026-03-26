# Golf Charity — Subscription Platform

A subscription-based golf platform combining Stableford score tracking, monthly prize draws, and charitable giving.

Built with **React + TypeScript + Vite + Supabase + Stripe**.All PRD features implemented — subscription engine, score tracking, monthly draw system, prize pool distribution, charity integration, winner verification, and full admin control pane

## Live Demo:  https://golf-charity-beta.vercel.app 

**User Dashboard:** https://golf-charity-beta.vercel.app/dashboard
Test User Login: Email: testuser@golfcharity.com 
Password: Test1234!

**Admin Panel Login**: URL: https://golf-charity-beta.vercel.app/admin 
Email: admin@golfcharity.com
Password: Admin1234!





## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **Payments:** Stripe Subscriptions
- **Email:** Resend API
- **Deployment:** Vercel

---

## Features

- Monthly/yearly subscription plans ($19.99/mo or $199.99/yr)
- Stableford score entry (1–45) with rolling 5-score limit
- Monthly draw engine (random or algorithmic mode)
- Prize pool distribution: 40% (5-match), 35% (4-match), 25% (3-match)
- 5-match jackpot rollover if unclaimed
- Charity selection at signup with configurable contribution %
- Winner proof upload + admin verification workflow
- Full admin panel: users, draws, charities, winners, analytics
- Email notifications via Resend

---

## Local Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd golf-charity

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# 4. Run the database schema
# Go to Supabase Dashboard → SQL Editor → paste contents of supabase_schema.sql

# 5. Start dev server
npm run dev
```

---

## Supabase Edge Function Secrets

In Supabase Dashboard → Edge Functions → Manage Secrets, add:

| Key | Value |
|-----|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for monthly plan |
| `STRIPE_PRICE_YEARLY` | Stripe price ID for yearly plan |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Your Resend API key |

---

## Supabase Storage

Create a public bucket named **`proofs`** in Supabase Dashboard → Storage.

---

## Create Admin User

After signing up with your admin email, run this in Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
);
```

---

## Deploy to Vercel

1. Push code to GitHub
2. Import repo in Vercel (use a new Vercel account per PRD requirements)
3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

---

## PRD Compliance

| Requirement | Status |
|-------------|--------|
| Subscription engine (monthly/yearly) | ✅ |
| Stripe payment gateway | ✅ |
| Score entry (1-45, rolling 5) | ✅ |
| Monthly draw (random + algorithmic) | ✅ |
| Prize pool distribution (40/35/25%) | ✅ |
| Jackpot rollover | ✅ |
| Charity selection + contribution % | ✅ |
| Charity directory with search | ✅ |
| Featured charity on homepage | ✅ |
| Winner proof upload + verification | ✅ |
| User dashboard (all modules) | ✅ |
| Admin panel (full control) | ✅ |
| Email notifications | ✅ |
| Auth protection on all routes | ✅ |
| Mobile-first responsive design | ✅ |
| Supabase backend + RLS | ✅ |
