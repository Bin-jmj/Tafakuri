export function BismillahCard() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 px-4 mb-2 rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15">
      <p className="arabic-text text-3xl text-foreground leading-loose text-center">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      <p className="text-sm text-muted-foreground text-center">
        Kwa jina la Mwenyezi Mungu, Mwingi wa rehema, Mwenye kurehemu
      </p>
    </div>
  )
}
