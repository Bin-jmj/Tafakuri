/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Next.js buffers the request body through an internal proxy before it
    // reaches route handlers, capped at 10MB by default - book/audio/video
    // uploads to /api/storage/media routinely exceed that, which surfaces as
    // "Failed to parse body as FormData" (the body gets silently truncated
    // mid-multipart-boundary). Match this to that route's own 500MB cap.
    proxyClientMaxBodySize: "500mb",
  },
}

export default nextConfig