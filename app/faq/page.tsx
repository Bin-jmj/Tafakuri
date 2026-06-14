import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Tafakuri ni nini?",
    answer:
      "Tafakuri ni jukwaa la maarifa ya Kiislamu kwa Kiswahili linalokupa Qur'ani na tafsiri, Hadith za kila siku, Dua na Adhkar, makala, na maktaba ya vitabu, sauti na video.",
  },
  {
    question: "Je, ninahitaji kujisajili kuitumia Tafakuri?",
    answer:
      "Unaweza kusoma maudhui yote bila kujisajili. Hata hivyo, ili kuweka alama (bookmarks) kwenye aya, hadithi, dua au vitabu unavyopenda, unahitaji kuwa na akaunti.",
  },
  {
    question: "Vitabu, sauti na video vinatoka wapi?",
    answer:
      "Maktaba ya Tafakuri inahifadhi faili kupitia Google Drive, na taarifa za kila kitu (kichwa, mwandishi, jamii) zinasimamiwa kwenye mfumo wetu.",
  },
  {
    question: "Nimeona kosa kwenye tafsiri au hadithi, nifanyeje?",
    answer:
      "Tafadhali tujulishe kupitia ukurasa wa Wasiliana Nasi ukitoa maelezo ya kosa na mahali lilipo, ili timu iweze kulirekebisha haraka.",
  },
  {
    question: "Je, Tafakuri ni mradi huria (open source)?",
    answer:
      "Ndiyo, Tafakuri ni mradi huria unaoendelea kuboreshwa kwa michango kutoka kwa jamii kwa lengo la kunufaisha Umma wa Kiislamu.",
  },
]

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Maswali Yanayoulizwa Mara kwa Mara</h1>
        <p className="text-muted-foreground leading-relaxed">
          Majibu ya maswali ya kawaida kuhusu Tafakuri.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
