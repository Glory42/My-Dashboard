# Dashboard Todo — API

NestJS REST API for the Dashboard Todo app. Handles authentication via httpOnly JWT cookies, and CRUD for workspaces, columns, and cards.

## Stack

- **NestJS 11** — framework
- **Prisma 7** — ORM (pg adapter, no built-in connection URL)
- **Neon PostgreSQL** — database
- **JWT + bcrypt** — authentication (cookie-based, not Bearer)

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npm run start:dev
```

API runs at `http://localhost:3000`.

## Module Structure

```
src/
├── config/               # app.config.ts, database.config.ts, jwt.config.ts
├── common/
│   ├── guards/           # auth.guard.ts — CanActivate: cookie → JWT verify → req.user
│   ├── decorators/       # current-user.decorator.ts — @CurrentUser() param decorator
│   ├── filters/          # http-exception.filter.ts — standardize error responses
│   └── types/            # express.d.ts — augments Request with user: { id, email }
├── infrastructure/
│   └── database/prisma/  # PrismaModule (global: true) + PrismaService
└── modules/
    ├── auth/             # register, login, logout, me
    ├── workspaces/       # workspace CRUD + ownership check
    ├── columns/          # column CRUD scoped to workspace
    └── cards/            # card CRUD + PATCH /:id/move
```

## Auth Flow

Login sets a `token` httpOnly cookie. Every protected route reads that cookie via `AuthGuard`.

The cookie uses `sameSite: 'lax'` in both dev and production. In production the API is served from `api.gorkemkaryol.dev` and the frontend from `dash.gorkemkaryol.dev` — same registrable domain (`gorkemkaryol.dev`), so browsers treat requests as same-site and send the cookie without requiring `sameSite: 'none'`. `secure: true` is applied only in production.

## Ownership

Every service method verifies `resource.userId === req.user.id` before any mutation, returning `ForbiddenException` otherwise — not `404` — so callers know the resource exists but is off-limits.

## Prisma 7 Notes

Prisma 7 splits the connection URL into two places:
- `prisma.config.ts` (auto-generated) — used by CLI tools (`migrate`, `generate`, `studio`)
- `PrismaService` constructor — runtime connection via `@prisma/adapter-pg` with `PrismaPg({ connectionString: process.env.DATABASE_URL })`

The `datasource` block in `schema.prisma` has no `url` field; that moved to `prisma.config.ts`.

## Scripts

| Command                | Description                            |
|------------------------|----------------------------------------|
| `npm run start:dev`    | Dev server with hot reload             |
| `npm run start:prod`   | Run compiled production build          |
| `npm run build`        | `prisma generate` then compile TS      |
| `npm run test`         | Unit tests                             |
| `npm run test:e2e`     | End-to-end tests                       |
| `npm run test:cov`     | Test coverage report                   |
| `npm run lint`         | ESLint with auto-fix                   |
| `npm run format`       | Prettier format                        |

## Environment Variables

See [`.env.example`](.env.example).

| Variable         | Description                                            |
|------------------|--------------------------------------------------------|
| `DATABASE_URL`   | Neon (or local) PostgreSQL connection string           |
| `JWT_SECRET`     | Secret for signing tokens — long random string         |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                             |
| `FRONTEND_URL`   | CORS allowed origin, e.g. `https://dash.gorkemkaryol.dev` |
| `NODE_ENV`       | `development` or `production`                          |
| `PORT`           | Port to listen on (Render sets this automatically)     |

## Deployment (Render)

- **Root directory:** `api/`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start:prod`
- Set all env variables in the Render dashboard
- Add `api.gorkemkaryol.dev` as a custom domain (Cloudflare DNS: CNAME `api → dashboard-api-ccyl.onrender.com`, proxy off)
- Add an Uptime Robot monitor on `GET /health` every 5 minutes to prevent free-tier cold starts

> **Why `prisma generate` in the build step?** Render installs packages but doesn't auto-generate the Prisma client. Without `prisma generate`, `@prisma/client` exports nothing and TypeScript compilation fails.

> **Why `tsconfig.build.json` excludes `prisma.config.ts`?** This file lives in the project root outside `src/`. If TypeScript includes it, the computed `rootDir` becomes `.` instead of `src/`, and the output lands at `dist/src/main.js` instead of `dist/main.js`, breaking the start command.
