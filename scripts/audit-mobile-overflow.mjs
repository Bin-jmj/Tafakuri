// Mobile-viewport overflow audit for Tafakuri.
// Drives the system Edge/Chrome at a phone width and reports, per page,
// any element that extends beyond the viewport (horizontal overflow).
//
// Usage: node scripts/audit-mobile-overflow.mjs [baseURL]
// Default baseURL: http://localhost:3000

import { chromium } from "playwright-core"

const BASE = process.argv[2] ?? "http://localhost:3000"
const ALL_PAGES = [
  "/",
  "/quran",
  "/quran/2",
  "/quran/juz/1",
  "/hadith",
  "/dua",
  "/dua/Afya",
  "/adhkar",
  "/vitabu",
  "/profile",
  "/search",
  "/sauti",
  "/video",
  "/articles",
]
const PAGES = process.argv[3] ? process.argv[3].split(",") : ALL_PAGES

async function findBrowser() {
  for (const channel of ["msedge", "chrome"]) {
    try {
      const b = await chromium.launch({ channel, headless: true })
      console.log(`  (browser: ${channel})`)
      return b
    } catch {
      /* try next */
    }
  }
  throw new Error("No Edge or Chrome installation found")
}

function describe(el) {
  const tag = el.tagName.toLowerCase()
  const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 6).join(" ") : ""
  const text = (el.textContent ?? "").trim().slice(0, 40)
  return `${tag}${cls ? "." + cls.split(".").join(".") : ""}${text ? ` "${text}"` : ""}`
}

const browser = await findBrowser()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone 14-ish
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
})
const page = await context.newPage()

let failures = 0
for (const route of PAGES) {
  try {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 })
    // Let client hydration + skeletons settle.
    await page.waitForTimeout(2500)

    const result = await page.evaluate(() => {
      const vw = 390 // intended viewport width; innerWidth may have expanded
      const docW = document.documentElement.scrollWidth
      const bad = []
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === "hidden" || cs.display === "none") continue
        // Ignore elements clipped by an overflow-hidden ancestor.
        let p = el.parentElement
        let clipped = false
        while (p && p !== document.body) {
          const pcs = getComputedStyle(p)
          if (pcs.overflowX === "hidden" || pcs.overflowX === "clip") {
            clipped = true
            break
          }
          p = p.parentElement
        }
        if (clipped) continue
        if (r.right > vw + 1 || r.left < -1) {
          bad.push({
            left: Math.round(r.left),
            right: Math.round(r.right),
            w: Math.round(r.width),
            tag: el.tagName.toLowerCase(),
            cls: String(el.className).split(/\s+/).slice(0, 6).join(" "),
            text: (el.textContent ?? "").trim().slice(0, 30),
          })
        }
      }
      return { docW, overflow: docW > vw + 1, bad: bad.slice(0, 20) }
    })

    const status = result.overflow ? "❌ OVERFLOW" : "✅ ok"
    console.log(`\n${route}  ${status}  (docW=${result.docW}, intended=390)`)
    for (const b of result.bad) {
      console.log(
        `   <${b.tag}> L${b.left} R${b.right} W${b.w} .${b.cls || "-"} ${b.text ? JSON.stringify(b.text) : ""}`,
      )
    }
  } catch (err) {
    console.log(`\n${route}  ⚠️  ${err.message.split("\n")[0]}`)
  }
}

await browser.close()
console.log(failures === 0 ? "\nALL PAGES CLEAN" : `\n${failures} page(s) with overflow`)
process.exit(0)
