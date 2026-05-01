import { test, expect } from '@playwright/test';

test.describe('Web Tools', () => {

  test('Markdown Previewer should render HTML', async ({ page }) => {
    await page.goto('/markdown-previewer');

    // Check if the tool loaded
    await expect(page.getByRole('heading', { name: 'Markdown Previewer' })).toBeVisible();

    // Type some markdown
    const input = page.locator('textarea').first();
    await input.fill('# Hello Playwright\n**Bold Text**');

    // Check preview
    const preview = page.locator('.prose');
    await expect(preview.getByRole('heading', { name: 'Hello Playwright' })).toBeVisible();
    await expect(preview.locator('strong')).toHaveText('Bold Text');
  });

  test('Number Base Converter should convert values', async ({ page }) => {
    await page.goto('/number-base-converter', { waitUntil: 'networkidle' });

    // Check if the tool loaded
    await expect(page.getByRole('heading', { name: 'Number Base Converter' })).toBeVisible();

    // Type decimal 10
    const decimalInput = page.getByPlaceholder('e.g. 255');
    await decimalInput.fill('10');

    // Check binary (1010)
    const binaryInput = page.getByPlaceholder('e.g. 11111111');
    await expect(binaryInput).toHaveValue('1010');

    // Check hex (A)
    const hexInput = page.getByPlaceholder('e.g. FF');
    await expect(hexInput).toHaveValue('A');
  });

  test('HTML Minifier should minify code', async ({ page }) => {
    await page.goto('/html-minifier');

    const input = page.getByPlaceholder('Paste your HTML here...');
    await input.fill('<div>\n  <p>  Hello  </p>\n</div>');

    await page.getByRole('button', { name: 'Minify HTML', exact: true }).click();

    const output = page.locator('textarea').nth(1);
    await expect(output).toHaveValue('<div><p> Hello </p></div>');
  });

  test('Unit Converter should convert length', async ({ page }) => {
    await page.goto('/unit-converter');

    // Check if the tool loaded
    await expect(page.getByRole('heading', { name: 'Unit Converter' })).toBeVisible();

    // Default is Length: m to ft
    // 1 m = 3.280839895 ft

    const fromInput = page.locator('input[type="number"]').first();
    await fromInput.fill('10');

    const toInput = page.locator('input[type="number"]').nth(1);

    // 10 m = 32.80839895 ft
    // The tool formats to string, let's check if it contains "32.8"
    await expect(toInput).toHaveValue(/32\.8/);
  });
});
