# Contributing

This is a personal project, but contributions are welcome. Read this before opening a PR.

## Ground Rules

- One concern per PR — don't bundle a bug fix with a refactor.
- All code must pass lint and type checks before review.
- Write tests for new backend functionality (unit or e2e).
- Keep the workspace → column → card hierarchy intact — changes that blur those boundaries need strong justification.

## Development Setup

Follow the [Getting Started](README.md#getting-started) section in the README. You'll need PostgreSQL locally (or a free Neon project).

## Workflow

1. Fork the repo and create a branch off `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes.
3. Run checks:
   ```bash
   # API
   cd api && npm run lint && npm run test

   # Web
   cd web && npm run lint && npm run build
   ```
4. Commit using [Conventional Commits](#commit-style).
5. Open a PR against `master` with a clear description of what and why.

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/) with a domain scope:

```
feat(api/cards): add card archiving endpoint
fix(web/board): prevent layout shift on card hover
chore(api/deps): bump NestJS to 11.1
refactor(api/workspaces): extract position logic into helper
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`.

## Project Conventions

### API (NestJS)

- One module per resource: `auth`, `workspaces`, `columns`, `cards`.
- Business logic lives in services, not controllers.
- Use DTOs with `class-validator` for all request bodies.
- All routes that touch a resource must verify the requesting user owns it — return `ForbiddenException`, not `404`.
- `PrismaService` is a global provider — import it directly in any module without re-declaring it.

### Web (React)

- **Routes are thin wrappers.** `src/routes/` files only call `createFileRoute` and import from `features/`. No JSX, no hooks, no logic in route files.
- **Features folder owns everything else.** All UI components, mutations, and local state live under `src/features/<domain>/`.
- Server state (API data) goes through TanStack Query. Local UI state (hover, modal open) goes in component `useState`.
- No prop drilling beyond two levels — use query cache or router context instead.
- Use `visibility: hidden` / `visible` (not conditional rendering) for elements that toggle on hover, to preserve layout space.

### Database

- Schema changes require a Prisma migration:
  ```bash
  cd api && npx prisma migrate dev --name describe-your-change
  ```
- Never edit migration files after they've been committed.
- All foreign keys must use `onDelete: Cascade` to maintain referential integrity.

## What Not to Change

- The core three-level hierarchy: workspaces → columns → cards. This is the product's identity.
- The httpOnly cookie auth approach without a security discussion first.
- The `sameSite: 'lax'` + custom domain setup — it exists to work around browser third-party cookie restrictions.

## Reporting Issues

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment (OS, Node version, browser if frontend)
