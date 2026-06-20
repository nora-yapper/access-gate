# Access Gate — Registry Entry System

A minimal, mobile-first checkpoint. Users enter a pre-issued code, register
their details, and are recorded in the registry. The experience is deliberately
procedural — the system feels like it is *processing* the user, not serving a
website.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind v4**,
**Supabase** (Postgres) and **Resend** (email).

## Flow

1. `/` — enter an access code. Validated server-side; a valid code opens a
   signed, http-only session (30 min) and forwards to registration.
2. `/register` — requires a session. Collects name / surname / email, records
   the entry + an audit row, triggers a notification email, issues an
   `Entry ID` (e.g. `AX-20491`).
3. `/confirmation` — sequential system messages + the entry id. No navigation.

## Setup

```bash
npm install
npm run dev
```

### Required environment (`.env.local`)

Already populated except for the secret key:

| Var | Status |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | **you must paste this** — Supabase dashboard → Project Settings → API keys → `service_role` |
| `SESSION_SECRET` | set (change for production) |
| `RESEND_API_KEY` | optional — if empty, the notification is logged to the server console |
| `NOTIFY_EMAIL_TO` / `NOTIFY_EMAIL_FROM` | set |

All database access is server-side via the `service_role` key. Every table has
RLS enabled with **no** anon policies, so the registry is locked down by default.

## Database

Tables: `codes`, `users`, `entries`. Seeded access codes for testing:

```
ORCHID-2049   AX-7781   NOVA-3   CIPHER-X   GATE-0001
```

Add more:

```sql
insert into public.codes (code, label) values ('YOUR-CODE', 'label');
```

## Architecture

```
app/
  page.tsx                  code entry (CodeForm)
  register/page.tsx         session-guarded (RegistrationForm)
  confirmation/page.tsx     entry-guarded (ConfirmationSequence)
  api/validate-code/route.ts
  api/submit-user/route.ts
components/
  ui/        Input, Button
  forms/     CodeForm, RegistrationForm, ConfirmationSequence
  system/    SystemChrome (grid, scanline, clock, session id)
lib/
  supabase.ts  service-role client
  session.ts   HMAC-signed cookie session
  validation.ts
  ids.ts       entry-id generator
  email.ts     Resend notification (logs if unconfigured)
```
