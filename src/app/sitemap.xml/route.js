import { getSitemapEntries, buildSitemapXml } from '@/lib/sitemapEntries';

export async function GET() {
	try {
		const entries = await getSitemapEntries();
		const xml = buildSitemapXml(entries);
		return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
	} catch {
		// If something goes wrong, return a small, valid sitemap with root only
		const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>/</loc></url>\n</urlset>`;
		return new Response(fallback, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }, status: 500 });
	}
}
