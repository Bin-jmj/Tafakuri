const MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/x-m4a": "m4a",
  "audio/mp4": "m4a",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}

/** Returns a filename with the extension matching the given MIME type, if it doesn't already have one. */
export function withExtension(filename: string, mimeType?: string | null): string {
  if (/\.[a-z0-9]{2,5}$/i.test(filename)) return filename
  const ext = mimeType ? MIME_EXTENSIONS[mimeType.toLowerCase()] : undefined
  return ext ? `${filename}.${ext}` : filename
}

/** Returns the file extension for a MIME type, or "bin" if unknown. */
export function extensionForMime(mimeType?: string | null): string {
  if (!mimeType) return "bin"
  return MIME_EXTENSIONS[mimeType.toLowerCase()] ?? "bin"
}

const ALLOWED_MEDIA_MIME_TYPES: Record<"book" | "audio" | "video", string[]> = {
  book: ["application/pdf", "application/epub+zip"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/x-m4a", "audio/mp4"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
}

/** Whether a MIME type is one of the formats accepted for a given media type. */
export function isAllowedMediaMimeType(type: "book" | "audio" | "video", mimeType: string): boolean {
  return ALLOWED_MEDIA_MIME_TYPES[type].includes(mimeType.toLowerCase())
}
