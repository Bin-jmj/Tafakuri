// Shared "share as image" template used by the adhkar, hadith and aya cards so
// every downloaded image looks consistent.

const WIDTH = 900
const HEIGHT = 600

export interface ShareImageOptions {
  /** Badge shown top-left, e.g. "Adhkar za Asubuhi", "Hadith ya Leo", "Aya ya Leo". */
  title: string
  /** Badge shown top-right, e.g. category, "Mara: 3x", or "Al-Fatiha (1:1)". */
  meta?: string
  arabicText: string
  translation: string
  /** Optional highlighted note (benefit/lesson), shown in its own box. */
  noteLabel?: string
  note?: string
  /** Small italic line above the watermark, e.g. reference or narrator. */
  source?: string
  theme?: "teal" | "blue"
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export function drawShareImage(opts: ShareImageOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext("2d")!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  if (opts.theme === "blue") {
    grad.addColorStop(0, "#1e3a5f")
    grad.addColorStop(1, "#0f2440")
  } else {
    grad.addColorStop(0, "#0d9488")
    grad.addColorStop(1, "#0f766e")
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Decorative circles
  ctx.beginPath()
  ctx.arc(WIDTH - 80, 80, 120, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  ctx.fill()
  ctx.beginPath()
  ctx.arc(80, HEIGHT - 80, 90, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  ctx.fill()

  // Title badge (top-left)
  ctx.textAlign = "left"
  ctx.fillStyle = "rgba(255,255,255,0.15)"
  ctx.font = "bold 18px sans-serif"
  const titleWidth = Math.max(160, ctx.measureText(opts.title).width + 40)
  ctx.beginPath()
  ctx.roundRect(50, 40, titleWidth, 40, 20)
  ctx.fill()
  ctx.fillStyle = "#ffffff"
  ctx.fillText(opts.title, 70, 66)

  // Meta badge (top-right)
  if (opts.meta) {
    ctx.font = "16px sans-serif"
    const metaWidth = Math.max(120, ctx.measureText(opts.meta).width + 40)
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    ctx.beginPath()
    ctx.roundRect(WIDTH - 50 - metaWidth, 40, metaWidth, 40, 20)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "right"
    ctx.fillText(opts.meta, WIDTH - 70, 66)
    ctx.textAlign = "left"
  }

  // Arabic text
  ctx.textAlign = "center"
  ctx.fillStyle = "#ffffff"
  const arabicFont = "bold 32px serif"
  const arabicLines = wrapText(ctx, opts.arabicText, WIDTH - 100, arabicFont)
  ctx.font = arabicFont
  let y = 160
  for (const line of arabicLines.slice(0, 3)) {
    ctx.fillText(line, WIDTH / 2, y)
    y += 46
  }

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.3)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, y + 10)
  ctx.lineTo(WIDTH - 80, y + 10)
  ctx.stroke()
  y += 40

  // Translation
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  const trLines = wrapText(ctx, opts.translation, WIDTH - 120, "20px sans-serif")
  for (const line of trLines.slice(0, 3)) {
    ctx.fillText(line, WIDTH / 2, y)
    y += 32
  }

  // Optional note (benefit/lesson)
  if (opts.note) {
    y += 14
    const noteFont = "15px sans-serif"
    const noteLines = wrapText(ctx, opts.note, WIDTH - 160, noteFont).slice(0, 2)
    const boxHeight = 30 + noteLines.length * 22
    const boxTop = y
    ctx.fillStyle = "rgba(255,255,255,0.08)"
    ctx.beginPath()
    ctx.roundRect(80, boxTop, WIDTH - 160, boxHeight, 12)
    ctx.fill()

    let noteY = boxTop + 26
    if (opts.noteLabel) {
      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.85)"
      ctx.fillText(opts.noteLabel, WIDTH / 2, noteY)
      noteY += 22
    }
    ctx.font = noteFont
    ctx.fillStyle = "rgba(255,255,255,0.75)"
    for (const line of noteLines) {
      ctx.fillText(line, WIDTH / 2, noteY)
      noteY += 22
    }
  }

  // Source line + watermark
  if (opts.source) {
    ctx.font = "italic 15px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.fillText(opts.source, WIDTH / 2, HEIGHT - 50)
  }
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.fillText("Tafakuri", WIDTH / 2, HEIGHT - 25)

  return canvas
}

/** Builds a collision-safe filename from the current date/time, e.g. "aya-20260614-143205.png". */
export function buildShareFilename(prefix: string, ext = "png"): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${prefix}-${stamp}.${ext}`
}

export function downloadCanvasAsImage(canvas: HTMLCanvasElement, prefix: string) {
  const link = document.createElement("a")
  link.download = buildShareFilename(prefix)
  link.href = canvas.toDataURL("image/png")
  link.click()
}
