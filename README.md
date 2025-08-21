## Aurora Store

Single-brand e-commerce built with Next.js App Router, Supabase, Tailwind, shadcn-style components, and next-intl.

### Features
- Product catalog, product detail, cart, checkout (demo), orders
- Supabase: Postgres, Auth, Storage. RLS-ready tables and views expected.
- i18n: EN + AR with RTL support
- Dark mode with `next-themes`
- Unit/e2e tests via Vitest/RTL/Playwright

### Getting started
1. Create a Supabase project and set the following env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Seed the database using the SQL in `supabase/seed.sql` (to add tables, functions, RLS policies, and sample data).
3. Install deps and run dev:
```bash
npm i
npm run dev
```

### Deployment
- Vercel recommended. Add the two Supabase env vars to the project and set `NEXT_PUBLIC_SITE_URL` if needed.
