# Dashboard Todo — Backend

NestJS REST API for the Dashboard Todo app. Handles authentication via httpOnly JWT cookies, and CRUD for workspaces, columns, and cards.

## Stack

- **NestJS 11** — framework
- **Prisma 7** — ORM
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

Login sets a `token` httpOnly cookie. Every protected route reads that cookie via `AuthGuard`. In local dev use `sameSite: 'lax'`; in production use `sameSite: 'none', secure: true` (cross-origin with Cloudflare Pages frontend).

## Ownership

Every service method verifies `resource.userId === req.user.id` before any mutation. Returning a `ForbiddenException` otherwise — not a `404` — so callers know the resource exists but is off-limits.

## Scripts

| Command                | Description                  |
|------------------------|------------------------------|
| `npm run start:dev`    | Dev server with hot reload   |
| `npm run start:prod`   | Run compiled production build |
| `npm run build`        | `prisma generate && nest build` |
| `npm run test`         | Unit tests                   |
| `npm run test:e2e`     | End-to-end tests             |
| `npm run test:cov`     | Test coverage report         |
| `npm run lint`         | ESLint with auto-fix         |
| `npm run format`       | Prettier format              |

## Environment Variables

See [`.env.example`](.env.example).

| Variable         | Description                                        |
|------------------|----------------------------------------------------|
| `DATABASE_URL`   | Neon (or local) PostgreSQL connection string       |
| `JWT_SECRET`     | Secret for signing tokens — long random string     |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                         |
| `FRONTEND_URL`   | CORS allowed origin, e.g. `http://localhost:5173`  |
| `NODE_ENV`       | `development` or `production`                      |
| `PORT`           | Port to listen on (default: `3000`)                |

## Deployment (Render)

- Build command: `npm ci && npm run build`
- Start command: `npx prisma migrate deploy && node dist/main`
- Set all env variables in the Render dashboard
- Add an Uptime Robot monitor on `GET /health` every 5 minutes to prevent cold starts
