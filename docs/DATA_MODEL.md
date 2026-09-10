# Data Model

The database is **Supabase Postgres**, shared with the external dashboard/mobile apps. This repo
never runs migrations or defines schema (no `supabase/` folder, no `.sql` files exist in this
repo) — it only reads/writes tables that must already exist. Table and column names below are
reconstructed from actual `.from("...")` calls and TypeScript types found in the code; there is no
authoritative schema file to cross-check against, so treat this as "what the code assumes exists,"
not a guaranteed-accurate DDL dump.

Table names use a `tbl` prefix and mix `camelCase` (Polar-mirror tables) and `snake_case`
(domain tables) column conventions — see [OBSERVATIONS.md](./OBSERVATIONS.md).

## Domain tables (owned by the wider product, only read/lightly written here)

### `tblTenants`
Referenced during registration (`register-action.ts`) to check for pre-existing emails, and
patched by the customer webhook. Represents a **tenant** user (as opposed to a building
manager/client). Column seen: `email`.

### `tblBuildings`
A building owned by a client. Columns seen: `id`, `client_id` (owner FK, snake_case),
`customerId` (also used as an owner FK from the Polar side — camelCase, see
[OBSERVATIONS.md](./OBSERVATIONS.md) about this inconsistency), `created_at`.

### `tblApartments`
A unit inside a building. Columns seen: `id`, `building_id` (FK to `tblBuildings.id`,
snake_case), `created_at`. Used only to **count apartments per customer** for billing purposes:
```sql
select apartments.id
from tblApartments
join tblBuildings on tblApartments.building_id = tblBuildings.id -- (inferred join)
where tblBuildings.customerId = :customerId
```
(actual code uses Supabase's embedded-resource syntax
`select("id, tblBuildings!inner(customerId)")`).

### `tblServerLogs`
Central audit/observability log table written by `logServerAction`
([`app/lib/server-logging.ts`](../app/lib/server-logging.ts)) from nearly every server action and
webhook in this app. Columns: `id`, `user_id`, `action` (free-text label), `payload` (jsonb),
`status` (`success`|`fail`), `error`, `duration_ms`, `type` (`api`|`db`|`auth`|`cron`|`webhook`|
`action`|`email`|`external`|`internal`|`system`|`unknown`), `created_at`. There is a client-side
twin, `logClientAction` ([`app/lib/client-logging.ts`](../app/lib/client-logging.ts)), used e.g.
during 2FA sign-in.

## Polar-mirror tables (owned by this repo's webhook handlers)

These tables exist so the app can read Polar's catalog/billing state directly from Postgres
(fast, no external API round-trip, works even if Polar is briefly unavailable) instead of calling
the Polar API on every page render. Each is kept in sync by a **webhook route** under
`app/api/polar/webhook/*`, using the Supabase **service-role** client (`SB_SERVICE_KEY`,
bypasses RLS).

| Table | Written by | Purpose |
|---|---|---|
| `tblPolarCustomers` | `webhook/customer` | Mirror of a Polar Customer; `externalId` = Supabase `auth.users.id`. Columns include `id`, `externalId`, `email`, `emailVerified`, `name`, `billingAddress` (jsonb), `taxId`, `organizationId`, `avatarUrl`, `deletedAt`, `createdAt`, `modifiedAt`. |
| `tblPolarProducts` | `webhook/product` | Mirror of a Polar Product (a subscription plan). `isArchived`, `recurringInterval`, `recurringIntervalCount`, `trialInterval`, `trialIntervalCount`, `name`, `description`. |
| `tblPolarProductPrices` | `webhook/product` | One row per price on a product (`productId` FK). `priceCurrency`, `priceAmount`/`unitAmount`, `recurringInterval`, `isArchived`. |
| `tblPolarProductBenefits` | `webhook/product` | Benefits (feature bullets) attached to a product; read back and reshaped into the app's `Feature` type on the pricing page. |
| `tblPolarProductMedias` | `webhook/product` | Product images/media assets. |
| `tblPolarProductCustomFields` / `tblPolarProductAttachedCustomFields` | `webhook/product` | Custom checkout fields Polar supports, if configured. |
| `tblPolarSubscriptions` | `webhook/subscription`, also read/written from `/api/polar` route | One row per subscription. `id` = Polar subscription id (conflict/upsert target), `customerId`, `productId`, `status` (`incomplete`\|`incomplete_expired`\|`trialing`\|`active`\|`past_due`\|`canceled`\|`unpaid`), `amount` (⚠ recomputed as `polar_amount * live_apartment_count`, see ARCHITECTURE.md), `currentPeriodStart/End`, `trialStart/End`, `cancelAtPeriodEnd`, `seats`, `meters` (jsonb array), `prices` (jsonb array). **Unique per `customerId`**: the webhook handler explicitly deletes any other subscription rows for the same customer before upserting, so a customer can only have one subscription row at a time. |
| `tblPolarOrders` | `webhook/order` | One row per Polar order/invoice: `status` (`pending`\|`paid`\|`refunded`\|`partially_refunded`), `totalAmount`, `refundedAmount`, `invoiceNumber`, `customerId`, `productId`, `subscriptionId`. Displayed as "Payment History" in the profile subscription tab. |
| `tblPolarCheckouts` | `webhook/checkout` | Mirror of checkout session state (created/updated). |
| `tblPolarOrganizations` | `webhook/organization` | Mirror of the Polar Organization record (the seller account) — effectively a singleton row for this app's own org. |
| `tblTenantProfiles` | `webhook/customer` | Written alongside `tblPolarCustomers`/`tblTenants` updates in the customer webhook — likely a tenant-facing profile projection consumed by the dashboard/mobile apps. |

**Not yet implemented**: the `benefit` webhook and `refund` webhook handlers currently only
`console.log` + write a `tblServerLogs` row — they do **not** persist to any
`tblPolarBenefit*`/`tblPolarRefunds` table (see [OBSERVATIONS.md](./OBSERVATIONS.md)).

## Application-level TypeScript types (`app/types/`)

- `BaseEntity` — generic `{ id?, created_at?, updated_at?, name, description? }` shape used by the
  small generic CRUD helpers in [`app/lib/base-entity-actions.ts`](../app/lib/base-entity-actions.ts)
  (`readEntity`, `readAllEntities`) — thin, generic Supabase wrappers, not wired to any specific
  feature UI in this repo.
- `Feature` — `BaseEntity & { base_price, slug }`, the shape pricing benefits get coerced into for
  display.
- `ClientBillingInformation` — a legacy-looking type for card/cash billing details
  (`card_number`, `cvc`, `expiration_date`, `cash_amount`) with a Luhn-check validator
  ([`app/lib/card-validator.ts`](../app/lib/card-validator.ts)). **No server action or UI in this
  repo actually uses this type** — billing is fully delegated to Polar's hosted checkout/portal.
  Likely a holdover from an earlier, non-Polar billing design. See
  [OBSERVATIONS.md](./OBSERVATIONS.md).
- `Currency` — trivial `{ id, name, code }`, also currently unused.
- The `polar-*-types.ts` files are a hand-written, fairly complete mirror of Polar's webhook event
  and REST resource shapes: `polar-customer-types.ts`, `polar-product-types.ts`,
  `polar-order-types.ts`, `polar-subscription-types.ts`, `polar-benefit-types.ts`,
  `polar-benefit-grant-types.ts`, `polar-organization-types.ts`, `polar-refund-type.ts`,
  `polar-checkout-types.ts`. These are what the webhook handlers and UI components import instead
  of the raw `@polar-sh/sdk` types.
