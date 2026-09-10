# Product Overview — NestLink

## What it is

NestLink is **building management software for apartment buildings and housing communities**.
Marketing copy (from [`app/home.tsx`](../app/home.tsx) and [`app/docs/docs.tsx`](../app/docs/docs.tsx))
describes it as:

> "A web dashboard + mobile app built around real building workflows: communication,
> governance, and service/incident reporting — with clear roles and permissions."

Tagline variants seen in the code: *"Bringing Your Tenants Together"*, *"Building Management
Software for Apartments & Housing Communities"*.

## Roles

The product is explicitly **role-based** with two primary roles (a third, "Platform", is used in
the docs page purely as a content-organization tag, not a real user role):

1. **Building Manager / Client** ("Client" in code and DB — table `tblPolarCustomers`, plus a
   related `tblBuildings`/`tblApartments` ownership model keyed by `client_id`/`customerId`)
   - Purchases and owns the subscription (billed per apartment).
   - Creates/manages Buildings and Apartments/Units.
   - Invites Tenants (email, phone, or a printable QR code for self-service join).
   - Creates Announcements, Polls, and moderates Posts.
   - Triages and resolves Incident/Service reports submitted by tenants.
   - Configures roles/permissions and workflows.
2. **Tenant** (table `tblTenants`)
   - Web + mobile access with a consistent, more limited permission set.
   - Reads announcements, participates in the community feed (posts/comments).
   - Votes in polls.
   - Submits incident/service reports, optionally with photos taken directly from the mobile
     camera.
   - Receives real-time/push notifications for announcements, poll open/close, incident updates.

## Core feature set (per the in-app docs content)

These are the modules the *dashboard* application (external to this repo) implements, as
described to end users in [`app/docs/docs.tsx`](../app/docs/docs.tsx):

- **Buildings & Apartments** — structural hierarchy; a building contains apartments/units;
  tenants are linked to a unit for scoping.
- **Tenants & Invitations** — invite by email/phone or QR code; primary/secondary occupant
  status; ban/remove tenants.
- **Announcements** — official, structured, searchable updates (replaces chat-thread chaos);
  can include images/attachments.
- **Posts & Comments** — a more casual community feed for discussion, distinct from official
  announcements.
- **Polls & Voting** — governance tool: budgets, repairs, contractor selection, building rules;
  tracks participation, supports open/close windows, results are archived.
- **Incidents & Service Requests** — tenant-submitted issue reports (category, description,
  location, urgency, photos); status lifecycle (submitted → in progress → resolved).
- **Notifications** — in-app and push notifications for the events above.
- **Security** — Supabase Auth session management, optional TOTP 2FA, role-based authorization,
  data scoped by client/building/apartment relations.

None of these feature modules' CRUD UI/actions live in *this* repository — this repo only
implements the parts described in [ARCHITECTURE.md](./ARCHITECTURE.md) (marketing, auth,
billing, profile). The dashboard app is linked to via the `NEXT_PUBLIC_DASHBOARD_URL` env var.

## Business model

- **Subscription SaaS, billed per apartment/unit** — "no limit on tenants" (from the pricing FAQ).
  Price scales with the number of apartments under a client's buildings
  (`getApartmentCountForCustomer` in [`app/profile/subscription-plan-actions.ts`](../app/profile/subscription-plan-actions.ts)
  counts rows in `tblApartments` joined to `tblBuildings` filtered by `customerId`).
- **Free trial** included on plans (Polar `trialInterval`/`trialIntervalCount` on the product).
- **Billing intervals**: monthly (1/3/6/12 months) and yearly, with marketing-displayed discount
  tiers: 3mo = 5%, 6mo = 10%, 12mo/annual = 18% (these percentages are hardcoded in
  [`app/pricing/pricing.tsx`](../app/pricing/pricing.tsx), not derived from Polar).
- **Payment processor: Polar.sh** (not Stripe directly, though Stripe env vars exist unused — see
  [OBSERVATIONS.md](./OBSERVATIONS.md)). Polar itself uses Stripe as a payment rail under the
  hood, but this app integrates only with the Polar API/SDK.
- Customers manage billing either through NestLink's own `/pricing` and `/profile` UI, or via a
  Polar-hosted **Customer Portal** (opened via `/api/polar/customer-portal`).

## Where this repo sits vs. the rest of the product

This is a Next.js 15 App Router project. Its job is:

1. Public marketing site (`/`, `/pricing`, `/docs`, `/contact`, `/privacy-policy`,
   `/terms-and-conditions`).
2. Authentication (`/auth/*`) — sign up, sign in (+ optional Google OAuth), password reset, email
   confirmation, TOTP 2FA enrollment/verification.
3. Account/profile self-service (`/profile`) — account details, subscription management, security
   settings (password, 2FA, account deletion), notifications tab.
4. All Polar billing plumbing (`/api/polar/**`) — checkout session creation, subscription
   cancel/reactivate, customer portal, and one webhook receiver per Polar event category that
   mirrors Polar's data into Supabase tables (`tblPolarProducts`, `tblPolarSubscriptions`,
   `tblPolarOrders`, `tblPolarCustomers`, etc.) so the rest of the product (and this app itself)
   can read pricing/subscription state straight from Postgres instead of calling the Polar API on
   every page load.

A separate application (linked via `NEXT_PUBLIC_DASHBOARD_URL`, opened in a new tab from the
header's "Dashboard" button once a user is signed in) is where the actual building-manager
day-to-day work (buildings, apartments, tenants, announcements, polls, incidents) happens. Native
mobile apps for tenants exist too (`NEXT_PUBLIC_ANDROID_APP_URL` / `NEXT_PUBLIC_IOS_APP_URL`,
currently "soon available" placeholders in the docs page at the time this was read).
