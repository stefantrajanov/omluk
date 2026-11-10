# Фурна Омлук Коцеви — нарачки

Mobile-first order tracker (Next.js 16 + Supabase) replacing the paper order sheet. UI is Macedonian only.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm dev
```

### Environment variables (server-only, no `NEXT_PUBLIC_`)

| Name | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |

### Database migration

Apply `supabase/migrations/0001_init.sql` once, either by pasting it into the Supabase SQL editor or with the CLI:

```bash
supabase db push
```

Until it is applied the app shows a "database not ready" screen instead of crashing.

## Scripts

`pnpm lint` · `pnpm exec tsc --noEmit` · `pnpm build`
