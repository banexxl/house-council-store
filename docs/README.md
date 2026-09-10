# NestLink — Documentation Index

This `docs/` folder is an engineering knowledge base written from a full read-through of the
codebase in this repository (`house-council-store`, npm package name `nest-link-app`). It exists
to give any future reader (human or AI) a fast, accurate mental model of the product without
having to re-derive it from scratch.

> Note: the app already ships an **in-product** docs page at [`app/docs`](../app/docs/docs.tsx)
> aimed at end users (building managers / tenants). This `docs/` folder is different: it's
> **internal engineering documentation** describing how the system is built.

## Contents

- [PRODUCT_OVERVIEW.md](./PRODUCT_OVERVIEW.md) — what NestLink is, who uses it, the business model
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system boundaries, tech stack, how this repo relates to the dashboard/mobile apps
- [DATA_MODEL.md](./DATA_MODEL.md) — Supabase tables and Polar domain types this repo reads/writes
- [AUTH_AND_SECURITY.md](./AUTH_AND_SECURITY.md) — Supabase Auth, TOTP 2FA/AAL flow, middleware route protection
- [BILLING_POLAR.md](./BILLING_POLAR.md) — Polar.sh integration: checkout, webhooks, subscription lifecycle, per-apartment pricing
- [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) — routes, pages, components, theming
- [ENVIRONMENT.md](./ENVIRONMENT.md) — every environment variable, what it's for, and whether it's actually used
- [OBSERVATIONS.md](./OBSERVATIONS.md) — inconsistencies, dead code, and open questions found while reading

## One-paragraph summary

**NestLink** ("Nest Link") is a building-management SaaS for apartment buildings and housing
communities. It has two roles — **Building Manager/Client** (subscribes, configures buildings,
apartments and tenants) and **Tenant** (participates via announcements, posts, polls, and
incident/service reports) — delivered as a **web dashboard + tenant mobile app**, billed
**per apartment/unit**. This particular repository is the **public-facing gateway**: marketing
site, authentication (incl. TOTP 2FA), account/profile management, and all Polar.sh billing
integration (checkout, customer portal, webhooks). The actual building-management dashboard
(buildings/apartments/tenants/announcements/polls/incidents CRUD) lives in a **separate
application** reachable via `NEXT_PUBLIC_DASHBOARD_URL`, which this repo links to but does not
implement — this repo and that dashboard (and the mobile apps) share the same Supabase Postgres
database and auth.
