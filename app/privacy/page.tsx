export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sera ya Faragha</h1>
        <p className="text-sm text-muted-foreground">Imesasishwa: {new Date().toLocaleDateString("sw-TZ")}</p>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Tafakuri inaheshimu faragha ya watumiaji wake. Sera hii inaelezea taarifa tunazokusanya na jinsi
          tunavyozitumia.
        </p>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Taarifa Tunazokusanya</h2>
          <p>
            Tunakusanya taarifa za msingi za akaunti unapojisajili — jina lako na barua pepe — pamoja na alama
            (bookmarks) unazoweka kwenye maudhui unayopenda. Hatuhifadhi taarifa za malipo au taarifa nyeti za kibinafsi.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Jinsi Tunavyotumia Taarifa</h2>
          <p>
            Taarifa zako zinatumika tu kuwezesha huduma za akaunti, kama kuhifadhi alama zako na kuonyesha maudhui
            yanayofaa. Hatutumii au kuuza taarifa zako kwa wahusika wengine.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Usalama wa Taarifa</h2>
          <p>
            Akaunti na taarifa zako zinahifadhiwa kwa kutumia huduma za Supabase zenye ulinzi wa kiwango cha juu, na
            zinapatikana kwako tu kupitia akaunti yako binafsi.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Mawasiliano</h2>
          <p>
            Kwa maswali yoyote kuhusu sera hii ya faragha, wasiliana nasi kupitia{" "}
            <a href="mailto:tafakuriapp@gmail.com" className="text-primary hover:underline">
              tafakuriapp@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
