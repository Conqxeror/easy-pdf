import { buildSitemapXml, getSitemapEntries } from '@/lib/sitemapEntries';

describe('sitemapEntries', () => {
	it('builds XML with valid image:loc strings and no [object Object]', async () => {
		const entries = await getSitemapEntries();
		const xml = buildSitemapXml(entries);

		expect(xml).toContain('<urlset');
		// No [object Object] in serialized XML
		expect(xml).not.toMatch(/\[object Object\]/);

		// All <image:loc> occurrences should contain a scheme (http/https)
		const imageLocs = Array.from(xml.matchAll(/<image:loc>(.*?)<\/image:loc>/g)).map(m => m[1]);
		imageLocs.forEach(loc => expect(loc).toMatch(/^https?:\/\//));
	});
});
