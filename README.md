# Earnest Abraham – Portfolio + Admin CMS
React + Vite + TypeScript + Tailwind + Framer Motion + Supabase (Postgres, Auth, Storage, RLS).
One deployable app: the public site is `/`, the protected admin is `/admin` (code split under `src/pages` and `src/admin`; shared client in `src/lib`).

## 1. Supabase setup
1. Create a project at supabase.com.
2. SQL Editor: run `supabase/migrations/001_init.sql`, then `supabase/seed.sql` (optional).
3. Authentication > Providers > Email: **disable "Allow new users to sign up"** after creating your admin.
4. Authentication > Users > Add user (your email and password). Then run `supabase/admin_setup.sql` with your email. Only users in the `admins` table can write; RLS enforces this in the database.
5. Project Settings > API: copy the URL and the **anon** key. Never use the service_role key here.

## 2. Local development
```
cp .env.example .env   # fill in URL + anon key
npm install
npm run dev            # http://localhost:5173  (admin: /admin)
npm run build          # type-check + production build
```

## 3. Deploy (Vercel / Netlify / Cloudflare Pages)
Build command `npm run build`, output `dist`, env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. SPA fallbacks are included (`vercel.json`, `public/_redirects`). Content edits in /admin appear live with no redeploy.

## 4. Using the admin
Profile / Hero / About / Social / Resume live in **Profile**. Every list section supports add, edit, delete, up/down reorder, drafts and publish. Images are compressed to WebP (max 1600px) before upload; resume must be a PDF (10 MB limit).

## Known limitations
Plain-text editor (no rich text), up/down buttons instead of drag-and-drop, no separate live-preview pane (use "View site" and the draft/publish toggle), no automated tests. Not verified against a live Supabase project: run the checklist in section 1 and try each admin screen.
