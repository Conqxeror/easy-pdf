import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PDF flows', () => {
	test('Merge: upload 2 PDFs and merge', async ({ page }) => {
		await page.goto('/merge', { waitUntil: 'networkidle' });
		const consoleErrors = [];
		page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
		page.on('pageerror', (err) => { consoleErrors.push(err.message); });

		// Wait for the file dropzone to be present (PDF libs must load)
		await page.locator('role=button[name="File drop zone"]').waitFor({ timeout: 45000 });
		// Upload two sample PDFs
		const input = page.locator('input[type=file]');
		await input.setInputFiles([
			path.join(process.cwd(), 'tests/fixtures/sample1.pdf'),
			path.join(process.cwd(), 'tests/fixtures/sample2.pdf')
		]);

		// Wait for files to appear in the page
		await expect(page.locator('text=Files to Merge')).toBeVisible();

		// Click Merge
		await page.locator('button[aria-label="Merge selected PDF files"]').click();

		// Wait for merged PDF link
		const link = page.locator('a[download]');
		await expect(link).toBeVisible();

		// Verify download attribute is present
		const name = await link.getAttribute('download');
		expect(name && name.endsWith('.pdf')).toBeTruthy();
	});

	test('Watermark: upload a PDF and add watermark', async ({ page }) => {
		await page.goto('/watermark', { waitUntil: 'networkidle' });
		const consoleErrors2 = [];
		page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors2.push(msg.text()); });
		page.on('pageerror', (err) => { consoleErrors2.push(err.message); });

		await page.locator('role=button[name="File drop zone"]').waitFor({ timeout: 45000 });
		const input = page.locator('input[type=file]');
		await input.setInputFiles(path.join(process.cwd(), 'tests/fixtures/sample1.pdf'));

		await expect(page.getByRole('button', { name: 'Add Watermark' })).toBeVisible();

		// Choose default watermark and apply
		await page.locator('button:has-text("Add Watermark")').click();

		// Wait for merged PDF link or success message
		await expect(page.locator('text=Merged PDF Ready').or(page.locator('a[download]'))).toBeVisible();
	});
});
