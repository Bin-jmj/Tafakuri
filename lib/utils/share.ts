export async function shareContent(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return true
    } catch (error) {
      console.log("[v0] Share cancelled or failed", error)
      return false
    }
  }
  return false
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.log("[v0] Copy failed", error)
    return false
  }
}
