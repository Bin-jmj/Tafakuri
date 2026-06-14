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
