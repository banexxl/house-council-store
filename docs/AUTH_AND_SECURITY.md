# Authentication & Security

Auth is entirely **Supabase Auth** (email/password + Google OAuth), with an optional **TOTP-based
2FA** layered on top using Supabase's native MFA/AAL (Authenticator Assurance Level) support.

## Supabase client variants

Three different Supabase client factories exist, each for a distinct trust context:

| File | Key used | Context | Use case |
|---|---|---|---|
| [`sb-browser-client.ts`](../app/lib/sb-browser-client.ts) | `NEXT_PUBLIC_SB_CLIENT_KEY` (anon) | Browser | Realtime subscriptions, client components |
| [`ss-supabase-anon-client.ts`](../app/lib/ss-supabase-anon-client.ts) | `NEXT_PUBLIC_SB_CLIENT_KEY` (anon) | Server (cookie-bound via `@supabase/ssr`) | Server actions/pages that should respect RLS as the logged-in user |
| [`ss-supabase-service-role-client.ts`](../app/lib/ss-supabase-service-role-client.ts) | `SB_SERVICE_KEY` (service role) | Server (cookie-bound via `@supabase/ssr`) | Server actions/webhooks that must bypass RLS (e.g. deleting a user, admin lookups, inserting audit logs) — notably it's still built with `createServerClient` (cookie-aware) rather than a plain `createClient`, so it can both read the caller's session **and** act with service-role table privileges in the same client. See [OBSERVATIONS.md](./OBSERVATIONS.md). |

Webhook route handlers use a fourth pattern: a **plain** `createClient(url, SB_SERVICE_KEY)` with
no cookie plumbing at all (correct, since a webhook has no user session).

## Registration flow

[`app/auth/register/register-action.ts`](../app/auth/register/register-action.ts):

1. Validate required fields + password confirmation match (client-side Yup schema in
   `register-schema.ts` additionally requires 8+ chars, upper/lower/digit/special character).
2. Check `tblTenants` and `tblPolarCustomers` for an existing email → reject with `EmailInUse` if
   found (checked in two different tables because a person could already exist as a tenant or as a
   client).
3. `supabaseAdmin.auth.signUp(...)` with `emailRedirectTo` → `/auth/registration-confirmed`.
4. Create a **Polar customer** (`polar.customers.create`) with `externalId` = the new Supabase
   user id — this is the join key between Supabase Auth and Polar/billing data everywhere else in
   the app.
5. **Compensating rollback**: if Polar customer creation throws for any reason other than
   "already exists", the just-created Supabase auth user is deleted
   (`supabaseAdmin.auth.admin.deleteUser(userId)`) so the system doesn't end up with an
   auth-user-without-a-billing-customer.
6. Every branch (success/failure) is recorded via `logServerAction` into `tblServerLogs`.

`/auth/registration-confirmation` handles "check your email" messaging and can resend the
confirmation email; `/auth/registration-confirmed` is the landing page after the user clicks the
email link (it signs the user out again immediately per a recent commit, forcing an explicit
sign-in rather than relying on the confirmation-link session).

## Sign-in flow (with 2FA)

[`app/auth/sign-in/sign-in.tsx`](../app/auth/sign-in/sign-in.tsx):

1. Before even attempting Supabase sign-in, `checkUserPermissionServer(email)` runs
   ([`check-user-server-action.ts`](../app/auth/sign-in/check-user-server-action.ts)) to short-circuit
   with a specific, user-friendly error for: email belongs to a tenant (should sign in
   differently), no matching Polar customer, incomplete registration (`externalId` missing), or a
   restricted **`client_status`** stored in the Supabase auth user's `user_metadata`
   (`inactive` / `pending_activation` / `suspended` / `archived` all block sign-in with a tailored
   message). This is effectively an account-status gate that Supabase's own password check
   doesn't provide.
2. `supabase.auth.signInWithPassword(...)` — on success this yields an **AAL1** session.
3. The client then calls `auth.mfa.listFactors()`. If a **verified TOTP factor** exists, it does
   **not** finish sign-in yet: it creates an MFA challenge and shows a 6-digit code input instead.
   If no verified TOTP factor exists, sign-in completes immediately with a full page reload
   (`window.location.replace("/")`, chosen deliberately over client-side navigation so
   server-rendered cookies are picked up fresh).
4. Submitting the code calls `auth.mfa.verify(...)`, which upgrades the session to **AAL2**, then
   also does a full reload to `/`.
5. Google OAuth (`signInWithOAuth({ provider: "google" })`) redirects through
   `/auth/callback` ([`route.ts`](../app/auth/callback/route.ts)), which is on the middleware's
   public-route allowlist.
6. Query-string driven info banners (`?message=sign_in_required|session_expired|trial_expired|
   2fa_required`) let other parts of the app (e.g. the pricing page, or the middleware's MFA
   redirect) explain *why* the user landed back on sign-in.

## Two-Factor Authentication (TOTP)

Implemented with Supabase's built-in MFA API, wrapped by
[`app/lib/account-2fa-actions.ts`](../app/lib/account-2fa-actions.ts) (server actions) and used
from the Security tab and the sign-in page:

