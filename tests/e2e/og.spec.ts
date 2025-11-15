import { test, expect } from '@playwright/test';

test.describe('OG image generation', () => {
	test('tool OG endpoint returns an image for merge', async ({ request }) => {
		const res = await request.get('/og/tool/merge');
		expect(res.ok()).toBeTruthy();
		const ct = res.headers()['content-type'] || '';
		expect(ct.includes('image')).toBeTruthy();
		// Expect the router to provide cache headers for CDN
		const cc = res.headers()['cache-control'] || '';
		expect(cc).toContain('s-maxage');
	});

	test('api OG logging endpoint accepts POST', async ({ request }) => {
		const res = await request.post('/api/og/log', {
			data: { slug: 'merge', tool: 'Merge PDF', path: '/og/tool/merge' }
		});
		expect(res.status()).toBeLessThan(300);
	});

	test('tool page contains og:image meta for merge', async ({ page }) => {
		await page.goto('/merge', { waitUntil: 'networkidle' });
		const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
		expect(Boolean(ogImage)).toBeTruthy();
		expect(ogImage).toContain('/og/tool/merge');
		const width = await page.locator('meta[property="og:image:width"]').getAttribute('content');
		const height = await page.locator('meta[property="og:image:height"]').getAttribute('content');
		expect(width).toBe('1200');
		expect(height).toBe('630');
	});
});
