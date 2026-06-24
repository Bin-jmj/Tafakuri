// Tafakuri service worker - enables offline reading of previously visited
// Qur'ani pages and downloaded Vitabu (book) files.

const CACHE_VERSION = "v2"
const SHELL_CACHE = `tafakuri-shell-${CACHE_VERSION}`
const PAGES_CACHE = `tafakuri-pages-${CACHE_VERSION}`
const RSC_CACHE = `tafakuri-rsc-${CACHE_VERSION}`
const ASSETS_CACHE = `tafakuri-assets-${CACHE_VERSION}`
// Not versioned: downloaded books are large user files that should survive
// app updates - bumping CACHE_VERSION must never wipe them.
const BOOKS_CACHE = "tafakuri-books"

const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, RSC_CACHE, ASSETS_CACHE, BOOKS_CACHE]

const APP_SHELL_URLS = [
  "/offline",
  "/logo.png",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

// Full offline precache of the core text content (Qur'an, Hadith, Dua,
// Adhkar) - triggered by the client (see content-precache.tsx) when
// /api/content-version reports a version newer than what's already cached.
// Vitabu (books/audio/video) is intentionally excluded - those are real
// files downloaded on demand, not bundled wholesale.
let activePrecache = null

self.addEventListener("message", (event) => {
  if (event.data?.type === "PRECACHE_CONTENT") {
    if (!activePrecache) {
      activePrecache = precacheContent().finally(() => {
        activePrecache = null
      })
    }
    event.waitUntil(activePrecache)
  }
})

// Kept low (not the per-origin connection-limit ceiling) so a background
// precache sweep never starves a real foreground request - e.g. opening a
// book - of a connection slot.
const PRECACHE_CONCURRENCY = 3

async function notifyClients(message) {
  const clients = await self.clients.matchAll()
  for (const client of clients) client.postMessage(message)
}

async function precacheOneUrl(pagesCache, rscCache, url) {
  await Promise.all([
    fetch(url)
      .then((res) => {
        if (res.ok) pagesCache.put(url, res)
      })
      .catch(() => {}),
    fetch(url, { headers: { RSC: "1" } })
      .then((res) => {
        if (res.ok) rscCache.put(rscCacheKey(url), res)
      })
      .catch(() => {}),
  ])
}

async function precacheContent() {
  try {
    const manifestRes = await fetch("/api/precache-manifest")
    if (!manifestRes.ok) throw new Error(`manifest fetch failed: ${manifestRes.status}`)
    const { version, urls } = await manifestRes.json()

    const pagesCache = await caches.open(PAGES_CACHE)
    const rscCache = await caches.open(RSC_CACHE)

    let done = 0
    for (let i = 0; i < urls.length; i += PRECACHE_CONCURRENCY) {
      const batch = urls.slice(i, i + PRECACHE_CONCURRENCY)
      await Promise.all(batch.map((url) => precacheOneUrl(pagesCache, rscCache, url)))
      done += batch.length
      notifyClients({ type: "PRECACHE_PROGRESS", done, total: urls.length })
    }

    notifyClients({ type: "PRECACHE_DONE", version })
  } catch (err) {
    notifyClients({ type: "PRECACHE_ERROR", message: String(err) })
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Downloaded book/PDF files - cache once opened so they're readable offline
  if (url.pathname.startsWith("/api/drive/file/")) {
    event.respondWith(cacheFirst(request, BOOKS_CACHE))
    return
  }

  // Hashed Next.js build assets - safe to cache indefinitely
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE))
    return
  }

  // Images
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, ASSETS_CACHE))
    return
  }

  // Next.js App Router client-side navigations (clicking a <Link>, e.g.
  // between Qur'ani/Hadith/Dua/Adhkar) fetch the page's React Server
  // Component payload at the same URL rather than a full HTML document —
  // identified by the RSC header, not navigation mode. This carries the
  // actual page content, so without caching it here, a page that was only
  // ever reached by clicking a link (not a hard reload) stays uncached and
  // fails to open while offline even though the app shell loaded fine.
  if (request.headers.get("RSC") === "1") {
    event.respondWith(networkFirstRSC(request))
    return
  }

  // Page navigations (hard reload / typed URL) - try network, fall back to
  // last cached copy, then offline page
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request))
    return
  }
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || networkPromise
}

// Next.js appends a "_rsc" cache-busting query param that changes per build/
// session - strip it so repeat visits to the same route reuse one cache
// entry instead of missing every time.
function rscCacheKey(url) {
  const u = new URL(url)
  u.searchParams.delete("_rsc")
  return u.toString()
}

async function networkFirstRSC(request) {
  const cache = await caches.open(RSC_CACHE)
  const key = rscCacheKey(request.url)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(key, response.clone())
    return response
  } catch {
    const cached = await cache.match(key)
    if (cached) return cached
    return Response.error()
  }
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    const offline = await caches.match("/offline")
    return offline || Response.error()
  }
}
