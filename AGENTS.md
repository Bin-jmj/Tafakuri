# Tafakuri — Islamic PWA (Next.js 16)

## Commands

- Dev: `pnpm dev` (Next dev server)
- Build: `pnpm build`
- Lint: `pnpm lint` (ESLint, no fix flag)
- Typecheck: `pnpm tsc` (no dedicated script; `tsconfig.tsbuildinfo` present)
- Start prod: `pnpm start`
- Seed: `pnpm seed`, `pnpm seed:quran`, `pnpm seed:hadiths`, `pnpm seed:duas` (all require `.env` — run via `tsx --env-file=.env`)

## Stack

- Next.js 16 App Router, React 19, TypeScript 5.7, pnpm
- Tailwind CSS 4 (via `@tailwindcss/postcss`) + shadcn/Radix UI (`components.json`)
- Supabase: SSR auth + Postgres (`lib/supabase/*`, `supabase/config.toml`)
- State: Zustand + Immer
- PWA: `app/manifest.ts`, `public/sw.js` (Cache Storage: shell/pages/RSC/assets/books), `app/api/precache-manifest/route.ts`

## Repo-specific notes

- `proxy.ts` is Next 16's renamed `middleware.ts` — do not recreate `middleware.ts`.
- `public/sw.js`: `CACHE_VERSION` bump wipes versioned caches; the unversioned
  `tafakuri-books` cache must never be wiped by version bumps (large user files).
- Seed scripts read `.env` directly — never commit secrets; `.env.example` is the template.
- No test runner is configured yet; don't invent one without a decision record.
- Content (Qur'an, Hadith, Duas, Adhkar) is precached for offline via the SW
  `PRECACHE_CONTENT` flow; books/audio/video are on-demand downloads only.
