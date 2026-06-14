import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mapBook } from "@/lib/mappers"
import { BookActions } from "@/components/vitabu/book-actions"
import { PdfReader } from "@/components/vitabu/pdf-reader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, ChevronLeft, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookReaderPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: bookRow } = await supabase.from("media_items").select("*").eq("id", id).eq("type", "book").maybeSingle()
  if (!bookRow) notFound()

  const book = mapBook(bookRow)

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Back */}
      <Link href="/vitabu">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Rudi kwenye Vitabu
        </Button>
      </Link>

      {/* Book info header */}
      <Card className="mb-6 overflow-hidden border-primary/15">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Cover */}
            <div className="relative w-full sm:w-44 h-48 sm:h-auto flex-shrink-0 bg-muted">
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {/* Meta */}
            <div className="flex-1 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <Badge variant="secondary" className="mb-2">{book.category}</Badge>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">{book.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {book.author}
                </span>
                {book.publishedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {book.publishedYear}
                  </span>
                )}
                {book.totalPages && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {book.totalPages} kurasa
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
              <Separator />
              <BookActions book={book} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reader */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Kisomaji cha Kitabu</h2>
            <Badge variant="outline" className="text-xs">{book.language}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {book.fileUrl ? (
            <PdfReader fileUrl={book.fileUrl} bookId={book.id} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Faili la kitabu hiki halipo bado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
