import { test, expect } from '@playwright/test';

test('sitemap image URLs are reachable and serve image content', async ({ request, baseURL }) => {
	const sitemapRes = await request.get('/sitemap.xml');
	expect(sitemapRes.ok()).toBeTruthy();

	const xml = await sitemapRes.text();
	const imageLocs = Array.from(xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)).map(m => m[1]).filter(Boolean) as string[];
	expect(imageLocs.length).toBeGreaterThan(0);

	for (const loc of imageLocs) {
		// Normalize - if the loc is absolute use it, otherwise resolve relative to baseURL
		let url = loc;
		try {
			new URL(url);
		} catch {
			const resolvedBase = baseURL || 'http://localhost:3000';
			url = new URL(loc, resolvedBase).toString();
		}

		const res = await request.get(url);
		expect(res.ok()).toBeTruthy();
		const ct = (res.headers()['content-type'] || '').toLowerCase();
		expect(ct.includes('image')).toBeTruthy();
	}
});
