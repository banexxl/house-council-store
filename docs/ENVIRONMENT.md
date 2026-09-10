# Environment Variables

Reconstructed from `.env` key names (values are secret and were **not** read) cross-referenced
with actual usages found via search. "Used?" reflects whether a `process.env.<NAME>` reference was
found anywhere in `app/`, `middleware.ts`, etc. during this documentation pass — "Not found" does
not guarantee the variable is truly dead (search was targeted, not exhaustive across every file),
but it's a strong signal worth double-checking before removing it.

## Supabase

| Variable | Used? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL, used by every Supabase client variant (browser, anon server, service-role server, webhook plain client) |
| `NEXT_PUBLIC_SB_CLIENT_KEY` | Yes | Public **anon** key |
| `SB_SERVICE_KEY` | Yes | **Service role** key — bypasses RLS; used server-side only (account deletion, webhooks, admin lookups) |
| `NEXT_PUBLIC_SUPABASE_URL_LOCALHOST` | Not found | Presumably a local-dev override; no reference found in the reviewed code |
| `SUPABASE_RESET_PASSWORD_REDIRECT_URL` | Yes | Redirect target after a password-reset email link |

## Polar (billing)

| Variable | Used? | Purpose |
|---|---|---|
| `POLAR_ACCESS_TOKEN` | Yes | Production Polar API token |
| `POLAR_ACCESS_TOKEN_SANDBOX` | Yes | Sandbox Polar API token, used automatically when `NODE_ENV === "development"` |
| `POLAR_WEBHOOK_SECRET_{BENEFIT,CHECKOUT,CUSTOMER,ORDER,ORGANIZATION,PRODUCT,REFUND,SUBSCRIPTION}` | Yes (all 8) | Per-event-category webhook signature secrets, one per Route Handler under `app/api/polar/webhook/*` |

## App URLs / links

| Variable | Used? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Yes | Used to build absolute success/return URLs for Polar checkout and the registration email redirect |
| `NEXT_PUBLIC_DASHBOARD_URL` | Yes | External building-manager dashboard app, linked from the header |
| `NEXT_PUBLIC_ANDROID_APP_URL` | Yes | Google Play link shown on the docs page (falls back to "Soon available" text) |
| `NEXT_PUBLIC_IOS_APP_URL` | Yes | App Store link shown on the docs page (same fallback pattern) |

## Email

| Variable | Used? | Purpose |
|---|---|---|
| `EMAIL_SERVER_HOST` / `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASSWORD` | Yes | Nodemailer SMTP transport (port 465/SSL hardcoded) for trial-ending, subscription-ending, registration, and contact-form emails |

## Rate limiting

| Variable | Used? | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis for the contact-form rate limiter (3 req/hour per email) |

## Maps

| Variable | Used? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` | Yes | Contact page's embedded Google Map |
| `NEXT_PUBLIC_MAPBOX_API_KEY` / `NEXT_PUBLIC_MAPBOX_MAP_READ_WRITE_API_KEY` | Not found | No Mapbox usage found in reviewed files — possibly used by the address-autocomplete component ([`app/profile/components/address-autocomplete.tsx`](../app/profile/components/address-autocomplete.tsx)) not read in full, or a leftover from an earlier maps provider choice |

## Storage / data (AWS)

| Variable | Used? | Purpose |
|---|---|---|
| `AWS_S3_BUCKET_NAME` | Yes | Bucket name passed to **Supabase Storage** calls (`sb-storage.ts`) — despite the `AWS_` prefix, uploads go through the Supabase Storage API, not the AWS SDK directly; this bucket is presumably Supabase Storage backed by S3-compatible infra, or Supabase's storage is configured to proxy to this bucket name |
| `AWS_S3_ACCESS_KEY` / `AWS_S3_SECRET_KEY` / `AWS_S3_REGION` | Not found | No direct AWS SDK usage found — likely configured on the Supabase project side rather than read directly by this app |
| `AWS_DATAEXCHANGE_*` (5 vars) | Not found | No usage found anywhere in `app/`; likely unused in this repo (possibly used by a data pipeline elsewhere, or dead config) |

## Misc / other

| Variable | Used? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_LAYER_KEY` | Not found | Likely for [apilayer.com](https://apilayer.com) services (e.g. phone/IP lookups) — no call site found |
| `NEXT_PUBLIC_BIN_CHECKER_API_KEY` | Not found | Likely a card BIN-lookup API key, consistent with the unused card-entry UI in `ClientBillingInformation` — see [OBSERVATIONS.md](./OBSERVATIONS.md) |
| `NEXT_PUBLIC_ENABLE_REDUX_DEV_TOOLS` | Not found | No Redux in `package.json` dependencies — stale leftover flag |
| `NEXT_PUBLIC_GTM_CONTAINER_ID` | Not found (a GTM id is hardcoded instead) | `app/layout.tsx` hardcodes `AW-18137335805` directly in the `<script>` tag rather than reading this env var — see [OBSERVATIONS.md](./OBSERVATIONS.md) |
| `POSTGRES_*` (7 vars: `DATABASE`, `HOST`, `PASSWORD`, `PRISMA_URL`, `URL`, `URL_NON_POOLING`, `USER`) | Not found | Standard Vercel/Supabase Postgres connection-string set; no direct Postgres client (e.g. `pg`, Prisma) exists in `package.json`, so these are unused by this app — likely provisioned automatically by the hosting platform and inherited into `.env` without being consumed |
| `STRIPE_API_URL` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` | Not found | No `stripe` package in `package.json` and no Stripe SDK usage found — billing is done entirely through Polar (which itself may use Stripe as a payment rail internally, but this app never talks to Stripe directly) |

## Notes for anyone auditing this list

- Values were intentionally **not** read or logged anywhere in this documentation — only variable
  *names* from `.env` were enumerated (`grep -o '^[A-Z_0-9]*=' .env`).
- "Not found" entries are candidates for cleanup but should be verified against the **dashboard**
  and **mobile** repos too, since `.env` may be shared/copy-pasted across the multi-app NestLink
  system described in [ARCHITECTURE.md](./ARCHITECTURE.md).
