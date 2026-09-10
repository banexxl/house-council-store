# Observations, Inconsistencies & Open Questions

Notes collected while reading the codebase end-to-end. These are **observations, not directives**
— nothing here has been changed; flagging them so a future reader (or future work session)
doesn't have to rediscover them. Severity is informal (🐞 likely bug, ⚠️ inconsistency/smell,
❓ open question, 🧹 cleanup candidate).

## Billing

- 🐞 **`isSubscriptionPlanInStatus` likely always returns `false`.**
  [`app/api/polar/route.ts`](../app/api/polar/route.ts) queries
  `.from("tblPolarSubscriptions").select("status", ...).eq("polar_subscription_id", id)`, but
  every other read/write of that table in this repo uses the column name **`id`**
  (`tblPolarSubscriptions.id`), not `polar_subscription_id`. If that column doesn't exist, the
  `.eq()` filter would either error (caught, returns `false`) or match nothing — meaning the
  "already canceled" short-circuit in the `DELETE /api/polar` cancel flow is effectively dead, and
  every cancel request falls through to calling `polar.subscriptions.revoke` regardless of current
  status. Matches the README's own bug note referencing a "foreign key constraint" issue around
  card/subscription deletion.
- ⚠️ **Locally-recomputed subscription `amount`.** The subscription webhook multiplies Polar's
  reported `amount` by a live-queried apartment count at write time
  (`convertToPolarSubscription` in `app/api/polar/webhook/subscription/route.ts`). If Polar itself
  already bills per-seat/meter (there's `PolarActiveMeter`/`seats` support in the types), this
  could double-count, or drift from what Polar actually charged if the apartment count changes
  between the webhook firing and being read later. Worth confirming which side (Polar's meter, or
  this local multiplication) is the actual source of charged amounts.
- ⚠️ **Checkout doesn't pass an explicit seat/quantity to Polar.** `POST /api/polar` computes
  `apartmentsCount` via `getApartmentCountForClient` but never forwards it into
  `polar.checkouts.create(...)` — the variable is unused for anything but a comment ("server-truth
  seats"). If Polar prices are meant to scale by quantity, that quantity isn't being set from this
  call; it may rely entirely on Polar's own meter/usage system in that case, or the
  `seats` field elsewhere.
- 🧹 **`benefit` and `refund` webhooks are stubs.** `webhook/benefit/route.ts` only logs; no
  `tblPolarBenefit*` table is ever written. `webhook/refund/route.ts` registers zero event
  handlers at all (commented-out TODO). Since `PolarRefund`/`PolarBenefit*` types already exist in
  `app/types/`, the intent to eventually store them is clear but not implemented.
- ⚠️ **Reactivate-subscription UI is unreachable.** `PUT /api/polar` (reactivate/uncancel) has a
  full server implementation, but the only client entry point
  ([`subscription-tab.tsx`](../app/profile/components/tabs/subscription-tab.tsx)) has the
  "Reactivate Subscription" button commented out.
- ❓ **Stripe env vars with zero usage.** `.env` declares `STRIPE_API_URL`,
  `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`; `package.json` has no `stripe` dependency and no
  code references them. Likely leftover from before the Polar migration, or shared boilerplate
  `.env` inherited from another project.

## Data model

- ⚠️ **Inconsistent identifier/column casing across the schema.** Polar-mirror tables use
  `camelCase` columns (`customerId`, `createdAt`, `isArchived`), while domain tables use
  `snake_case` (`client_id`, `building_id`, `created_at`). `tblBuildings` appears to have **both**
  a `client_id` (snake_case) and a `customerId` (camelCase) concept for "who owns this building" —
  worth confirming these are the same column/value and not two parallel, possibly-drifting owner
  references.
- 🧹 **`ClientBillingInformation` type and `luhnCheck` card validator appear unused.** No server
  action or component in this repo reads/writes `ClientBillingInformation` or calls
  `luhnCheck` (`app/lib/card-validator.ts`) — billing is delegated entirely to Polar's hosted
  checkout/portal, which handles card entry itself. These look like remnants of an earlier,
  directly-integrated card-payment design.
- 🧹 **`Currency` and `Feature`/`base-entity-actions.ts` generic helpers are thin/unused beyond one
  call site.** `readFeaturesFromSubscriptionPlanId` is the only consumer of the `Feature` shape;
  `readEntity`/`readAllEntities` in `base-entity-actions.ts` are generic but no call site was found
  for them in this repo.
- ❓ **No schema/migrations in this repo.** There's no `supabase/` directory or `.sql` file, so the
  authoritative schema lives elsewhere (Supabase dashboard, or a separate infra repo). Everything
  in [DATA_MODEL.md](./DATA_MODEL.md) is inferred from query call sites, not verified against a
  DDL source of truth.

## Auth & security

- ⚠️ **Two independent "is this user logged in" implementations with different failure modes.**
  `middleware.ts`'s inline logic **fails open** (does not force MFA / does not log the user out)
  if `auth.mfa.listFactors()` errors — explicitly to avoid lockouts. `app/lib/get-session.ts`'s
  `getSessionUser()` (used by the root layout to decide header state) **fails closed** (treats the
  user as logged out) on the same error. A future change to MFA policy needs to update both, and
  today they can disagree about session validity if `listFactors()` intermittently fails.
- ⚠️ **Password strength meter doesn't score special characters, but the Yup message claims it
  does.** `calculatePasswordStrength` in `reset-password-utils.ts` only checks length/upper/lower/
  digit (4 × 25 points = 100 max); the special-character check exists in the regex comment text
  shown to users ("must include ... and a special character") but `validationSchemaWithOldPassword`'s
  actual regex `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/` does **not** require a special character (only
  the *registration* schema's regex does, which additionally restricts allowed characters to
  `[A-Za-z\d@$!%*?&]`). A password like `Abcdefg1` would pass the "change password" flow's
  validation and be scored as maximum-strength ("Strong") despite the shown text implying a
  special character is mandatory.
- ⚠️ **Verbose request/session logging in `middleware.ts`.** Two `console.log` calls print the
  full `session` and `user` objects (including tokens) on every matched request
  (`console.log("[middleware] session and user", { session, user })`). This runs on the server, so
  it's not exposed to end users, but it does mean access/refresh tokens end up in server logs —
  worth confirming the hosting platform's log retention/redaction policy is acceptable for that.
- ❓ **Service-role Supabase client is cookie-bound.**
  `ss-supabase-service-role-client.ts` builds its client with `createServerClient` (the
  cookie-aware SSR helper) but passes the **service-role key** as the "anon key" argument. This
  works (the service role key becomes the effective `apikey`, bypassing RLS on table queries) and
  still lets `auth.getUser()`/`auth.signOut()` operate on the caller's session cookie in the same
  client — seems intentional, but it's a slightly unusual pattern worth a comment in the source if
  it isn't obvious to future maintainers, since a service-role client is normally created with a
  plain `createClient` and no cookies at all (as the webhook routes correctly do).

## Frontend / product

- ⚠️ **`NotificationsTab` is not wired to persistence.** It receives `notificationSettings` and a
  `handleNotificationToggle` callback as props, but `profile.tsx`/`profile-tabs.tsx` don't appear
  to supply real data or a real handler (commented-out props in `profile.tsx`:
  `// notificationSettings={notificationSettings}` / `// setNotificationSettings={...}`) — this
  tab is effectively a non-functional placeholder today.
- 🧹 **Hardcoded GTM/Ads id instead of `NEXT_PUBLIC_GTM_CONTAINER_ID`.** `app/layout.tsx` inlines
  `AW-18137335805` directly in the gtag script rather than reading the env var that exists
  specifically for this purpose — makes it harder to point different environments (staging vs.
  prod) at different containers.
- 🧹 **Discount percentages are hardcoded UI copy, not derived from Polar.** The 5%/10%/18%
  savings badges on `/pricing` are computed from a fixed lookup keyed by interval, not from any
  discount object returned by Polar — if Polar-side pricing changes, these badges must be updated
  manually in [`app/pricing/pricing.tsx`](../app/pricing/pricing.tsx).
- ❓ **`react-hook-form` and `sweetalert2` dependencies with no confirmed usage** in the files read
  for this pass — either used in a page/component not covered here, or safe cleanup candidates.
  Worth a repo-wide search before removing.
- 📝 **Known bug from `README.md`** (kept here for visibility, written by the repo owner): setting
  a newly-added billing card as the default payment method when no other default exists was
  reportedly unresolved pending fixing a foreign-key constraint issue on card deletion. This may
  now be moot since card management appears to have moved entirely to Polar's hosted portal (see
  `ClientBillingInformation` note above) — worth confirming with the product owner whether this
  note is stale.

## Suggested next steps if picking this up

1. Verify the `tblPolarSubscriptions` column name used by `isSubscriptionPlanInStatus` against the
   real schema, and fix the cancel-flow short-circuit if it's indeed dead.
2. Decide whether `ClientBillingInformation`/`luhnCheck`/Stripe env vars should be deleted or are
   reserved for a future non-Polar payment path.
3. Confirm the intended source of truth for subscription `amount` (Polar meters vs. the local
   apartment-count multiplication) and document/align it.
4. Either wire up `NotificationsTab` to real preferences storage or remove it until it's ready.
