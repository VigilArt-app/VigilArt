# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

Always start every response with the user's name: **Seph**.

## Overview

VigilArt helps artists protect their work by scanning the web for unauthorized uses of their artwork and generating DMCA takedown notices. The repo is a pnpm monorepo with three active workspace packages: `backend` (NestJS), `web-app` (Next.js 15), and `shared` (types/schemas/Prisma client). A Flutter `mobile-app` is also present but excluded from the pnpm workspace.

## Commands

### Root-level (from repo root)

```bash
pnpm install              # Install all workspace dependencies
pnpm dev                  # Start backend + web-app in parallel with hot reload
pnpm dev:backend          # Backend only
pnpm dev:frontend         # Web-app only
pnpm dev:shared           # Shared package in watch mode (required when editing shared/)
pnpm test                 # Backend integration tests
pnpm test:e2e             # Backend end-to-end tests
```

### Backend (`backend/` or via `--filter backend`)

```bash
# Tests
pnpm test:it              # Integration tests (*.it-spec.ts) — uses Testcontainers (real Postgres + Redis)
pnpm test:e2e             # E2E tests (*.e2e-spec.ts, in test/) — runs sequentially with Testcontainers

# Database (requires ../.env to be present)
pnpm db:migrate:dev       # Create and apply a new migration (adds a file to prisma/migrations/)
pnpm db:migrate:prod      # Deploy existing migrations (used in CI/prod, no new files)
pnpm db:reset             # Reset DB and re-run dev seed
pnpm db:generate          # Regenerate Prisma client + Zod schemas after schema changes
pnpm db:studio            # Open Prisma Studio on port 5555
```

Run a single test file:
```bash
cd backend && npx jest --config jest.config.ts src/reports/reports.service.it-spec.ts
```

### Database (Docker, from repo root)

```bash
docker compose -f docker-compose.dev.yml up       # Start Postgres + Prisma Studio locally
docker compose -f docker-compose.dev.yml up db    # Start only Postgres
```

### Mobile (from `mobile-app/`)

```bash
flutter pub get
flutter run
flutter test
```

## Architecture

### Monorepo layout

- `backend/` — NestJS API server (TypeScript)
- `web-app/` — Next.js 15 + React 19 frontend (TypeScript)
- `shared/` — Shared types, Zod schemas, enums, functions, and the generated Prisma client
- `mobile-app/` — Flutter app (Dart; excluded from pnpm workspace, managed with `flutter` CLI)

### Shared package is the source of truth for types

Everything that crosses the boundary between backend and web-app lives in `shared/src/`. The Prisma `generator client` outputs to `shared/src/generated/prisma` and `generator zod` outputs to `shared/src/generated/zod`. Both backend and web-app import from `@vigilart/shared`.

After any `prisma/schema.prisma` change, run `pnpm db:generate` (from `backend/`) to regenerate both outputs.

### Backend (NestJS)

**Request/response conventions:**
- All responses are wrapped by `ResponseWrapperInterceptor` → `{ success, statusCode, data, message }`. Controllers return plain data; the interceptor adds the envelope.
- Request validation uses `ZodValidationPipe` globally (nestjs-zod). DTOs are Zod schemas, not class-validator classes.
- Three global exception filters produce consistent error shapes for Prisma errors, HTTP exceptions, and Zod validation errors.

**The `@ApiEndpoint()` decorator** (`src/common/decorators/api-endpoint.decorator.ts`) is the single place to declare Swagger metadata, JWT auth guard, and ownership checks for a route. Use it for all controller methods instead of composing guards and Swagger decorators individually.

**Auth flow:**
- JWT access tokens sent as Bearer headers or `auth_token` cookie; refresh tokens in `refresh_token` cookie (HttpOnly).
- Mobile clients detected by `x-client-type: mobile` header get longer-lived refresh tokens (3650 days vs 7 days for web).
- Refresh tokens are hashed with bcrypt and stored in `RefreshToken` table. `TokenCleanupService` prunes expired ones on a schedule.
- `JwtAuthGuard` protects routes; `JwtRefreshAuthGuard` protects the refresh endpoint.
- `OwnershipGuard` + `assertResourceOwnership()` enforce that the authenticated user owns the requested resource.

