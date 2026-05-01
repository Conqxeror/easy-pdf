import { test, expect } from '@playwright/test';

test('sitemap image URLs are reachable and serve image content', async ({ request, baseURL }) => {
       test.setTimeout(180_000);
	const sitemapRes = await request.get('/sitemap.xml');
	expect(sitemapRes.ok()).toBeTruthy();

	const xml = await sitemapRes.text();
       const imageLocs = [...new Set(Array.from(xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)).map(m => m[1]).filter(Boolean) as string[])];
	expect(imageLocs.length).toBeGreaterThan(0);

       const resolveImageUrl = (loc: string) => {
	       try {
		       new URL(loc);
		       return loc;
	       } catch {
		       const resolvedBase = baseURL || 'http://localhost:3000';
		       return new URL(loc, resolvedBase).toString();
	       }
       };

       const urls = imageLocs.map(resolveImageUrl);
       const failures: string[] = [];
       let index = 0;

       const worker = async () => {
	       while (index < urls.length) {
		       const currentIndex = index;
		       index += 1;
		       const url = urls[currentIndex];
		       if (!url) break;

		       const res = await request.get(url, { timeout: 30_000 });
		       const ct = (res.headers()['content-type'] || '').toLowerCase();
		       if (!res.ok() || !ct.includes('image')) {
			       failures.push(`${url} returned ${res.status()} ${ct}`);
		       }
		}
       };

       await Promise.all(Array.from({ length: Math.min(8, urls.length) }, worker));

       expect(failures).toEqual([]);
});
