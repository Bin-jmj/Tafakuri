// Tafakuri service worker - enables offline reading of previously visited
// Qur'ani pages and downloaded Vitabu (book) files.

const CACHE_VERSION = "v1"
const SHELL_CACHE = `tafakuri-shell-${CACHE_VERSION}`
const PAGES_CACHE = `tafakuri-pages-${CACHE_VERSION}`
const ASSETS_CACHE = `tafakuri-assets-${CACHE_VERSION}`
const BOOKS_CACHE = `tafakuri-books-${CACHE_VERSION}`

const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE, BOOKS_CACHE]

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

  // Page navigations - try network, fall back to last cached copy, then offline page
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
