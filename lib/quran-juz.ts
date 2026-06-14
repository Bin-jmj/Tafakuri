// Static reference data for the 30 Juz divisions of the Qur'an. This never
// changes, so it is bundled with the app rather than stored in Supabase.

import type { Juz } from "@/lib/types"

export const quranJuzList: Juz[] = [
  { number: 1,  arabicName: "الم",               startSurah: 1,   startVerse: 1,  endSurah: 2,   endVerse: 141, totalVerses: 148 },
  { number: 2,  arabicName: "سَيَقُولُ",          startSurah: 2,   startVerse: 142, endSurah: 2,   endVerse: 252, totalVerses: 111 },
  { number: 3,  arabicName: "تِلْكَ الرُّسُلُ",   startSurah: 2,   startVerse: 253, endSurah: 3,   endVerse: 92,  totalVerses: 126 },
  { number: 4,  arabicName: "لَنْ تَنَالُوا",     startSurah: 3,   startVerse: 93,  endSurah: 4,   endVerse: 23,  totalVerses: 129 },
  { number: 5,  arabicName: "وَالْمُحْصَنَاتُ",   startSurah: 4,   startVerse: 24,  endSurah: 4,   endVerse: 147, totalVerses: 124 },
  { number: 6,  arabicName: "لَا يُحِبُّ اللَّهُ", startSurah: 4,   startVerse: 148, endSurah: 5,   endVerse: 81,  totalVerses: 111 },
  { number: 7,  arabicName: "وَإِذَا سَمِعُوا",   startSurah: 5,   startVerse: 82,  endSurah: 6,   endVerse: 110, totalVerses: 149 },
  { number: 8,  arabicName: "وَلَوْ أَنَّنَا",    startSurah: 6,   startVerse: 111, endSurah: 7,   endVerse: 87,  totalVerses: 142 },
  { number: 9,  arabicName: "قَالَ الْمَلَأُ",    startSurah: 7,   startVerse: 88,  endSurah: 8,   endVerse: 40,  totalVerses: 159 },
  { number: 10, arabicName: "وَاعْلَمُوا",        startSurah: 8,   startVerse: 41,  endSurah: 9,   endVerse: 92,  totalVerses: 129 },
  { number: 11, arabicName: "يَعْتَذِرُونَ",      startSurah: 9,   startVerse: 93,  endSurah: 11,  endVerse: 5,   totalVerses: 148 },
  { number: 12, arabicName: "وَمَا مِنْ دَابَّةٍ", startSurah: 11,  startVerse: 6,   endSurah: 12,  endVerse: 52,  totalVerses: 170 },
  { number: 13, arabicName: "وَمَا أُبَرِّئُ",    startSurah: 12,  startVerse: 53,  endSurah: 14,  endVerse: 52,  totalVerses: 154 },
  { number: 14, arabicName: "رُبَمَا",            startSurah: 15,  startVerse: 1,   endSurah: 16,  endVerse: 128, totalVerses: 227 },
  { number: 15, arabicName: "سُبْحَانَ الَّذِي",  startSurah: 17,  startVerse: 1,   endSurah: 18,  endVerse: 74,  totalVerses: 185 },
  { number: 16, arabicName: "قَالَ أَلَمْ",       startSurah: 18,  startVerse: 75,  endSurah: 20,  endVerse: 135, totalVerses: 233 },
  { number: 17, arabicName: "اقْتَرَبَ",          startSurah: 21,  startVerse: 1,   endSurah: 22,  endVerse: 78,  totalVerses: 190 },
  { number: 18, arabicName: "قَدْ أَفْلَحَ",      startSurah: 23,  startVerse: 1,   endSurah: 25,  endVerse: 20,  totalVerses: 202 },
  { number: 19, arabicName: "وَقَالَ الَّذِينَ",  startSurah: 25,  startVerse: 21,  endSurah: 27,  endVerse: 55,  totalVerses: 299 },
  { number: 20, arabicName: "أَمَّنْ خَلَقَ",     startSurah: 27,  startVerse: 56,  endSurah: 29,  endVerse: 45,  totalVerses: 181 },
  { number: 21, arabicName: "اتْلُ مَا أُوحِيَ", startSurah: 29,  startVerse: 46,  endSurah: 33,  endVerse: 30,  totalVerses: 179 },
  { number: 22, arabicName: "وَمَنْ يَقْنُتْ",   startSurah: 33,  startVerse: 31,  endSurah: 36,  endVerse: 27,  totalVerses: 169 },
  { number: 23, arabicName: "وَمَا لِيَ",         startSurah: 36,  startVerse: 28,  endSurah: 39,  endVerse: 31,  totalVerses: 357 },
  { number: 24, arabicName: "فَمَنْ أَظْلَمُ",   startSurah: 39,  startVerse: 32,  endSurah: 41,  endVerse: 46,  totalVerses: 246 },
  { number: 25, arabicName: "إِلَيْهِ يُرَدُّ",  startSurah: 41,  startVerse: 47,  endSurah: 45,  endVerse: 37,  totalVerses: 246 },
  { number: 26, arabicName: "حم",                 startSurah: 46,  startVerse: 1,   endSurah: 51,  endVerse: 30,  totalVerses: 242 },
  { number: 27, arabicName: "قَالَ فَمَا خَطْبُكُمْ", startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29, totalVerses: 304 },
  { number: 28, arabicName: "قَدْ سَمِعَ اللَّهُ", startSurah: 58, startVerse: 1,  endSurah: 66,  endVerse: 12,  totalVerses: 137 },
  { number: 29, arabicName: "تَبَارَكَ الَّذِي",  startSurah: 67,  startVerse: 1,   endSurah: 77,  endVerse: 50,  totalVerses: 431 },
  { number: 30, arabicName: "عَمَّ",              startSurah: 78,  startVerse: 1,   endSurah: 114, endVerse: 6,   totalVerses: 564 },
]
