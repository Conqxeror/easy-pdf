import { test, expect } from '@playwright/test';

test.describe('Navbar navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1366, height: 900 });
		await page.goto('/');
	});

	test('desktop navbar shows primary links inside viewport', async ({ page }) => {
		const toolsLink = page.getByRole('link', { name: 'Tools', exact: true });
		const aboutLink = page.getByRole('link', { name: 'About', exact: true });

		await expect(toolsLink).toBeVisible();
		await expect(aboutLink).toBeVisible();

		const viewportWidth = await page.evaluate(() => window.innerWidth);
		for (const locator of [toolsLink, aboutLink]) {
			const box = await locator.boundingBox();
			expect(box).toBeTruthy();
			if (!box) {
				throw new Error('Expected visible navbar link to have a bounding box');
			}
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
		}
	});

	test('mobile menu opens and exposes navigation links', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');

		const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
		await menuToggle.click();

		await expect(page.getByRole('link', { name: 'Tools', exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
	});
});
