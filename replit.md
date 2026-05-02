# SevaSetu

A hyperlocal home-services marketplace connecting Indore residents with verified local craftsmen (plumbers, carpenters, electricians, painters, and more).

## Overview

SevaSetu (meaning "Service Bridge" in Hindi) is built as a Phase 1 MVP per the PRD. It includes:
- Public landing page with service catalogue, trust signals, and booking CTAs
- 5-step booking flow (service → location → schedule → description → contact)
- Customer booking history with post-job rating flow
- Admin dashboard with live metrics, revenue chart, pending dispatch queue, booking management
- Craftsmen registry with verification badges, availability toggle, and add-new form

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/sevasetu) — saffron/terracotta palette
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: wouter
- **Animations**: framer-motion
- **Charts**: recharts

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Services

- **Plumbing, Carpentry, Electrical** (P0) — core services
- **Painting, AC Service, Home Cleaning** (P1)
- **Pest Control, CCTV/Security** (P2)

## Seed Data

- 8 service categories pre-seeded
- 6 craftsmen (Ramesh, Suresh, Mukesh, Dinesh, Kamlesh, Prakash)
- 7 sample bookings across various statuses

## Pages

- `/` — Landing page
- `/book` — Multi-step booking flow
- `/bookings` — Customer booking history + rating
- `/admin` — Admin dashboard (metrics, revenue chart, dispatch queue, all bookings)
- `/admin/craftsmen` — Craftsmen registry

## API Routes

All routes served at `/api`:
- `GET /services` — Service catalogue
- `GET/POST /bookings` — List and create bookings
- `GET/PATCH /bookings/:id` — Get and update booking (status, assign craftsman, rating)
- `GET/POST /craftsmen` — List and create craftsmen
- `GET/PATCH /craftsmen/:id` — Get and update craftsman
- `GET /admin/dashboard` — Summary metrics
- `GET /admin/revenue` — Daily revenue breakdown

## Notes on Codegen

The orval config generates `lib/api-zod/src/index.ts` which previously caused duplicate exports. A fixup node command in the codegen script ensures only `./generated/api` is exported. See `lib/api-spec/package.json`.
