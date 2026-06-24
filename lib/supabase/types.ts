// Hand-written mirror of supabase/migrations/0001_init.sql.
// If you change the schema, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// and re-add the helper aliases at the bottom of this file.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      content_meta: {
        Row: {
          id: number
          version: number
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["content_meta"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["content_meta"]["Row"]>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: "user" | "admin"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>
        Relationships: []
      }
      surahs: {
        Row: {
          id: number
          name: string
          arabic_name: string
          number_of_verses: number
          revelation_type: "Makki" | "Madani"
          juz_start: number
        }
        Insert: Database["public"]["Tables"]["surahs"]["Row"]
        Update: Partial<Database["public"]["Tables"]["surahs"]["Row"]>
        Relationships: []
      }
      quran_verses: {
        Row: {
          id: string
          surah_number: number
          verse_number: number
          arabic_text: string
          translation_sw: string
          tafsir: string | null
          moral: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["quran_verses"]["Row"]> & {
          surah_number: number
          verse_number: number
          arabic_text: string
          translation_sw: string
        }
        Update: Partial<Database["public"]["Tables"]["quran_verses"]["Row"]>
        Relationships: []
      }
      hadiths: {
        Row: {
          id: string
          arabic_text: string
          translation_sw: string
          narrator: string
          source: string
          categories: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["hadiths"]["Row"]> & {
          arabic_text: string
          translation_sw: string
          narrator: string
          source: string
          categories: string[]
        }
        Update: Partial<Database["public"]["Tables"]["hadiths"]["Row"]>
        Relationships: []
      }
      duas: {
        Row: {
          id: string
          arabic_text: string
          translation_sw: string
          transliteration: string | null
          categories: string[]
          occasion: string | null
          reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["duas"]["Row"]> & {
          arabic_text: string
          translation_sw: string
          categories: string[]
        }
        Update: Partial<Database["public"]["Tables"]["duas"]["Row"]>
        Relationships: []
      }
      adhkar: {
        Row: {
          id: string
          arabic_text: string
          translation_sw: string
          transliteration: string | null
          count: number
          benefit: string | null
          reference: string | null
          slot: "asubuhi" | "jioni"
          categories: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["adhkar"]["Row"]> & {
          arabic_text: string
          translation_sw: string
          slot: "asubuhi" | "jioni"
          categories: string[]
        }
        Update: Partial<Database["public"]["Tables"]["adhkar"]["Row"]>
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          title: string
          content: string
          categories: string[]
          author: string
          published_date: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["articles"]["Row"]> & {
          title: string
          content: string
          categories: string[]
          author: string
        }
        Update: Partial<Database["public"]["Tables"]["articles"]["Row"]>
        Relationships: []
      }
      media_items: {
        Row: {
          id: string
          type: "book" | "audio" | "video"
          title: string
          author: string | null
          description: string | null
          categories: string[]
          language: string
          cover_url: string | null
          drive_file_id: string | null
          drive_mime_type: string | null
          storage_path: string | null
          file_size_bytes: number | null
          total_pages: number | null
          duration_seconds: number | null
          published_year: string | null
          download_count: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["media_items"]["Row"]> & {
          type: "book" | "audio" | "video"
          title: string
          categories: string[]
        }
        Update: Partial<Database["public"]["Tables"]["media_items"]["Row"]>
        Relationships: []
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          content_type: "quran_verse" | "hadith" | "dua" | "adhkar" | "article" | "media"
          content_id: string
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["bookmarks"]["Row"]> & {
          user_id: string
          content_type: Database["public"]["Tables"]["bookmarks"]["Row"]["content_type"]
          content_id: string
        }
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Row"]>
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          type: "hadith" | "dua" | "adhkar" | "article" | "media"
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string
          slug: string
          type: "hadith" | "dua" | "adhkar" | "article" | "media"
        }
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>
        Relationships: []
      }
      occasions: {
        Row: {
          id: string
          name: string
          recurrence: "weekly_friday" | "date_range"
          start_date: string | null
          end_date: string | null
          priority: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["occasions"]["Row"]> & {
          name: string
          recurrence: "weekly_friday" | "date_range"
        }
        Update: Partial<Database["public"]["Tables"]["occasions"]["Row"]>
        Relationships: []
      }
      occasion_items: {
        Row: {
          id: string
          occasion_id: string
          content_type: "hadith" | "dua" | "adhkar" | "quran_verse"
          content_id: string
          sort_order: number
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["occasion_items"]["Row"]> & {
          occasion_id: string
          content_type: "hadith" | "dua" | "adhkar" | "quran_verse"
          content_id: string
        }
        Update: Partial<Database["public"]["Tables"]["occasion_items"]["Row"]>
        Relationships: []
      }
      rotation_settings: {
        Row: {
          id: number
          adhkar_asubuhi_start: string
          adhkar_jioni_start: string
          adhkar_asubuhi_rotate_seconds: number
          adhkar_jioni_rotate_seconds: number
          sunrise_time: string
          sunset_time: string
          hijri_offset_days: number
          prayer_offset_fajr: number
          prayer_offset_dhuhr: number
          prayer_offset_asr: number
          prayer_offset_maghrib: number
          prayer_offset_isha: number
          content_fajr_start: string
          content_dhuhr_start: string
          content_asr_start: string
          content_maghrib_start: string
          content_isha_start: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["rotation_settings"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["rotation_settings"]["Row"]>
        Relationships: []
      }
      google_drive_tokens: {
        Row: {
          id: number
          refresh_token: string | null
          connected_email: string | null
          books_folder_id: string | null
          audio_folder_id: string | null
          video_folder_id: string | null
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["google_drive_tokens"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["google_drive_tokens"]["Row"]>
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          content_type: "book" | "article"
          content_id: string
          progress_percent: number
          current_page: number | null
          total_pages: number | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["reading_progress"]["Row"]> & {
          user_id: string
          content_type: Database["public"]["Tables"]["reading_progress"]["Row"]["content_type"]
          content_id: string
        }
        Update: Partial<Database["public"]["Tables"]["reading_progress"]["Row"]>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_daily_hadith: { Args: { p_slot?: number }; Returns: Database["public"]["Tables"]["hadiths"]["Row"] }
      get_daily_dua: { Args: Record<string, never>; Returns: Database["public"]["Tables"]["duas"]["Row"] }
      get_daily_verse: { Args: { p_slot?: number }; Returns: Database["public"]["Tables"]["quran_verses"]["Row"] }
      search_quran_verses: { Args: { query: string; max_results?: number }; Returns: Database["public"]["Tables"]["quran_verses"]["Row"][] }
      search_hadiths: { Args: { query: string; max_results?: number }; Returns: Database["public"]["Tables"]["hadiths"]["Row"][] }
      search_duas: { Args: { query: string; max_results?: number }; Returns: Database["public"]["Tables"]["duas"]["Row"][] }
      search_articles: { Args: { query: string; max_results?: number }; Returns: Database["public"]["Tables"]["articles"]["Row"][] }
      search_media_items: { Args: { query: string; max_results?: number }; Returns: Database["public"]["Tables"]["media_items"]["Row"][] }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
