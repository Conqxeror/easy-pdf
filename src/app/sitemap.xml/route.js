import { getSitemapEntries, buildSitemapXml } from '@/lib/sitemapEntries';

const resolveBaseUrl = () => {
	const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app';
	return base.startsWith('http') ? base : `https://${base}`;
};

export async function GET() {
	const resolvedBase = resolveBaseUrl();

	try {
		const entries = await getSitemapEntries();
		const xml = buildSitemapXml(entries);
		return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
	} catch (error) {
		console.error('Sitemap generation failed, serving fallback', error);
		// If something goes wrong, return a small, valid sitemap with absolute URLs
		const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${resolvedBase}/</loc></url>\n</urlset>`;
		return new Response(fallback, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }, status: 500 });
	}
}
