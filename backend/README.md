# Portfolio Backend (Node / Express / MySQL / Sequelize)

This is the backend the existing admin dashboard (in `frontend/src/admin`) was
already built to talk to, but which did not exist in the uploaded project. It
implements the exact REST contract the frontend's `admin/api/*.js` files
already call — no frontend admin code needed to change.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your MySQL credentials + JWT secrets
# create the database once:  CREATE DATABASE portfolio_cms;
npm run seed            # creates the first admin login + your profile/education rows
npm run dev              # http://localhost:5000/api
```

Login with the email/password you set as `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
`.env` before running `npm run seed`. Change the password immediately after
first login (Settings → Password tab already wired to `PUT /auth/change-password`).

## What this covers

- **Auth**: JWT access token (15 min) + httpOnly rotating refresh token cookie,
  login/me/refresh/logout/change-password, bcrypt hashing, brute-force rate limiting.
  Login is now two-step: `POST /auth/login` (email+password) issues a short-lived
  `otpToken` and emails a 6-digit code; `POST /auth/verify-otp` (otpToken+otp)
  completes the session. `POST /auth/resend-otp` re-sends a code (cooldown +
  rate limited). OTPs are bcrypt-hashed at rest, expire after `OTP_EXPIRES_MIN`
  minutes, are single-use, and lock out after `OTP_MAX_ATTEMPTS` wrong guesses.
- **Admin CRUD** (all behind auth, paginated, searchable): projects, blogs,
  services, skills, education, certificates, achievements, testimonials —
  field-for-field matching `src/admin/config/crudConfigs.js` and the bespoke
  Projects/Blogs pages already in the frontend.
- **Messages**: contact-form inbox (list/read/unread-count/toggle/delete).
- **Notifications**: every contact-form submission also creates a `Notification`
  row (`/api/notifications` — list/unread-count/mark-read/mark-all-read/delete)
  and emails the full submission (name/email/phone/subject/message/date/time/
  IP/user-agent) to `ADMIN_NOTIFY_EMAIL`. Drives the bell icon + badge in the
  admin topbar/sidebar and the dedicated Notifications page.
- **SEO**: per-page meta title/description/keywords/OG/Twitter/canonical.
- **Theme** and **Settings** (profile, social links, logo/favicon/resume) as
  singleton records, including the asset upload endpoints.
- **Dashboard**: stats + recent-activity aggregation.
- **Public read-only API** at `/api/public/*` (projects, blogs, services,
  skills, education, certificates, achievements, testimonials, settings,
  theme, seo-by-page, contact submission) — published/active rows only.
  This exists so the public portfolio pages *can* become dynamic; they are
  not wired to it yet (see "Still to do" below).
- **Security**: helmet, CORS locked to `CLIENT_URL`, rate limiting (global +
  auth + contact form + OTP), multer file-type/size validation, parameterized
  queries via Sequelize (no raw SQL), centralized error handler that never
  leaks stack traces in production.
- **File uploads**: stored under `/uploads`, served statically, old file
  cleaned up automatically on replace/delete.
- **Email (SMTP)**: `src/utils/email.js` wraps nodemailer. Configure
  `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` in
  `.env`. If `SMTP_HOST` is unset, emails are skipped with a console warning
  instead of failing the request — handy for local dev without a mail server.

## Still to do (not in this pass)

- **Wire the public frontend pages** (`Home`, `About`, `Skills`, `Projects`,
  `Profile`, and the section components under `components/sections/*`) to
  fetch from `/api/public/*` instead of their current hardcoded JSX content.
  This is the single largest remaining piece of work — it touches ~15+
  section components.
- **Missing pages** the original instructions asked for that don't exist yet
  in the frontend at all: standalone Service/Project/Blog detail pages,
  Gallery, FAQ page (a `FAQ` section component exists but no route), Privacy
  Policy, Terms, 404, Coming Soon, Search.
- **robots.txt / sitemap.xml / manifest.json** — none exist in `frontend/public`
  yet; generating an accurate sitemap needs the public API above to be live
  first (slugs come from the database, not hardcoded).
- **JSON-LD structured data** (Person/Organization/Website/Article/Project/
  Service/FAQ/Breadcrumb schema) on the public pages — straightforward once
  those pages read from `/api/public/*`, since the schema needs the same data.
- **Migrations**: this uses `sequelize.sync({ alter: true })` for fast setup.
  A production deploy should replace that with real `sequelize-cli` migrations
  so schema changes are reviewable and reversible.

## Honesty note on verification

I don't have network access or a MySQL instance in this environment, so I
could not run `npm install`, start the server, or execute requests against a
live database — I can't claim "every route verified" the way the original
instructions asked for. What I *did* do: read every file in the uploaded
frontend/admin code to match this API to the exact contract it already
expects (response envelopes, field names, upload field names, pagination
shape), and syntax-checked every backend file with `node --check`. Please
run `npm install && npm run dev` locally (or paste back any error) and I'll
fix anything that surfaces.
