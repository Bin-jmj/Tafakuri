# Mwongozo wa Kuchangia (Contributing)

Asante kwa kupenda kuchangia Tafakuri! Mwongozo huu unaelezea jinsi ya kuanza.

## Kuanzisha mazingira ya maendeleo

1. Fork na clone repository.
2. Sakinisha dependencies:
   ```bash
   pnpm install
   ```
3. Sanidi `.env` yako kwa kufuata [docs/SETUP.md](SETUP.md) (unaweza kutumia mradi wako wa Supabase wa
   majaribio — usitumie data ya uzalishaji/production kwa maendeleo).
4. Anzisha server:
   ```bash
   pnpm dev
   ```

## Aina za michango

- **Marekebisho ya tafsiri/maudhui** — kosa la kiimla, tafsiri, au maelezo ya hadithi/dua, tuma Pull Request
  inayoelezea chanzo sahihi.
- **Vipengele vipya** — fungua Issue kwanza ili kuzungumza kuhusu wazo kabla ya kuandika msimbo mkubwa.
- **Marekebisho ya hitilafu (bugs)** — eleza jinsi ya kurudia hitilafu (steps to reproduce) kwenye Issue/PR.

## Kanuni za msimbo

- TypeScript ikiwa na `strict: true` — epuka `any` isipokuwa lazima kabisa.
- Tumia vipengele vilivyopo kwenye `components/ui/` (shadcn/ui) badala ya kuunda upya.
- Data zote kutoka Supabase zinapaswa kupita kwenye `lib/mappers.ts` kabla ya kufikia UI — usitumie majina ya
  safu za database (snake_case) moja kwa moja kwenye components.
- Server Components zinazopitisha data kwenda Client Components zinapaswa kupitisha "plain objects" tu — usipitishe
  Zod schema au class instances nyingine (tazama maelezo ya CMS kwenye
  [docs/ARCHITECTURE.md](ARCHITECTURE.md)).
- Maandishi yote ya UI ni kwa Kiswahili.

## Kabla ya kutuma Pull Request

```bash
pnpm tsc --noEmit   # hakikisha hakuna hitilafu za TypeScript
pnpm build          # hakikisha mradi unajengeka (build) bila hitilafu
```

## Usalama

- Kamwe usiweke funguo za siri (`SUPABASE_SERVICE_ROLE_KEY`, `DRIVE_TOKEN_ENCRYPTION_KEY`,
  `GOOGLE_CLIENT_SECRET`, n.k.) kwenye msimbo, migrations, au Pull Requests.
- Ukikuta tatizo la usalama, tafadhali liripoti kwa faragha kupitia anwani iliyoorodheshwa kwenye
  [ukurasa wa Wasiliana Nasi](/contact) badala ya kufungua Issue ya umma.
