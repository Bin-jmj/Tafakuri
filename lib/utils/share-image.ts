// Shared "share as image" template used by the adhkar, hadith and aya cards so
// every downloaded image looks consistent.

const WIDTH = 900
const HEIGHT = 600

export interface ShareImageOptions {
  /** Badge shown top-left, e.g. "Adhkar za Asubuhi", "Hadith ya Leo", "Aya ya Leo". */
  title: string
  /** Badge shown top-right, e.g. category, "Mara: 3x", or "Al-Fatiha (1:1)". */
  meta?: string
  /** Small icon (emoji) shown next to the title badge, e.g. "📖". */
  icon?: string
  arabicText: string
  /** Alignment of the Arabic text block. Defaults to "center". */
  arabicAlign?: "center" | "right"
  /** Heading shown above the translation, e.g. "Tarjama". */
  translationLabel?: string
  translation: string
  /** Optional highlighted note (e.g. tafsir/benefit), shown in its own box. */
  noteLabel?: string
  note?: string
  /** Small italic line above the watermark, e.g. reference or narrator. */
  source?: string
}

// Dark gradient pairs that keep the white overlay text readable. One is picked
// at random each time an image is generated, for visual variety.
const GRADIENT_THEMES: Array<[string, string]> = [
  ["#0d9488", "#0f766e"], // teal
  ["#1e3a5f", "#0f2440"], // navy
  ["#6d28d9", "#3b0764"], // violet
  ["#b45309", "#7c2d12"], // amber
  ["#0e7490", "#164e63"], // cyan
  ["#15803d", "#14532d"], // emerald
  ["#be123c", "#7f1d1d"], // crimson
  ["#4338ca", "#1e1b4b"], // indigo
]

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

  // --- Pass 1: measure wrapped text to size the canvas to fit the full note/tafsir ---
  const arabicFont = "bold 32px serif"
  const arabicLines = wrapText(ctx, opts.arabicText, WIDTH - 100, arabicFont).slice(0, 4)
  const trLines = wrapText(ctx, opts.translation, WIDTH - 120, "20px sans-serif").slice(0, 4)
  const noteLines = opts.note ? wrapText(ctx, opts.note, WIDTH - 160, "15px sans-serif").slice(0, 12) : []

  let contentHeight = 160
  contentHeight += arabicLines.length * 46
  contentHeight += 40 // divider
  if (opts.translationLabel) contentHeight += 26
  contentHeight += trLines.length * 32
  if (noteLines.length) {
    contentHeight += 14 // gap before note box
    contentHeight += 30 + noteLines.length * 22 // note box height
    if (opts.noteLabel) contentHeight += 22
  }
  contentHeight += 90 // source line + watermark

  const height = Math.max(HEIGHT, contentHeight)
  canvas.height = height

  // Background gradient - randomized for visual variety
  const [gradFrom, gradTo] = GRADIENT_THEMES[Math.floor(Math.random() * GRADIENT_THEMES.length)]
  const grad = ctx.createLinearGradient(0, 0, WIDTH, height)
  grad.addColorStop(0, gradFrom)
  grad.addColorStop(1, gradTo)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, height)

  // Decorative circles
  ctx.beginPath()
  ctx.arc(WIDTH - 80, 80, 120, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  ctx.fill()
  ctx.beginPath()
  ctx.arc(80, height - 80, 90, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  ctx.fill()

  // Title badge (top-left)
  ctx.textAlign = "left"
  ctx.fillStyle = "rgba(255,255,255,0.15)"
  ctx.font = "bold 18px sans-serif"
  const titleLabel = opts.icon ? `${opts.icon} ${opts.title}` : opts.title
  const titleWidth = Math.max(160, ctx.measureText(titleLabel).width + 40)
  ctx.beginPath()
  ctx.roundRect(50, 40, titleWidth, 40, 20)
  ctx.fill()
  ctx.fillStyle = "#ffffff"
  ctx.fillText(titleLabel, 70, 66)

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
  const arabicAlign = opts.arabicAlign ?? "center"
  ctx.textAlign = arabicAlign
  const arabicX = arabicAlign === "right" ? WIDTH - 80 : WIDTH / 2
  ctx.fillStyle = "#ffffff"
  ctx.font = arabicFont
  let y = 160
  for (const line of arabicLines) {
    ctx.fillText(line, arabicX, y)
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
  ctx.textAlign = "center"
  if (opts.translationLabel) {
    ctx.font = "bold 15px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillText(`${opts.translationLabel}:`, WIDTH / 2, y)
    y += 26
  }
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.92)"
  for (const line of trLines) {
    ctx.fillText(line, WIDTH / 2, y)
    y += 32
  }

  // Optional note (benefit/tafsir)
  if (noteLines.length) {
    y += 14
    const noteFont = "15px sans-serif"
    const boxHeight = 30 + noteLines.length * 22 + (opts.noteLabel ? 22 : 0)
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
    ctx.fillText(opts.source, WIDTH / 2, height - 50)
  }
  ctx.font = "bold 14px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.fillText("Tafakuri", WIDTH / 2, height - 25)

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
