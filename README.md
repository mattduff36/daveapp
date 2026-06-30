# Dave Survey

Production Next.js app for structural engineers conducting visual domestic property surveys.

## Features

- Multi-survey dashboard with resume/delete
- Property details capture (type, storeys, garage, attachment, construction)
- Room and elevation checklist with custom areas
- Per-area condition ratings, notes, voice dictation, and photo capture/upload
- Auto-save observations with debounced persistence
- Company logo, address, and default engineer settings
- Admin settings for approved admin emails, including user list and account support actions
- Generated report sections with editable conclusions and recommendations
- Word (.docx) export
- Server-side report emailing via Resend to a hidden default recipient

## Stack

- Next.js App Router + TypeScript
- Supabase Auth, Postgres, Storage
- Resend for email delivery
- Tailwind CSS + Radix/shadcn-style components

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Create a Supabase project and apply migrations:

```bash
npm run db:migrate
```

This runs the SQL files in [`supabase/migrations`](supabase/migrations) against the Postgres credentials in `.env.local`.

4. Configure Resend with a verified sender domain.

5. Start the dev server:

```bash
npm run dev
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public API key |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` | Server-only admin key for listing users and sending account support emails |
| `POSTGRES_HOST` / `POSTGRES_URL_NON_POOLING` | Database connection for migration script |
| `RESEND_API_KEY` | Resend API key for report email delivery |
| `RESEND_FROM_EMAIL` | Verified sender address for outgoing reports |

## Notes

- The default report recipient email is stored in company settings and is never included in generated report content.
- Voice dictation uses the browser Speech Recognition API and falls back gracefully where unsupported.
- Photo and logo assets are stored in a private Supabase Storage bucket with user-scoped RLS policies.
