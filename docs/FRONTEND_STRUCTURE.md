# Frontend Structure

## Routes (App Router)

| Route | File | Auth | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` → `home.tsx` | Public | Marketing landing page (hero, feature grid, workflows, pricing teaser, FAQ, CTA) |
| `/docs` | `app/docs/page.tsx` → `docs.tsx` | Public | End-user product documentation: searchable, hash-linked sections, role/tag chips, product tour video |
| `/pricing` | `app/pricing/page.tsx` → `pricing.tsx` | Public (checkout requires sign-in) | Plan/interval picker, per-apartment price calculator, Polar checkout/portal actions, FAQ |
| `/pricing/subscription-plan-purchase/success` \| `/error` | — | Public | Post-checkout redirect targets from Polar |
| `/contact` | `app/contact/page.tsx` | Public | Contact form + Google Map, rate-limited email send |
| `/privacy-policy`, `/terms-and-conditions` | — | Public | Static legal pages |
| `/auth/sign-in` | `sign-in.tsx` | Public (bounces if fully authed) | Email/password + Google OAuth + TOTP OTP step |
| `/auth/register` | `register.tsx` | Public | Sign-up form |
| `/auth/registration-confirmation` | — | Public | "Check your email" + resend |
| `/auth/registration-confirmed` | — | Public | Post-email-confirmation landing (signs the session out again) |
| `/auth/forgot-password`, `/auth/forgot-password/result` | — | Public | Password reset request flow |
| `/auth/reset-password` | — | Public | Set new password from reset link |
| `/auth/callback` | `route.ts` | Public | OAuth (Google) redirect handler |
| `/auth/invite-user` | `route.ts` | Public | Tenant/user invite acceptance endpoint |
| `/auth/error` | — | Public | Generic auth error page (always allowed by middleware) |
| `/profile` | `profile.tsx` | **Protected** | Sidebar (avatar, member-since, recent activity) + tabbed content (Account, Security, Subscription, Notifications) |
| `/api/polar/**` | route handlers | Mixed | Checkout, customer portal, cancel/reactivate, 8 webhook receivers — see [BILLING_POLAR.md](./BILLING_POLAR.md) |

"Protected" = everything not in the middleware's `publicRoutes` allowlist; see
[AUTH_AND_SECURITY.md](./AUTH_AND_SECURITY.md).

## Profile page composition

```
ProfilePage (profile.tsx)
├─ ProfileSidebar
│   ├─ Avatar upload/delete (Supabase Storage, bucket from AWS_S3_BUCKET_NAME via sb-storage.ts)
│   ├─ Member-since, email verified badge
│   ├─ "Recent Activity" — last 5 tblServerLogs rows (type='auth') for this user
│   └─ Menu → Edit Profile (opens Polar customer portal) / Forgot password / Logout
└─ ProfileTabs
    ├─ AccountTab       — read-only display of the Polar customer record (name, email, billing address, tax IDs, timestamps)
    ├─ SecurityTab       — change password, enable/verify/disable TOTP 2FA, delete account
    ├─ SubscriptionTab   — current plan, status, billing cycle, meter-based usage breakdown, cancel dialog, payment history (paginated), customer portal / plan-select buttons
    └─ NotificationsTab  — UI shell for toggling notification preferences (see OBSERVATIONS.md — not wired to persistence in this repo)
```

## Shared components (`app/components/`)

- `header.tsx` — fixed AppBar that shrinks on scroll (`useScrollTrigger`), responsive drawer on
  mobile, shows Sign In vs. Profile/Dashboard/Sign Out depending on session, links out to the
  external dashboard app.
- `footer.tsx` — site footer (not read in detail here, but present on marketing/auth pages).
- `motion.tsx` — `Reveal` (fade/slide-in on mount) and `Stagger`/`itemVariants` (staggered grid
  children) Framer Motion helpers used throughout marketing pages.
- `animation-framer-motion.tsx` (`Animate`) — generic page-transition wrapper used by most
  non-landing pages (pricing, profile, docs, sign-in, etc.).
- `paralax-section.tsx` — hero background parallax image wrapper, loaded eagerly for LCP.
- `particle-background.tsx` — decorative canvas/particle effect, lazy-loaded and only rendered on
  desktop breakpoints to protect mobile performance.
- `google-map.tsx` — wraps the Google Maps JS API for the contact page, keyed by
  `NEXT_PUBLIC_GOOGLE_MAP_API_KEY`.

Performance-conscious patterns worth noting: `home.tsx` explicitly defers non-critical animation
(`requestIdleCallback`) and lazy-loads the particle background, only rendering it under
`useMediaQuery(theme.breakpoints.up('md'))`.

## Theming

[`app/theme.ts`](../app/theme.ts) — MUI theme with a warm brand palette (primary orange `#f79622`,
secondary dark maroon `#4a1005`), "Plus Jakarta Sans" typography, rounded buttons/cards (8px/12px
radius), no-uppercase button text, and custom thin scrollbar styling injected globally via
`MuiCssBaseline`. `Providers` (`app/providers.tsx`) wraps the whole app in `ThemeProvider` +
`CssBaseline` + a global `react-hot-toast` `<Toaster>`.

## SEO

- `app/sitemap.ts`, `app/robots.ts` — programmatic sitemap/robots generation.
- `app/lib/seo.ts` — `buildCanonicalUrl(path)` helper used by page-level `generateMetadata`/
  `metadata` exports (see `contact/page.tsx` for an example) to set canonical URLs and
  OpenGraph/Twitter metadata per page.
- Root layout injects Google Tag (gtag.js) for `AW-18137335805` unconditionally (no consent gate
  visible in this repo — see [OBSERVATIONS.md](./OBSERVATIONS.md)).

## Forms & validation

- **Formik + Yup**: registration (`register-schema.ts`), sign-in (`sign-in-schema.ts`), password
  change/reset (`reset-password-utils.ts`).
- **react-hook-form** is a declared dependency but no usage was found in the files read for this
  documentation pass — may be used in a page not covered, or a leftover dependency.
- Toasts (`react-hot-toast`) are the universal feedback mechanism for async action
  success/failure across the whole app; `sweetalert2` is also a dependency but wasn't observed in
  the pages read (possibly used for a confirm-dialog elsewhere).