- **Enroll**: `auth.mfa.enroll({ factorType: 'totp', friendlyName, issuer: 'NestLink' })` →
  returns a QR code + secret shown to the user.
- **Verify enrollment**: `auth.mfa.challenge` then `auth.mfa.verify` with the 6-digit code the
  user scans/types — only after this does the factor become `status: 'verified'`.
- **Disable**: also challenge-then-verify (proves possession) before `auth.mfa.unenroll`.
- Every step is audited via `logServerAction` (type `auth`).

## Route protection — `middleware.ts`

The **only** enforcement point for "is this route allowed for this session" is the root
[`middleware.ts`](../middleware.ts), matched against almost every path (it excludes
`api/`, `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, `sitemap.xml`, and static
image extensions — note **all `/api/*` routes are excluded from the matcher**, so Polar routes and
webhooks are never touched by this middleware and must protect themselves independently, which
they do via Polar's webhook signature verification and, for the checkout/portal routes, by not
requiring auth at all since they take an explicit `customerId`/`polarCustomerId` in the body).

Logic, in order:
1. Build a `publicRoutes` allowlist (`/`, all of `/auth/*` except protected areas, `/pricing`,
   `/contact`, `/docs`, `/privacy-policy`, `/terms-and-conditions`, `/api/polar` prefixes,
   `/videos`, `/robots.txt`).
2. `/auth/error*` is always allowed through immediately (avoids redirect loops when auth itself is
   broken).
3. Fetch both `getSession()` and `getUser()`. If neither exists, redirect non-public routes to
   `/auth/sign-in`.
4. **AAL enforcement**: decode the JWT payload's `aal` claim directly (`getAalFromJwt`, a small
   base64url decode — not a signature check, since this only needs to *read* a claim already
   verified by Supabase, not authenticate the token itself). If the session is AAL1 (password
   only) **and** the user has a verified TOTP factor enrolled, every protected route redirects to
   `/auth/sign-in?mfa=1&next=<path>` so they must complete the OTP step. If listing factors fails,
   the middleware **fails open** (does not force MFA) — an explicit choice to avoid user lockouts,
   called out in a code comment.
5. **Bounce logged-in users away from auth pages** (`sign-in`, `register`,
   `registration-confirmation`, `registration-confirmed`): if AAL2, redirect to `/`. If AAL1 with
   no verified TOTP, also redirect to `/` (they're already fully logged in as far as the app is
   concerned). If AAL1 **with** a verified TOTP (mid-2FA), `/auth/sign-in` is deliberately left
   accessible so they can finish entering the code.
6. Verbose `console.log` calls print method/path/session/user on every request — see
   [OBSERVATIONS.md](./OBSERVATIONS.md) re: log verbosity/PII in server logs.

There's a **duplicate, slightly different implementation** of the "is this user really logged in"
check in [`app/lib/get-session.ts`](../app/lib/get-session.ts) (`getSessionUser`, used by the root
layout to decide what the header renders) — it takes the *opposite* failure mode from the
middleware when `listFactors()` errors (returns `null`/logged-out, i.e. fails **closed**, vs. the
middleware's fail-open). Worth keeping in sync if the MFA policy changes; see
[OBSERVATIONS.md](./OBSERVATIONS.md).

## Password management

- **Forgot password** (`/auth/forgot-password`): looks up `tblPolarCustomers` by email
  ([`forgot-password-actions.ts`](../app/auth/forgot-password/forgot-password-actions.ts)) and
  triggers Supabase's password-reset email flow, redirecting via
  `SUPABASE_RESET_PASSWORD_REDIRECT_URL`.
- **Change password with old password** (Security tab): validated by a Yup schema
  requiring 8+ chars and upper/lower/digit (message text also mentions "special character" but the
  regex doesn't actually require one — see [OBSERVATIONS.md](./OBSERVATIONS.md)); a password
  strength meter (0–100, four 25-point buckets: length, uppercase, lowercase, digit — special
  characters are not scored) gives live feedback.
- **Delete account** (Security tab): type-to-confirm ("delete") UI, then
  `deleteAccountAction(userId, email)` — signs the user out, deletes the Supabase auth user, then
  deletes the matching Polar customer via the Polar API. The UI explicitly warns this cascades to
  "all added buildings, units, and associated data."

## Rate limiting

Only the **contact form** is rate-limited today, via Upstash Redis
(`Ratelimit.slidingWindow(3, "1 h")` keyed by `contact:<lowercased email>` — see
[`app/lib/rate-limiter.ts`](../app/lib/rate-limiter.ts) and its use in
[`node-mailer.ts`](../app/lib/node-mailer.ts)). Sign-in/registration have no application-level
rate limiting beyond whatever Supabase Auth itself enforces.

## Audit logging

`logServerAction` (server) and `logClientAction` (client) write structured entries to
`tblServerLogs` for essentially every meaningful action across auth, billing, storage, and
webhooks — status (`success`/`fail`), a free-text `action` label, a JSON `payload`, timing, and an
error string. This is the closest thing to an audit trail / activity feed in the product; the
profile sidebar's "Recent Activity" list is read straight from this table, filtered to
`type = 'auth'` for the current user
([`readClientRecentActivityAction`](../app/profile/account-action.ts)).
