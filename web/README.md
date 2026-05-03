# Dashboard Todo — Frontend

React frontend for the Dashboard Todo app. Provides the workspace-switching UI and Kanban board interface.

## Stack

- **React 19** — UI
- **Vite 8** — dev server and bundler
- **TanStack Router** — file-based routing
- **TanStack Query** — server state and data fetching
- **TypeScript 6**

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

App runs at `http://localhost:5173`. Expects the backend at the URL set in `VITE_API_URL`.

## Environment Variables

| Variable       | Description                            |
|----------------|----------------------------------------|
| `VITE_API_URL` | Backend base URL (no trailing slash)   |

Local: `http://localhost:3000`  
Production: your Render URL

## Routing

File-based routing via TanStack Router. Add pages as files under `src/routes/`. The router plugin auto-generates `routeTree.gen.ts` on dev server start — don't edit it.

```
routes/
├── __root.tsx              # root layout
├── index.tsx               # → redirect to /dashboard
├── login.tsx
├── register.tsx
└── _auth/                  # _ prefix = layout route (not in URL)
    ├── _auth.tsx           # loader: GET /auth/me → 401 redirects to /login
    ├── _auth.dashboard.tsx # workspace list
    └── _auth.workspace.$id.tsx  # kanban board ($id = dynamic segment)
```

## Data Fetching

All API calls go through `src/api/client.ts` — a thin fetch wrapper that sets `baseURL` from `VITE_API_URL` and includes `credentials: 'include'` on every request (required for the httpOnly cookie to be sent cross-origin).

Server state lives in TanStack Query hooks under `src/hooks/`. Never put API data into local component state.

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start Vite dev server           |
| `npm run build`   | Type-check and production build |
| `npm run preview` | Preview the production build    |
| `npm run lint`    | ESLint check                    |

## Deployment (Cloudflare Pages)

- Root directory: `web/`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` env variable pointing to the Render backend URL
- Custom domain: `dash.gorkemkaryol.dev` via Cloudflare DNS CNAME
