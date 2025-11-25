// Dynamic robots.txt route to ensure proper sitemap URL with environment variables
// Legacy robots route (deprecated) — using dynamic route at /robots/route.js instead
// Export a minimal robots metadata object to satisfy Next metadata route loader.
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app'
  const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/public/',
          '/icon.svg',
          '/og-image.jpg',
          '/twitter-image.jpg',
          '/site.webmanifest',
          '/favicon.ico',
          '/apple-touch-icon.png',
          '/og/',
          '/api/og/'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/.well-known/',
          '/scripts/',
          '/node_modules/',
          '/admin/',
          '/private/',
          '/temp/'
        ],
        crawlDelay: 0.5,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
