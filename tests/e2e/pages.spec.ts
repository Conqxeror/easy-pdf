import { test, expect } from '@playwright/test';

const routes = Array.from(new Set([
	'/',
	'/about',
	'/compress',
	'/merge',
	'/ocr',
	'/pdf-table-extractor',
	'/merge',
	'/watermark',
	'/sign',
	'/pdf-to-jpg',
	'/html-to-pdf',
	'/pdf-metadata-editor',
	'/pdf-accessibility-checker',
	'/pdf-batch-processor',
	'/reorder',
	'/pdf-version-comparison',
	'/pdf-to-jpg'
]))

test.describe('Site routes smoke', () => {
	for (const route of routes) {
		test(`visits ${route}`, async ({ page }) => {
			const consoleErrors: Array<{ type: string; message: string }> = [];
			page.on('pageerror', (err) => consoleErrors.push({ type: 'pageerror', message: err.message }));
			page.on('console', (msg) => {
				if (msg.type() === 'error') consoleErrors.push({ type: 'console', message: msg.text() });
			});

			const response = await page.goto(route, { waitUntil: 'networkidle' });
			expect(response).toBeTruthy();
			expect(response?.status()).toBeLessThan(400);
			// Report any console errors (don't fail here — we'll surface them for manual triage).
			if (consoleErrors.length > 0) {
				const fs = require('fs');
				const path = `tests/e2e/results${route === '/' ? '/home' : route.replace(/\//g, '_')}.json`;
				try {
					fs.mkdirSync('tests/e2e/results', { recursive: true });
					fs.writeFileSync(path, JSON.stringify(consoleErrors, null, 2));
				} catch (e) {
					console.error('Failed writing console results', e);
				}
			}

			// Basic accessibility and title checks
			const title = await page.title();
			expect(title.length).toBeGreaterThan(0);

			// Take a screenshot for visual debug on failure
			await page.screenshot({ path: `tests/e2e/screenshots${route === '/' ? '/home' : route.replace(/\//g, '_')}.png` });
		});
	}
});
