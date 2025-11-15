// Dynamic robots.txt route to ensure proper sitemap URL with environment variables
// Dynamic robots route — returns robots.txt with environment-aware sitemap URL
export async function GET(_request) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app'
	const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

	const robotsContent = `User-agent: *\nAllow: /\n\n# Crawl optimization\nCrawl-delay: 0.5\nRequest-rate: 1/1s\n\n# Google-specific crawl permissions\nUser-agent: Googlebot\nCrawl-delay: 0\n\n# Block unnecessary crawling\nDisallow: /api/\nDisallow: /_next/\nDisallow: /static/\nDisallow: /.well-known/\nDisallow: /scripts/\nDisallow: /node_modules/\n\n# Block admin and private areas\nDisallow: /admin/\nDisallow: /private/\nDisallow: /temp/\n\n# Allow important assets\nAllow: /public/\nAllow: /icon.svg\nAllow: /og-image.jpg\nAllow: /twitter-image.jpg\nAllow: /site.webmanifest\nAllow: /favicon.ico\nAllow: /apple-touch-icon.png\n# Allow dynamic OG endpoints for social crawlers\nAllow: /og/\nAllow: /api/og/\n\n# Sitemap URL with environment-aware base URL\nSitemap: ${siteUrl}/sitemap.xml\n`;

	// Optionally log user-agent if needed for analytics
	// We accept the `request` param to allow Next's internal metadata loader to pass request metadata.

	return new Response(robotsContent, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
		},
	})
}
