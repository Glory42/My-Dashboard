# Dashboard Todo — Frontend

React frontend for the Dashboard Todo app. Provides the workspace-switching UI and Kanban board interface with drag-and-drop support.

## Stack

- **React 19** — UI
- **Vite** — dev server and bundler
- **TanStack Router** — file-based routing with type-safe navigation
- **TanStack Query** — server state, caching, and optimistic updates
- **@dnd-kit** — drag-and-drop for cards across columns
- **Tailwind v4** — utility CSS via `@theme` block (no config file)
- **TypeScript**

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

App runs at `http://localhost:5173`. Expects the API at the URL set in `VITE_API_URL`.

## Environment Variables

| Variable       | Description                            |
|----------------|----------------------------------------|
| `VITE_API_URL` | Backend base URL (no trailing slash)   |

Local: `http://localhost:3000` — Production: your Render service URL or custom API domain.

## Project Structure

```
src/
├── routes/               # thin TanStack Router file-based wrappers
│   ├── __root.tsx        # root layout, injects QueryClient into router context
│   ├── index.tsx         # redirects / → /dashboard
│   ├── login.tsx
│   ├── register.tsx
│   └── _auth/            # _ prefix = layout route (not part of the URL)
│       ├── route.tsx     # beforeLoad: GET /auth/me → 401 redirects to /login
│       ├── dashboard.tsx # → renders DashboardPage
│       └── settings.tsx  # → renders SettingsPage
├── features/             # all real UI and logic lives here
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── board/
│   │   ├── DashboardPage.tsx      # workspace switcher shell
│   │   ├── TopBar.tsx             # workspace pills + avatar dropdown
│   │   ├── Board.tsx              # DnD context + column list
│   │   ├── Column.tsx             # droppable column with sticky header/footer
│   │   ├── SortableCard.tsx       # useSortable wrapper (opacity ghost)
│   │   ├── KanbanCard.tsx         # card UI, hover actions, optimistic mutations
│   │   ├── AddWorkspaceModal.tsx
│   │   ├── EditWorkspaceModal.tsx
│   │   ├── AddColumnModal.tsx
│   │   ├── EditColumnModal.tsx
│   │   ├── AddCardModal.tsx
│   │   └── EditCardModal.tsx
│   └── settings/
│       └── SettingsPage.tsx
├── api/
│   ├── client.ts         # fetch wrapper: baseURL + credentials: 'include'
│   └── types.ts          # TypeScript types matching API responses
└── lib/
    └── utils.ts          # cn() helper (clsx + tailwind-merge)
```

Routes are intentionally thin — they just call `createFileRoute` and import the matching feature component. All logic, mutations, and UI live in `features/`.

## Routing

File-based routing via TanStack Router. The `@tanstack/router-plugin/vite` plugin auto-generates `src/routes/routeTree.gen.ts` on dev server start — don't edit it manually.

The `_auth/route.tsx` layout runs a `beforeLoad` that calls `GET /auth/me`. A 401 response redirects to `/login`; success injects the user into router context for child routes.

## Data Fetching

All API calls go through `src/api/client.ts`, which sets `baseURL` from `VITE_API_URL` and includes `credentials: 'include'` on every request (required for the httpOnly cookie to be sent cross-origin).

Server state lives in TanStack Query. Key patterns used:

- **Optimistic updates** for card delete and move: `cancelQueries` → snapshot → `setQueryData` → API call → rollback `onError`
- **`queryClient.setQueryData`** after create/edit to avoid a full refetch
- **`ensureQueryData`** in `beforeLoad` to prefetch the current user before rendering

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start Vite dev server           |
| `npm run build`   | Type-check and production build |
| `npm run preview` | Preview the production build    |
| `npm run lint`    | ESLint check                    |

## Deployment (Cloudflare Pages)

- **Root directory:** `web/`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- Set `VITE_API_URL` in the Cloudflare Pages environment variables (your Render URL or custom API domain)
- Custom domain via Cloudflare DNS

For auth cookies to work in production, the API and frontend must share the same registrable domain (e.g. `api.yourdomain.dev` + `dash.yourdomain.dev`). The cookie uses `sameSite: 'lax'`, which browsers send on same-site cross-origin requests without third-party cookie restrictions.
