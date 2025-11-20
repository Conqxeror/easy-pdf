import { test, expect } from '@playwright/test';

test.describe('Navbar dropdowns', () => {
	const categories = [
		'Convert & Create',
		'Organize & Edit',
		'Security & Privacy',
		'Forms & Documents',
		'Business Tools',
		'AI & Analysis',
		'Advanced PDF Tools',
	];

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Use a standard desktop viewport
		await page.setViewportSize({ width: 1366, height: 900 });
	});

	for (const name of categories) {
		test(`dropdown for ${name} should be inside viewport`, async ({ page }) => {
			// find a menu button with the category name and hover
			const button = page.getByRole('button', { name, exact: false }).first();
			await button.hover();

			// wait for the popup to mount
			// Tailwind uses a variation like bg-popover/95 — use substring selector
			const popup = await page.waitForSelector(".pointer-events-auto[class*='bg-popover']", { timeout: 2000 });

			const rect = await popup.evaluate((el) => {
				const r = el.getBoundingClientRect();
				return { left: r.left, right: r.right, width: r.width };
			});

			const viewportWidth = await page.evaluate(() => window.innerWidth);

			// Check - no overflow
			expect(rect.left).toBeGreaterThanOrEqual(0);
			expect(rect.right).toBeLessThanOrEqual(viewportWidth);

			// overlay must be present and have backdrop-filter set immediately
			const overlay = page.locator("[data-testid=dropdown-overlay]");
			await expect(overlay).toBeVisible({ timeout: 1000 });
			const backdrop = await overlay.evaluate((el) => window.getComputedStyle(el).getPropertyValue('backdrop-filter'));
			expect(backdrop).not.toBe('none');
		});
	}
});
