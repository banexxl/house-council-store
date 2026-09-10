# Architecture

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router), React 18, TypeScript | `next.config.ts`, `app/` directory |
| UI | **MUI v7** (`@mui/material`, `@mui/icons-material`) + Emotion | Custom theme in [`app/theme.ts`](../app/theme.ts) |
| Forms | **Formik + Yup** (some pages) and **react-hook-form** (dependency present) | e.g. security tab password form uses Formik |
| Animation | **Framer Motion**, custom `Reveal`/`Stagger` wrappers | [`app/components/motion.tsx`](../app/components/motion.tsx) |
| Auth & DB | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) | Postgres + Auth + Storage + Realtime, shared with the dashboard/mobile apps |
| Billing | **Polar.sh** (`@polar-sh/sdk`, `@polar-sh/nextjs`) | Checkout, Subscriptions, Customer Portal, Webhooks |
| Rate limiting | **Upstash Redis + `@upstash/ratelimit`** | Used for the contact form (3 req/hour per email) |
| Email | **Nodemailer** via a generic SMTP host | Transactional emails (trial ending, registration notice, contact form) |
| Notifications (browser) | **react-hot-toast**, **sweetalert2** | |
| Misc | `qrcode`/`qrcode.react` (tenant invite QR codes), `bcryptjs`, `date-fns` | |

## Repo layout (App Router)

```
app/
  page.tsx, home.tsx            → "/" marketing landing page
  layout.tsx, providers.tsx     → root layout (theme, header, GTM tag), fetches session user server-side
  theme.ts                      → MUI theme
  middleware.ts (at repo root)  → route protection + MFA enforcement (see AUTH_AND_SECURITY.md)

  auth/                         → sign-in, register, forgot/reset password, email confirmation,
                                   invite-user, OAuth callback — all under /auth/*
  pricing/                      → plan display + Polar checkout kickoff, post-checkout success/error pages
  profile/                      → signed-in account area: sidebar + tabbed content
    components/tabs/            → account-tab, security-tab, subscription-tab, notifications-tab
  docs/                         → END-USER product documentation single-page app (searchable, hash-linked)
  contact/                      → contact form (Google Map + rate-limited email send)
  privacy-policy/, terms-and-conditions/
  api/polar/                    → all server-side Polar integration (see BILLING_POLAR.md)
    route.ts                    → POST create checkout, DELETE cancel subscription, PUT reactivate
    customer-portal/route.ts    → creates a Polar customer-portal session URL
    webhook/{benefit,checkout,customer,order,organization,product,refund,subscription}/route.ts
                                 → one Polar webhook endpoint per event category, each with its
                                   own signing secret, upserting into the mirrored Supabase tables

  lib/                          → server/client utilities (Supabase clients, Polar client, logging,
                                   2FA actions, storage, realtime, rate limiter, mailer, ...)
  types/                        → shared TS types: BaseEntity, Feature, ClientBillingInformation,
                                   and a full set of Polar domain types (customer/product/order/
                                   subscription/benefit/refund/organization/checkout)
  components/                   → header, footer, motion helpers, particle/parallax backgrounds,
                                   Google Map wrapper
```

## Multi-app system (bigger picture)

This repository is **one of several apps** that make up the NestLink product, all sharing one
Supabase project (same Postgres DB, same Auth users):

```
                         ┌─────────────────────────────┐
                         │   Supabase (Postgres, Auth,  │
                         │  Storage, Realtime) — shared │
                         └───────┬───────────┬──────────┘
                                 │           │
      ┌──────────────────────────┘           └───────────────────────────┐
      │                                                                   │
┌─────▼────────────────────────┐                             ┌───────────▼─────────────┐
│ THIS REPO ("nest-link-app")  │  NEXT_PUBLIC_DASHBOARD_URL   │  Building-manager        │
│ Marketing + Auth + Billing   │ ────────────────────────────▶│  dashboard web app       │
│ + Account/Profile self-serve │   (external, separate repo)  │  (buildings, apartments, │
│                               │                              │  tenants, announcements, │
│ Also talks to Polar.sh API   │                               │  polls, incidents CRUD)  │
└───────────────────────────────┘                             └──────────────────────────┘
                                                                            ▲
                                                              NEXT_PUBLIC_ANDROID_APP_URL /
                                                              NEXT_PUBLIC_IOS_APP_URL
                                                                            │
                                                                ┌───────────┴─────────────┐
                                                                │  Tenant mobile app       │
                                                                │  (iOS/Android, external) │
                                                                └──────────────────────────┘
```

