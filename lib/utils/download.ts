/**
 * Fetches a file and triggers a same-origin blob download instead of
 * navigating the browser to `url` directly - mobile Safari/Chrome often
 * ignore the `download` attribute on a plain `<a>` for server-generated
 * responses, so a failed request (e.g. a 502) just navigates and renders
 * the raw error JSON instead of showing it as a download. Throws with the
 * server's error message on failure so callers can show a friendly toast.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? "Imeshindikana kupakua faili")
  }
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}
