# Billing — Polar.sh Integration

NestLink bills through **[Polar](https://polar.sh)** (`@polar-sh/sdk` + `@polar-sh/nextjs`), not
Stripe directly (Stripe env vars exist in `.env` but appear unused — see
[OBSERVATIONS.md](./OBSERVATIONS.md)). The Polar client is instantiated once in
[`app/lib/polar.ts`](../app/lib/polar.ts) and automatically points at Polar's **sandbox** server
in development (`POLAR_ACCESS_TOKEN_SANDBOX`) and **production** otherwise
(`POLAR_ACCESS_TOKEN`).

## Pricing model: per-apartment seats

There is no fixed "per-seat" price picked by the user — pricing is **per apartment/unit** across
all of a client's buildings, and the apartment count is computed **server-side from Supabase**
(never trusted from the client):

```ts
// app/profile/subscription-plan-actions.ts
getApartmentCountForCustomer(customerId) // counts tblApartments joined to tblBuildings
```

This count is used in two places:
1. **At checkout creation** (`POST /api/polar`) — informational/"server-truth seats" comment, but
   note the actual `polar.checkouts.create()` call does **not** pass a `seats`/quantity parameter
   derived from it (see [OBSERVATIONS.md](./OBSERVATIONS.md)) — Polar's own checkout UI is what
   ultimately determines the charged amount for the selected price.
2. **When persisting the subscription webhook** — `amount` stored in `tblPolarSubscriptions` is
   explicitly recomputed as `polarReportedAmount * apartmentCountAtWebhookTime`
   (`convertToPolarSubscription` in `webhook/subscription/route.ts`), so the "amount" the rest of
   the app displays is a locally-derived total, not necessarily what Polar itself charged.

The UI (`/pricing`) also shows fixed marketing discount badges (3mo −5%, 6mo −10%, 12mo/annual
−18%) that are **hardcoded in the frontend**, not read from Polar discount objects.

## Checkout flow

1. User picks a billing interval on `/pricing` (`app/pricing/pricing.tsx`), which selects one of
   the `PolarProduct` rows already loaded from Supabase (`tblPolarProducts` +
   `tblPolarProductPrices`), sorted month-then-year, then by interval count.
2. `startPolarCheckout(priceId, productId)`:
   - Requires the user to be signed in (redirects to `/auth/sign-in?message=sign_in_required`
     otherwise).
   - Blocks starting a second trial while one is `trialing`.
   - If the customer already has an active/trialing subscription and picks a **different**
     product, it redirects them to the **Customer Portal** instead of creating a new checkout
     (Polar's portal handles plan switches/proration).
   - Otherwise `POST /api/polar` with `{ customerId, productIds, customerEmail, successUrl,
     returnUrl, priceIds }`.
3. `POST /api/polar` ([`app/api/polar/route.ts`](../app/api/polar/route.ts)) calls
   `polar.checkouts.create({ products, externalCustomerId: customerId, successUrl, returnUrl,
   customerEmail, requireBillingAddress: true })` and returns Polar's hosted checkout `url`;
   the browser does a full redirect (`window.location.href = data.url`).
4. On completion, Polar redirects to `successUrl` →
   `/pricing/subscription-plan-purchase/success` (or the `error` variant on failure/cancel).
5. Actual subscription activation is **not** driven by the success-page redirect — it's driven
   asynchronously by the `subscription.*` webhooks arriving from Polar, which is why the
   subscription tab also listens on Supabase Realtime for the row to appear/update.

## Customer Portal

`POST /api/polar/customer-portal` creates a **customer session** (`polar.customerSessions.create`)
and returns `session.customerPortalUrl`, opened in a new tab. Used for: viewing/downloading
invoices, updating payment method, and (per Polar's own portal UI) switching plans. A
`customer_not_found` sentinel error is specifically detected and surfaced as "please subscribe
first" rather than a raw API error.

## Cancel / Reactivate

- **Cancel** — `DELETE /api/polar` → `polar.subscriptions.revoke({ id })`. Before calling Polar,
  the route checks `isSubscriptionPlanInStatus('canceled', id)` to short-circuit already-canceled
  subscriptions — see [OBSERVATIONS.md](./OBSERVATIONS.md) for a column-name bug in that helper
  that likely makes this check always return `false`. `revalidatePath("/profile")` is called on
  success so the Next.js cache doesn't serve stale subscription state.
- **Reactivate** — `PUT /api/polar` → creates a customer session, then
  `polar.customerPortal.subscriptions.update(..., { cancelAtPeriodEnd: false })` to undo a
  scheduled cancellation. The corresponding "Reactivate" button in the Subscription tab UI is
  currently **commented out** (see [`subscription-tab.tsx`](../app/profile/components/tabs/subscription-tab.tsx)),
  so this code path exists but has no UI entry point today.

## Webhooks

Polar webhooks are split into **one Route Handler per event category**, each with its **own**
signing secret env var, verified by `@polar-sh/nextjs`'s `Webhooks({ webhookSecret, on<Event> })`
helper (which validates the signature before invoking the matching handler):

| Route | Secret | Status |
|---|---|---|
| `webhook/customer` | `POLAR_WEBHOOK_SECRET_CUSTOMER` | Full — upserts `tblPolarCustomers`, `tblTenantProfiles`/`tblTenants` |
| `webhook/product` | `POLAR_WEBHOOK_SECRET_PRODUCT` | Full — upserts `tblPolarProducts`, `tblPolarProductPrices`, `tblPolarProductCustomFields`, `tblPolarProductAttachedCustomFields`, `tblPolarProductBenefits`, `tblPolarProductMedias` |
| `webhook/subscription` | `POLAR_WEBHOOK_SECRET_SUBSCRIPTION` | Full — upserts `tblPolarSubscriptions` for created/updated/active/canceled/revoked events, recomputing `amount` × apartment count, and deleting any stale prior subscription row for the same customer |
| `webhook/order` | `POLAR_WEBHOOK_SECRET_ORDER` | Full — upserts `tblPolarOrders` (payment history) |
| `webhook/checkout` | `POLAR_WEBHOOK_SECRET_CHECKOUT` | Full — upserts `tblPolarCheckouts` |
| `webhook/organization` | `POLAR_WEBHOOK_SECRET_ORGANIZATION` | Full — upserts `tblPolarOrganizations` |
| `webhook/benefit` | `POLAR_WEBHOOK_SECRET_BENEFIT` | **Stub** — logs `benefit.created/updated` and `benefit_grant.created/updated/revoked` to `tblServerLogs` only; no dedicated table is written |
| `webhook/refund` | `POLAR_WEBHOOK_SECRET_REFUND` | **Stub** — handler registered with zero event callbacks (`TODO: Implement refund webhook handlers`); Polar will get a 200 but nothing happens |

All webhook DB writes use the **service-role** Supabase client (a plain `createClient`, not the
cookie-bound helper), which is correct since a webhook call has no user session/cookies to bind to.

## Subscription status model

`PolarSubscriptionStatus` = `incomplete | incomplete_expired | trialing | active | past_due |
canceled | unpaid` (mirrors Polar's own subscription states 1:1). The UI treats `active` and
`trialing` as "has access" (`hasActiveOrTrial` in `pricing.tsx`), everything else as no active
plan.

## Real-time reflection in the UI

[`app/lib/sb-realtime.ts`](../app/lib/sb-realtime.ts) wraps Supabase Realtime's
`postgres_changes` channel API. `initPolarSubscriptionRealtime(subscriptionId, onEvent)` subscribes
specifically to `tblPolarSubscriptions` rows matching `id=eq.<subscriptionId>`; the Subscription
tab uses it to update local state immediately on a DB change and schedule a debounced
`router.refresh()` shortly after, so a webhook landing while the tab is open updates the UI without
a manual reload — this is the main practical reason the app needs Realtime enabled on that table.