Evidence for this split:
- The header ([`app/components/header.tsx`](../app/components/header.tsx)) renders a "Dashboard"
  button that opens `process.env.NEXT_PUBLIC_DASHBOARD_URL` in a new tab — it does not route
  within this Next.js app.
- The in-app docs describe full CRUD workflows (buildings, apartments, tenants, announcements,
  polls, incidents) that have **no corresponding pages, components, or server actions anywhere in
  this repo** — only read-only helpers exist here (e.g. `readAllApartmentsByClientId`,
  `getApartmentCountForCustomer`), used purely to compute the per-apartment subscription price and
  show it in the account/profile UI.
- `.env` declares `NEXT_PUBLIC_ANDROID_APP_URL` / `NEXT_PUBLIC_IOS_APP_URL` for linking to native
  app stores from the docs page — those apps are not part of this codebase.

## Data flow for billing (high level)

1. A signed-up user has a row in Supabase `auth.users` **and** a mirrored row in
   `tblPolarCustomers` (created via `polar.customers.create(...)` at registration time, with
   `externalId` = Supabase user id — see [`app/auth/register/register-action.ts`](../app/auth/register/register-action.ts)).
2. Product/price catalog is mirrored from Polar into `tblPolarProducts` /
   `tblPolarProductPrices` / `tblPolarProductBenefits` via the `product`/`benefit` webhooks, and
   read from Supabase (not the Polar API) whenever pricing is displayed
   ([`app/profile/subscription-plan-actions.ts`](../app/profile/subscription-plan-actions.ts)).
3. Checkout is created live via the Polar API (`POST /api/polar`), redirecting the user to a
   Polar-hosted checkout page.
4. Polar sends webhooks back to `/api/polar/webhook/*` for every lifecycle event (subscription
   created/updated/active/canceled/revoked, orders paid/refunded, customer state changes, etc.);
   each handler **upserts** the corresponding Supabase table using the **service-role** Supabase
   client (bypassing RLS) so that reads elsewhere in the app stay fast and don't depend on Polar
   uptime.
5. `Subscription.amount` stored in Supabase is deliberately **multiplied by the customer's live
   apartment count** at webhook-write time (`convertToPolarSubscription` in
   [`app/api/polar/webhook/subscription/route.ts`](../app/api/polar/webhook/subscription/route.ts)) —
   i.e. Polar's own per-seat/meter billing is being reconciled with a Supabase-computed apartment
   count rather than trusted as the sole source of truth. See
   [OBSERVATIONS.md](./OBSERVATIONS.md) for a caveat about this.
6. The `/profile` subscription tab also subscribes to **Supabase Realtime** changes on
   `tblPolarSubscriptions` filtered by subscription id, so a webhook-driven DB update is reflected
   in the open browser tab without a manual refresh
   ([`app/lib/sb-realtime.ts`](../app/lib/sb-realtime.ts)).

## Rendering strategy

- Root layout uses `export const revalidate = 60` (ISR) and does a server-side session fetch
  (`getSessionUser`) so the header can render signed-in vs. guest state without a client flash.
- Most interactive pages are `"use client"` components fed by server actions
  (`'use server'` files) rather than traditional API routes, except for the Polar
  checkout/webhook/customer-portal endpoints, which are real Next.js Route Handlers because they
  need to be called from the browser (`fetch`) or from Polar's servers.