**Artwork scan pipeline:**
1. `ReportsScheduler` runs hourly (`@Cron`) and enqueues BullMQ jobs for users with `autoRunReports: true` who haven't been scanned in 30 days.
2. `ReportsProcessor` (BullMQ worker) calls `ReportsService.generate()`.
3. `ReportsService.aggregateVisualSearchResults()` calls Google Cloud Vision API (`VisionService`) and Google Lens (`GoogleLensService`) **in parallel** and merges the results.
4. Results are upserted as `MatchingPage` records (unique on `[url, artworkId]`) and linked to an `ArtworksReport`.

**Storage:** Cloudflare R2 (S3-compatible). Artwork files are stored via presigned upload URLs; downloads also use presigned URLs. Never store raw object URLs in the DB — always go through `StorageService`.

**Caching:** Redis via `@nestjs/cache-manager` + `@keyv/redis`. Default TTL is 1 hour (set globally). Users are cached for 7 days; email → user-id mapping is stored separately with the email key SHA-256-hashed. Report statistics have a 30-day TTL.

**Website classification:** `src/common/utils/website-class.ts` maps matched URLs into the `WebsiteCategory` enum (SOCIAL, ART_PLATFORMS, MARKETPLACES, etc.) using regex domain patterns.

**DMCA modules** (`src/dmca/`) split into three sub-modules:
- `platform` — registry of pre-seeded platforms with their DMCA form schemas
- `profile` — user's personal contact info for notices
- `notice` — generated/submitted notices with `DRAFT` → `SUBMITTED` lifecycle

**Module map:**

| Module | Responsibility |
|--------|----------------|
| `auth` | Login, signup, JWT lifecycle, logout, `/me` endpoint |
| `users` | User CRUD |
| `artworks` | Artwork upload and management |
| `reports` | Scan orchestration, result aggregation, `ArtworksReport` creation |
| `vision` | Google Cloud Vision API reverse image search |
| `googlelens` | Google Lens HTTP reverse image search |
| `storage` | Cloudflare R2 / S3 operations |
| `dmca/platform` | DMCA platform registry |
| `dmca/profile` | User's DMCA contact info |
| `dmca/notice` | DMCA notice drafting and submission |
| `prisma` | Singleton `PrismaService` shared across modules |

### Web-app (Next.js 15)

- API calls go directly to the backend via `NEXT_PUBLIC_API_URL` — there are no Next.js API routes acting as a proxy.
- `src/config.ts` validates all env vars with Zod at startup. Add new `NEXT_PUBLIC_*` variables there.
- UI is built on shadcn/ui (Radix UI primitives + Tailwind CSS v4).
- i18n via `react-i18next`; translation files live in `public/locales/`.

### Mobile (Flutter)

- State management: Provider.
- API calls: `lib/(api)/`.
- Pages: `lib/pages/`, reusable widgets: `lib/widgets/`.
- Environment loaded from `.env` via `flutter_dotenv`.

### Environment variables

- **Dev:** `.env` file at repo root. Backend loads it via `envFilePath: "../.env"`. Web-app loads it via `dotenv-cli` in its dev script.
- **Prod:** Doppler CLI injects secrets at container startup. See `documentation/doppler.md`.

Key backend vars: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES`, `JWT_REFRESH_EXPIRES`, `JWT_MOBILE_REFRESH_EXPIRES`, `CORS_ORIGINS`, `COOKIE_DOMAIN`, `SERVER_PORT` (default 8000), `SALT_ROUNDS` (default 10), `CLOUDFLARE_R2_*`, `CLOUDFLARE_BUCKET_NAME`.

### Database migrations

Always create migrations locally and commit the generated file:
```bash
cd backend && pnpm db:migrate:dev --name "descriptive_name"
```

Prod migrations run in a separate `migrator` container during deployment with automatic DB backup and rollback. Never use `db:push` in production. See `documentation/migrations.md` for the full deployment flow.

### API documentation

Swagger UI is available at `/api/v1/docs` in dev and staging environments. Disabled in production. The API prefix is configured via `API_PREFIX` env var (defaults to `api/v1`).
