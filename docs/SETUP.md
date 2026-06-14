# Mwongozo wa Usanidi (Setup Guide)

Mwongozo huu unaelezea jinsi ya kusanidi Tafakuri kutoka mwanzo: mradi wa Supabase, hifadhidata, Google Drive, na
akaunti ya msimamizi.

## 1. Mahitaji (Prerequisites)

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- Akaunti ya [Supabase](https://supabase.com)
- Akaunti ya Google (kwa Google Drive na Google Cloud Console)
- [Supabase CLI](https://supabase.com/docs/guides/cli) iliyosakinishwa

## 2. Unda mradi wa Supabase

1. Fungua [supabase.com/dashboard](https://supabase.com/dashboard) na unda mradi mpya.
2. Nenda **Project Settings → API** na nakili:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (siri kabisa — usiitume kwa browser)

## 3. Unganisha CLI na sukuma migrations

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Hii itaunda jedwali zote (`profiles`, `surahs`, `quran_verses`, `hadiths`, `duas`, `adhkar`, `articles`,
`media_items`, `bookmarks`, `google_drive_tokens`), Row Level Security policies, RPCs za "daily content" na
"full-text search", na bucket ya Storage ya `covers`.

## 4. Jaza maudhui ya mfano (hiari)

```bash
pnpm seed
```

Hii itajaza Qur'ani, Hadith, Dua, Adhkar, Makala na Vitabu vya mfano kutoka `lib/mock-data.ts`.

## 5. Fanya akaunti yako kuwa Msimamizi (Admin)

1. Jisajili kwenye programu (`/auth/sign-up`).
2. Kwenye Supabase Dashboard → **Table Editor → profiles**, tafuta safu yako (kwa `id` inayofanana na
   `auth.users.id` yako) na ubadilishe `role` kuwa `admin`.

Sasa unaweza kufikia `/admin`.

## 6. Sanidi Google Drive (kwa Maktaba ya vitabu/sauti/video)

### 6.1 Unda OAuth client kwenye Google Cloud Console

1. Fungua [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. Wezesha **Google Drive API**.
3. Unda **OAuth client ID** ya aina **Web application**.
4. Ongeza Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/drive/callback
   ```
   (badilisha domain kwa URL yako halisi kwenye uzalishaji/production)
5. Nakili `Client ID` na `Client Secret` kwenda `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (lazima ifanane kabisa na uliyoweka hapo juu)

### 6.2 Tengeneza ufunguo wa kusimba (encryption key)

Refresh token ya Drive inahifadhiwa kwenye Supabase ikiwa imesimbwa (encrypted) kwa AES-256-GCM. Tengeneza ufunguo:

```bash
openssl rand -hex 32
```

Weka matokeo kwenye `DRIVE_TOKEN_ENCRYPTION_KEY`.

### 6.3 Unganisha Drive ya msimamizi

1. Ingia kama msimamizi, fungua `/api/auth/drive/connect` (au kiungo kwenye paneli ya Maktaba).
2. Kubali ruhusa za Google Drive na akaunti ya Google unayotaka kuhifadhi vitabu/sauti/video.
3. Refresh token itahifadhiwa (imesimbwa) kwenye jedwali `google_drive_tokens`.

Mara baada ya kuunganishwa, unaweza kupakia faili kwenye `/admin/vitabu` — kila faili litahifadhiwa kwenye folda
inayolingana (Vitabu/Sauti/Video) kwenye Drive ya msimamizi.

## 7. (Hiari) Ukaguzi wa kila usiku wa upatikanaji wa faili za Drive

`supabase/functions/check-media-availability` ni Edge Function inayokagua kila `media_item` ina `drive_file_id`
bado ipo kwenye Drive, na kubadilisha `is_available` kama faili limefutwa.

### 7.1 Deploy Edge Function

```bash
supabase functions deploy check-media-availability
```

### 7.2 Weka secrets zinazohitajika na function

```bash
supabase secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... DRIVE_TOKEN_ENCRYPTION_KEY=...
```

(`SUPABASE_URL` na `SUPABASE_SERVICE_ROLE_KEY` zinawekwa kiotomatiki na Supabase kwa Edge Functions.)

### 7.3 Ratibisha (schedule) kazi ya kila usiku

Fungua **SQL Editor** kwenye Supabase Dashboard na uendeshe (badilisha `<PROJECT_REF>` na ufunguo wako wa
service role — **usihifadhi hii kwenye faili la migration**, iendeshe moja kwa moja kwenye dashibodi):

```sql
select cron.schedule(
  'check-media-availability-nightly',
  '0 2 * * *', -- 02:00 kila siku
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/check-media-availability',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 8. Anzisha mradi

```bash
pnpm dev
```

## Marejeo (Reference) — Environment variables

| Variable | Maelezo |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL ya mradi wa Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ufunguo wa umma (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Ufunguo wa service role — server-side tu |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth client ya Google Drive |
| `GOOGLE_REDIRECT_URI` | Redirect URI ya OAuth (lazima ifanane na Google Cloud Console) |
| `DRIVE_TOKEN_ENCRYPTION_KEY` | Hex string ya herufi 64 (bytes 32) kusimba refresh token |
| `NEXT_PUBLIC_SITE_URL` | URL kamili ya tovuti (kwa metadata/share links) |
