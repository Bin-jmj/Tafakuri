export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Masharti ya Matumizi</h1>
        <p className="text-sm text-muted-foreground">Imesasishwa: {new Date().toLocaleDateString("sw-TZ")}</p>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Kwa kutumia Tafakuri, unakubali masharti yafuatayo. Tafadhali yasome kwa makini kabla ya kutumia huduma
          zetu.
        </p>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Matumizi ya Maudhui</h2>
          <p>
            Maudhui yaliyopo Tafakuri — ikiwemo aya za Qur&apos;ani, tafsiri, hadithi, dua, adhkar, makala na vitabu —
            yametolewa kwa lengo la elimu na manufaa ya Umma. Unaweza kusoma, kushiriki na kupakua maudhui kwa
            matumizi binafsi na ya elimu.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Akaunti ya Mtumiaji</h2>
          <p>
            Unapojisajili, unawajibika kuhakikisha taarifa zako ni sahihi na kulinda taarifa za kuingia kwenye
            akaunti yako. Tafakuri haitawajibika kwa upotevu wa taarifa unaosababishwa na uzembe wa mtumiaji.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Usahihi wa Maudhui</h2>
          <p>
            Tunajitahidi kuhakikisha maudhui yote ni sahihi, lakini tunakaribisha marekebisho kutoka kwa wasomi na
            watumiaji endapo kosa litaonekana. Tafakuri haitoi dhamana ya usahihi kamili wa kila tafsiri au maelezo.
          </p>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">Mabadiliko ya Masharti</h2>
          <p>
            Masharti haya yanaweza kubadilika wakati wowote. Mabadiliko makubwa yataarifiwa kupitia tovuti hii.
          </p>
        </div>
      </div>
    </div>
  )
}
