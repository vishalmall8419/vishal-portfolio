# Admin Dashboard — Integration Notes

This dashboard was added **inside your existing portfolio frontend**
(`frontend/src/admin/`), not as a separate project. It shares your
build, your `package.json`, your fonts, and your design tokens.

## What was added

```
frontend/src/admin/
  api/            axios client (JWT + auto-refresh), per-resource API modules
  components/     Sidebar, Topbar, DataTable, Modal, ConfirmDialog, FormField,
                   ImageUpload, StatCard, ProtectedRoute
  context/        AuthContext (session), ToastContext (notifications),
                   AdminThemeContext (dashboard's own light/dark toggle —
                   separate from the "Theme" page, which edits the *portfolio's*
                   theme in the database)
  config/         crudConfigs.js — field schemas for the generic CrudPage
  hooks/          useResourceList — list/search/pagination hook
  layout/         AdminLayout — sidebar + topbar + content shell
  pages/          Login, Dashboard, Projects, Blogs, CrudPage (Services,
                   Skills, Education, Certificates, Achievements,
                   Testimonials), Messages, Seo, Theme, Settings
  routes/         AdminRoutes.jsx — the full /admin/* route tree
  styles/         admx-core.css — the dashboard's design system, built
                   entirely on your existing CSS variables (--primary,
                   --bg, --glass-*, --radius-*, etc.) from
                   src/styles/variables.css. Nothing was redefined.
```

## What was changed in your existing files (and why)

- **`src/routes/AppRoutes.jsx`** — added one line:
  `<Route path="/admin/*" element={<AdminRoutes />} />`.
  Nothing else in this file was touched.
- **`src/App.jsx`** — added a check so that `/admin/*` routes skip your
  public site's custom cursor and cinematic intro loader (they're
  public-site UX, not appropriate for a dashboard). Every existing
  behavior for `/`, `/about`, `/skills`, `/projects`, `/contact` is
  byte-for-byte unchanged.

No other file in your portfolio was modified. No existing component,
page, or CSS file was touched.

## Environment

Create `frontend/.env` (Vite reads `VITE_*` vars):

```
VITE_API_URL=http://localhost:5000/api
VITE_FILE_URL=http://localhost:5000
```

If omitted, both default to `http://localhost:5000` — fine for local dev
against the backend from Phase 1.

## Running it

```bash
cd frontend
npm install   # no new packages were added — axios, gsap, react-icons,
              # and react-router-dom were already in your package.json
npm run dev
```

Visit `http://localhost:5173/admin/login` and sign in with the admin
account you created via the backend's `npm run seed`.

## How data flows

Every module (Projects, Blogs, Services, Skills, Education, Certificates,
Achievements, Testimonials, Messages, SEO, Theme, Settings) talks to the
Phase 1 backend over `/api/...`. Creating/editing/deleting in the
dashboard writes straight to MySQL through those REST endpoints — there
is no separate "publish" step. Your public portfolio pages should read
from the same endpoints (e.g. `GET /api/projects?status=published`,
`GET /api/theme`, `GET /api/settings`) to go fully dynamic; currently
your portfolio pages render static/hardcoded content, so wiring each
public page to its endpoint is the next integration step **on the
portfolio side** (happy to do that next if you want the public site to
actually reflect what you manage here).

## Auth model

- Login: `POST /api/auth/login` → JWT access token (kept in
  `localStorage` if "Remember me" is checked, `sessionStorage`
  otherwise) + an httpOnly refresh cookie.
- Every request attaches `Authorization: Bearer <token>`.
- On a 401, the axios interceptor calls `/api/auth/refresh` once,
  retries the original request, and only redirects to `/admin/login`
  if the refresh itself fails.
- `AuthContext` restores the session on page load via `GET /api/auth/me`
  if a token is present.

## Extending it

- **Adding a new simple CRUD module**: add a Sequelize model + routes
  on the backend (see the `backend/README.md` pattern), then add one
  entry to `frontend/src/admin/config/crudConfigs.js` describing its
  fields/columns, and one `<Route>` in `AdminRoutes.jsx` using
  `<CrudPage moduleKey="yourModule" />`. No new page component needed.
- **Adding a bespoke module** (like Projects/Blogs): copy the shape of
  `pages/Projects/Projects.jsx` — it uses the same shared components
  (`DataTable`, `Modal`, `FormField`, `ConfirmDialog`) but keeps its own
  field list and column renderers for full control.
