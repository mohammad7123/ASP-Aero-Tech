# APS Aero Tech

Public aerospace website and protected content-management console for ASP Aertech Private Limited.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aps-aero-tech` — public website and `/admin` console
- `artifacts/api-server/src/routes/admin.ts` — protected admin API and resource allowlist
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `attached_assets/0_schema_1788377382482.sql` — uploaded PostgreSQL schema dump used for the full development migration

## Architecture decisions

- Admin sessions are signed, HTTP-only cookies backed by `SESSION_SECRET`; no session tokens are exposed to browser JavaScript.
- The first administrator is created through a one-time setup flow only while `admin_users` is empty.
- Admin resource SQL is generated exclusively from a server-side allowlist; user values are always parameterized and secret settings are not exposed.

## Product

- Cinematic aerospace landing page with a database-backed inquiry form.
- Protected admin dashboard with metrics, inquiry handling, search, and CRUD management for website content, jobs, campaigns, media metadata, and safe site settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Orval currently emits a duplicate `ListAdminResourceParams` type/value re-export. After API codegen, remove the generated-types wildcard export from `lib/api-zod/src/index.ts`, then run `pnpm run typecheck:libs`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
