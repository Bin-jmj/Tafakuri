# Tafakuri

Tafakuri ni jukwaa huria (open source) la maarifa ya Kiislamu kwa lugha ya Kiswahili — Qur'ani Tukufu na tafsiri,
Hadith za kila siku, Dua na Adhkar, makala, na maktaba ya vitabu/sauti/video.

## Vipengele (Features)

- **Qur'ani** — Surah zote, aya na tafsiri ya Kiswahili, zilizopangwa kwa Sura na Juzuu
- **Hadith** — hadithi ya siku, iliyochaguliwa kila siku kutoka kwenye mkusanyiko
- **Dua na Adhkar** — dua kwa makundi, na adhkar za asubuhi/jioni
- **Makala** — makala za elimu zilizopangwa kwa jamii
- **Maktaba** — vitabu, sauti na video zinazohifadhiwa kwenye Google Drive ya msimamizi
- **Tafuta** — utafutaji wa maandishi kamili (full-text search) kwenye maudhui yote
- **Alama (Bookmarks)** — watumiaji wanaweza kuhifadhi aya, hadithi, dua, adhkar, makala na vitabu wanavyopenda
- **Paneli ya Wasimamizi** — CMS rahisi ya kuongeza/kuhariri/kufuta maudhui yote, na kusimamia watumiaji

## Teknolojia (Tech stack)

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, Storage, Edge Functions, pg_cron
- [Google Drive API](https://developers.google.com/drive) — hifadhi ya vitabu/sauti/video
- [pnpm](https://pnpm.io) — package manager

## Kuanza (Getting started)

### 1. Sakinisha dependencies

```bash
pnpm install
```

### 2. Sanidi mazingira (environment variables)

Nakili `.env.example` kwenda `.env` na ujaze thamani zako:

```bash
cp .env.example .env
```

Tazama [docs/SETUP.md](docs/SETUP.md) kwa maelekezo kamili ya kuunda mradi wa Supabase, kuunganisha Google Drive,
na kupata kila ufunguo unaohitajika.

### 3. Sukuma migrations kwenye Supabase

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. (Hiari) Jaza maudhui ya mfano

```bash
pnpm seed
```

### 5. Anzisha server ya maendeleo

```bash
pnpm dev
```

Fungua [http://localhost:3000](http://localhost:3000).

## Muundo wa Mradi (Project structure)

```
app/                # Next.js App Router — kurasa za umma na za wasimamizi (/admin)
components/         # UI components (shadcn/ui + vipengele vya programu)
hooks/              # React hooks (alama/bookmarks, CMS resources, n.k.)
lib/
  supabase/         # Supabase browser/server clients + generated types
  drive/            # Google Drive OAuth, tokens, folder helpers
  cms/              # Usanidi wa CMS (resources & field configs)
  mappers.ts        # Hubadilisha Supabase rows -> app types
supabase/
  migrations/       # SQL schema, RLS policies, RPCs za search/daily content
  functions/        # Edge Functions (k.m. ukaguzi wa upatikanaji wa Drive)
scripts/seed.ts     # Inajaza Supabase na maudhui ya mfano
```

Maelezo zaidi ya jinsi vipande hivi vinavyounganika yako kwenye [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Kuchangia (Contributing)

Tafakuri ni mradi huria na tunakaribisha michango. Soma [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) kabla ya
kutuma Pull Request.

## Leseni (License)

Mradi huu umetolewa chini ya leseni ya [MIT](LICENSE).
