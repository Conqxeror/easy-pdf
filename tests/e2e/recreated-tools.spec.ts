import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const fixturePath = (name: string) => path.join(process.cwd(), 'tests/fixtures', name);

test.describe('Recreated Tools Functionality', () => {

  test('Compress PDF: loads and processes file', async ({ page }) => {
    await page.goto('/compress', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Compress PDF/i, level: 1 })).toBeVisible();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(fixturePath('sample1.pdf'));

    await expect(page.getByText('sample1.pdf').first()).toBeVisible({ timeout: 30000 });

    // Click Compress button
    const compressBtn = page.getByRole('button', { name: /Compress PDF/i });
    await expect(compressBtn).toBeEnabled();
    await compressBtn.click();

    // Wait for processing
    await expect(page.getByText(/Compression Complete/i)).toBeVisible({ timeout: 60000 });
    await expect(page.getByRole('link', { name: /Download Compressed PDF/i }).first()).toBeVisible();
  });

  test('Split PDF: loads and processes file', async ({ page }) => {
    await page.goto('/split', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Split PDF/i, level: 1 })).toBeVisible();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(fixturePath('sample1.pdf'));

    await expect(page.getByText('sample1.pdf').first()).toBeVisible();

    // Check options are visible - use specific text or label
    await expect(page.locator('label').filter({ hasText: 'By Page Range' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Extract Individual Pages' })).toBeVisible();

    // Click Split button (default range mode)
    const splitBtn = page.getByRole('button', { name: 'Split PDF', exact: true });
    await expect(splitBtn).toBeEnabled();
    await splitBtn.click();

    // Wait for processing
    await expect(page.getByText(/Split Complete/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('link', { name: /Download/i }).first()).toBeVisible();
  });

  test('PDF to JPG: loads and processes file', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/pdf-to-jpg', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /PDF to JPG/i, level: 1 })).toBeVisible();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(fixturePath('sample1.pdf'));

    await expect(page.getByText('sample1.pdf').first()).toBeVisible({ timeout: 30000 });

    // Click Convert button
    const convertBtn = page.getByRole('button', { name: /Convert to JPG/i });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    // Wait for processing
    // Check for success OR error to debug
    try {
      await expect(page.getByText(/Converted Image/i)).toBeVisible({ timeout: 60000 });
    } catch (e) {
      // If success message not found, check if there's an error message
      const errorAlert = page.getByRole('alert').first();
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        throw new Error(`Conversion failed with alert: ${errorText}`);
      }
      throw e;
    }

    // Should see download button(s)
    await expect(page.getByRole('link', { name: /Download/i }).first()).toBeVisible();
  });

  test('JPG to PDF: loads and processes file', async ({ page }) => {
    await page.goto('/jpg-to-pdf', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /JPG to PDF/i, level: 1 })).toBeVisible();

    // Create a dummy JPG file
    const dummyJpgPath = path.join(process.cwd(), 'tests/fixtures', 'test.jpg');
    // Simple 1x1 pixel JPEG header
    const jpgBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00,
      0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b,
      0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
      0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xfd, 0xfc, 0xaf, 0xff, 0xd9
    ]);
    fs.writeFileSync(dummyJpgPath, jpgBuffer);

    try {
      const input = page.locator('input[type="file"]');
      await input.setInputFiles(dummyJpgPath);

      await expect(page.getByText('test.jpg').first()).toBeVisible();

      // Click Convert button
      const convertBtn = page.getByRole('button', { name: /Convert to PDF/i });
      await expect(convertBtn).toBeEnabled();
      await convertBtn.click();

      // Wait for processing
      await expect(page.getByText(/Conversion Complete/i)).toBeVisible({ timeout: 60000 });
      await expect(page.getByRole('link', { name: /Download PDF/i }).first()).toBeVisible();
    } finally {
      // Cleanup
      if (fs.existsSync(dummyJpgPath)) {
        fs.unlinkSync(dummyJpgPath);
      }
    }
  });

  test('Merge PDF: loads and processes files', async ({ page }) => {
    test.setTimeout(120000);
    const response = await page.goto('/merge', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    // Check for any H1 using locator
    await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('h1')).toContainText(/Merge/i);

    const input = page.locator('input[type="file"]');
    await input.setInputFiles([
      fixturePath('sample1.pdf'),
      fixturePath('sample2.pdf')
    ]);

    await expect(page.getByText('sample1.pdf').first()).toBeVisible();
    await expect(page.getByText('sample2.pdf').first()).toBeVisible();

    // Click Merge button
    const mergeBtn = page.getByRole('button').filter({ hasText: /Merge/i }).first();
    await expect(mergeBtn).toBeEnabled();
    await mergeBtn.click();

    // Wait for processing
    await expect(page.getByText(/Merged PDF Ready/i)).toBeVisible({ timeout: 60000 });
    await expect(page.getByRole('link', { name: /Download Merged PDF/i }).first()).toBeVisible();
  });

});
