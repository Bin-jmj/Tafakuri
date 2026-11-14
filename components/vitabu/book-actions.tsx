"use client"

import { MediaActions } from "@/components/media/media-actions"
import type { Book } from "@/lib/types"

interface BookActionsProps {
  book: Book
}

export function BookActions({ book }: BookActionsProps) {
  return (
    <MediaActions
      id={book.id}
      title={book.title}
      author={book.author}
      description={book.description}
      fileUrl={book.fileUrl}
      savedDescription="Kitabu kimehifadhiwa"
    />
  )
}
