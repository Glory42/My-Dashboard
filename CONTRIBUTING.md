# Contributing

This is a personal project, but contributions are welcome. Read this before opening a PR.

## Ground Rules

- One concern per PR — don't bundle a bug fix with a refactor.
- All code must pass lint and type checks before review.
- Write tests for new backend functionality (unit or e2e).
- Keep the workspace/column/card mental model intact — changes that blur those boundaries need strong justification.

## Development Setup

Follow the [Getting Started](README.md#getting-started) section in the README. You'll need PostgreSQL locally.

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

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add drag-and-drop for cards
fix: correct JWT expiry handling
chore: bump NestJS to 11.1
refactor: extract card ordering logic into service
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`.

## Project Conventions

### API (NestJS)

- One module per resource: `auth`, `workspaces`, `columns`, `cards`.
- Business logic lives in services, not controllers.
- Use DTOs with `class-validator` for all request bodies.
- All routes behind a workspace must verify the requesting user owns that workspace.

### Web (React)

- File-based routing via TanStack Router — add routes as files under `src/routes/`.
- Server state (API data) goes through TanStack Query. Local UI state goes in component state.
- No prop drilling beyond two levels — use context or query cache instead.

### Database

- Schema changes require a Prisma migration (`npx prisma migrate dev --name description`).
- Never edit migration files after they've been committed.

## What Not to Change

- The core three-level hierarchy: workspaces → columns → cards. This is the product's identity.
- Auth implementation without a security discussion first.

## Reporting Issues

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment (OS, Node version, browser if frontend)
