# Plan — Native-App Feel (Mobile) + IndexedDB Offline

Status: approved 2026-11-14. Implement in the commit order below.

## Phase A — Native-app feel (mobile)

1. **Viewport & safe areas**
   - Add `viewportFit: "cover"` to the `Viewport` export in `app/layout.tsx`.
   - Pad header, footer, and bottom nav with `env(safe-area-inset-top/bottom)`.
   - Use `100dvh` instead of `100vh`; `overscroll-behavior-y: contain` on readers.
2. **Bottom tab bar** (new `components/layout/bottom-nav.tsx`)
   - Fixed bottom nav, 4–5 primary tabs (Nyumbani, Qur'ani, Tafuta, Vitabu, Alama)
     plus "Zaidi" opening the existing `Sheet` (`mobile-nav.tsx`) for the long tail.
   - Touch targets ≥44px, active-state styling, safe-area padding, hidden on `lg:`.
3. **Touch polish**
   - `-webkit-tap-highlight-color: transparent`; pressed/active states; `vaul`
     bottom sheets for mobile actions; momentum scrolling on long lists.
4. **Standalone PWA polish**
   - Light/dark `theme_color` synced with `AutoTheme`; skeleton loaders for
     perceived speed; keep `InstallBanner` behavior unchanged.

## Phase B — IndexedDB offline data

1. **Library**: `idb` (typed wrapper). Dexie rejected — persistence + queries
   only; React owns UI state.
2. **Schema** (`tafakuri` DB v1) in `lib/offline/schema.ts`:
   - `quran` (id, index surah/juz) · `hadith` (id, collection) ·
     `duas` (id, category) · `adhkar` (id, category)
   - `bookmarks` (key `${type}:${id}`, `synced` flag) ·
     `reading_progress` (same key shape)
   - `downloads` (books: status, cached URLs) · `settings` (KV) ·
     `content_meta` (per-type content version; replaces localStorage tracking
     in `content-precache.tsx`)
3. **Sync layer** (`lib/offline/`): client hydration from a versioned JSON
   endpoint → bulk IDB write only when `content_meta` version changes
   (reuses the existing version-check flow). SW keeps caching RSC/HTML/assets.
4. **Offline-first hooks**: rewrite `hooks/use-bookmarks.ts` and
   `hooks/use-reading-progress.ts` to write IDB instantly (logged-out and
   offline), with an **outbox queue** syncing to Supabase on `online`/login.
   Last-write-wins per key; server wins after fetch.
5. **Hydration discipline**: IDB reads are mount-gated (same pattern as
   `components/pwa/install-banner.tsx`) — never during SSR.
6. **Storage health**: request `navigator.storage.persist()` after first
   precache; surface size estimate in Profile.

## Commit sequence

1. `docs: add AGENTS.md project guide and offline/native plan`
2. `feat(pwa): safe-area viewport + mobile bottom navigation`
3. `feat(pwa): touch interaction polish for native feel`
4. `feat(offline): indexeddb schema and sync layer`
5. `feat(offline): offline-first bookmarks and reading progress with outbox sync`

## Risks

- RSC caching vs IDB overlap → kept separate by design (SW = routes/assets, IDB = structured data).
- Bookmark sync conflicts → outbox with timestamps.
- No test runner configured yet → manual offline checklist + `pnpm tsc` / `pnpm lint`
  until a test-runner decision is recorded.
