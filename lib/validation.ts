// Zod schemas for validation

import { z } from "zod"

export const userSchema = z.object({
  email: z.string().email("Barua pepe si sahihi"),
  password: z.string().min(6, "Nenosiri lazima liwe na angalau herufi 6"),
  name: z.string().min(2, "Jina lazima liwe na angalau herufi 2"),
})

export const loginSchema = z.object({
  email: z.string().email("Barua pepe si sahihi"),
  password: z.string().min(1, "Nenosiri linahitajika"),
})

export const bookmarkSchema = z.object({
  userId: z.string(),
  type: z.enum(["quran", "hadith", "article", "dua"]),
  itemId: z.string(),
})

export const duaSchema = z.object({
  arabicText: z.string().min(1, "Maandishi ya Kiarabu yanahitajika"),
  swahiliTranslation: z.string().min(1, "Tafsiri ya Kiswahili inahitajika"),
  transliteration: z.string().optional(),
  category: z.string().min(1, "Kategoria inahitajika"),
  occasion: z.string().min(1, "Tukio linahitajika"),
  reference: z.string().optional(),
})

export type UserInput = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BookmarkInput = z.infer<typeof bookmarkSchema>
export type DuaInput = z.infer<typeof duaSchema>
