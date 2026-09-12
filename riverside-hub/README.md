# Riverside Community Hub

Membership, facility/equipment booking, and donation platform for a
community nonprofit — with a staff dashboard for approvals and reporting.

## Status

- [x] Database schema + RLS policies (`supabase/migrations/0001_init_schema.sql`)
- [x] Shared types + Zod validation (`packages/shared`)
- [x] Express API: auth middleware + members, resources, bookings, donations, admin modules
- [x] React frontend: member registration, login, dashboard
- [ ] React frontend: bookings UI, donations UI, admin dashboard UI
- [ ] Deployment (configs included below, ready to deploy)

## Architecture

Monorepo, npm workspaces:

- `apps/web` — React + TypeScript (Vite)
- `apps/api` — Node + Express
- `packages/shared` — Zod schemas as the single source of truth; TS types
  are inferred from them (`z.infer<...>`) so validation and types can never
  drift apart between frontend and backend
- `supabase/migrations` — schema as SQL, checked into the repo

## Key decision: authorization lives in Postgres RLS, not Express

The API does **not** use the Supabase service-role key for normal requests.
Instead, `requireAuth` middleware verifies the caller's Supabase JWT and
builds a request-scoped Supabase client authenticated as that user
(`createUserScopedClient`). Every query that client makes is subject to the
RLS policies defined in the migration.

This means:

- Express route handlers focus on request shape validation (Zod) and
  orchestration, not re-implementing "can this user see this row" logic
- The database enforces authorization even if a route handler has a bug
- The service-role client (`getServiceClient`) is reserved for the rare
  case where a server-only operation genuinely needs to see across all
  rows regardless of caller (e.g. checking total bookings on a resource
  before approving a new one) — used sparingly and never to bypass an
  authorization decision, only to inform one.

## Data model

Four tables: `members` (extends `auth.users`), `resources` (bookable
things), `bookings` (member ↔ resource ↔ time window, with a staff
approval step), `donations` (optionally linked to a member; supports
anonymous donors and both monetary and food-parcel donations).

See the migration file for full column definitions and RLS policies.

## Deployment

Three pieces, each hosted separately: **Supabase** (database + auth, already
hosted the moment you create a project), **Render** (Express API), **Vercel**
(React frontend). Configs are already in the repo:

- `render.yaml` — Render blueprint for `apps/api`
- `apps/web/vercel.json` — Vercel config for `apps/web`

See the step-by-step walkthrough for the exact order (Supabase → Render →
Vercel → wire CORS back to the real frontend URL).

## Local setup

```bash
npm install

# supabase: run the migration + seed against your project (via Supabase CLI
# or by pasting the SQL into the SQL editor)

cp apps/api/.env.example apps/api/.env
# fill in SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY

npm run dev:api
```
