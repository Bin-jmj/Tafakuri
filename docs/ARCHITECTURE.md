# Muundo wa Mfumo (Architecture)

Muhtasari wa jinsi Tafakuri imejengwa, kwa wachangiaji wanaotaka kufanya kazi kwenye msimbo.

## Muhtasari wa Juu (High level)

- **Next.js App Router** — kurasa za umma (`/`, `/quran`, `/hadith`, `/dua`, `/articles`, `/vitabu`, `/search`,
  `/profile`) na paneli ya wasimamizi (`/admin/*`).
- **Supabase Postgres** — chanzo kimoja cha ukweli (single source of truth) kwa maudhui yote, akaunti za
  watumiaji, na alama (bookmarks).
- **Row Level Security (RLS)** — kila jedwali lina sera zinazoamua nani anaweza kusoma/kuandika. Maudhui ya umma
  (Qur'ani, Hadith, Dua, Adhkar, Makala, Vitabu vinavyopatikana) yanasomwa na mtu yeyote; uandishi ni kwa
  wasimamizi (`is_admin()`) tu. `bookmarks` zinasomwa/kuandikwa na mwenyeji wake tu (`user_id = auth.uid()`).
- **Google Drive** — huhifadhi faili za vitabu/sauti/video. Tafakuri haihifadhi faili hizi — inahifadhi tu
  `drive_file_id` na metadata kwenye `media_items`.

## Tabaka za Data (Data layers)

```
Supabase (snake_case rows)
        │
        ▼
lib/mappers.ts          — hubadilisha rows -> app types (camelCase)
        │
        ▼
lib/types.ts             — types za programu (Surah, Hadith, Dua, Book, ...)
        │
        ▼
Server Components / hooks — huvifanya kazi kwenye UI
```

Kanuni: **Server Components** (`app/**/page.tsx`) huita `createClient()` kutoka `lib/supabase/server.ts`
(imeunganishwa na cookies za request), zinasoma data moja kwa moja kutoka Supabase, na kuzibadilisha kwa
`lib/mappers.ts` kabla ya kuzipitisha kwa Client Components.

**Client Components** (k.m. `hooks/use-bookmarks.ts`, vipengele vya CMS) huita `createClient()` kutoka
`lib/supabase/client.ts` (browser client) kwa vitendo vinavyohitaji mwingiliano wa papo hapo (auth, bookmarks,
CMS create/update/delete).

## Auth na Wasimamizi

- Auth inasimamiwa na Supabase Auth (`@supabase/ssr`).
- Kila mtumiaji mpya anapata safu kwenye `profiles` (kupitia trigger `on_auth_user_created`), na `role` ya
  kawaida ni `user`.
- Ili kufanya mtumiaji kuwa `admin`, badilisha `profiles.role` moja kwa moja kwenye Supabase Dashboard (tazama
  [SETUP.md](SETUP.md)).
- `lib/auth/require-admin.ts` inatumika kwenye API routes za `/admin` kuhakiki kuwa mtumiaji ana `role = admin`
  kabla ya kuruhusu uandishi.

## Maudhui ya Kila Siku na Utafutaji

- `get_daily_hadith()` na `get_daily_dua()` ni Postgres functions zinazochagua hadithi/dua tofauti kila siku
  (kwa kutumia siku ya mwaka), bila kuhitaji "cron" ya kuandika upya data.
- `search_quran_verses`, `search_hadiths`, `search_duas`, `search_articles`, `search_media_items` ni RPCs za
  full-text search (PostgreSQL `tsvector`/`websearch_to_tsquery`), zinazotumiwa na ukurasa wa `/search`.

## CMS ya Wasimamizi

- `lib/cms/resources.ts` inaelezea kila aina ya rasilimali (hadithi, dua, adhkar, makala, aya, vitabu/sauti/video)
  — jedwali, sehemu (fields), schema ya uthibitisho (Zod), na thamani chaguo-msingi.
- `components/admin/cms/cms-resource-page.tsx` ni component moja inayotumika kwa rasilimali zote — inasoma
  `lib/cms/resources.ts` na kujenga jedwali + fomu kiotomatiki.
- Kurasa za `/admin/<resource>` ni Client Components nyembamba zinazopitisha config ya rasilimali kwa
  `<CmsResourcePage>`. **Muhimu**: config hizi zina Zod schema (class instance), hivyo *haziwezi* kupitishwa
  kutoka Server Component kwenda Client Component — ndiyo sababu kurasa hizi zote ni `"use client"`.
- API routes za CMS (`/api/admin/[resource]`, `/api/admin/[resource]/[id]`) hutumia `createServiceClient()`
  (service role, inapita RLS) baada ya kuhakiki `requireAdmin()`.

## Google Drive Integration

- `lib/drive/tokens.ts` — huhifadhi/husoma refresh token (imesimbwa AES-256-GCM, `lib/drive/crypto.ts`) na folda
  za Drive kwenye `google_drive_tokens` (jedwali hili halina RLS policy — service role tu inaweza kulifikia).
- `lib/drive/client.ts` — hutengeneza Drive API client kwa kutumia refresh token iliyohifadhiwa.
- `app/api/auth/drive/connect` / `callback` — OAuth flow ya mara moja ya msimamizi.
- `app/api/drive/upload` — admin huipakia faili moja kwa moja kwenda Drive (folda inayolingana na aina ya
  media).
- `app/api/drive/file/[id]` — hutiririsha (streams) faili kutoka Drive kwenda kwa mtumiaji, huongeza
  `download_count`, na huzuia faili zisizopatikana (`is_available = false`).
- `supabase/functions/check-media-availability` — Edge Function inayoendeshwa kila usiku (pg_cron) kuangalia
  kama faili bado lipo Drive na kusasisha `is_available`.

## Bookmarks (Alama)

- Jedwali moja `bookmarks` (`user_id`, `content_type`, `content_id`) linahudumia aina zote sita za maudhui
  (`quran_verse`, `hadith`, `dua`, `adhkar`, `article`, `media`).
- `hooks/use-bookmarks.ts` ni hook ya pamoja inayotumika na kadi zote (VerseCard, DuaCard, ArticleCard, n.k.) —
  inahitaji mtumiaji awe ameingia, vinginevyo inaonyesha ujumbe wa "Tafadhali ingia".
- `components/profile/bookmarks-list.tsx` huleta alama zote za mtumiaji na kuzipanga kwa aina kwenye `/profile`.

## Storage (Picha za Jalada)

- Bucket ya umma `covers` (RLS: kusoma kwa wote, kuandika kwa wasimamizi tu).
- `app/api/storage/cover` — admin huipakia picha, hupata URL ya umma, na kuihifadhi kwenye `cover_url` /
  `image_url` ya rasilimali inayohusiana.
