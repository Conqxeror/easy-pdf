import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const fixturePath = (name: string) => path.join(process.cwd(), 'tests', 'fixtures', name);

test('DOCX PagedJS visual diff vs baseline', async ({ page }) => {
  await page.goto('/docx-to-pdf', { waitUntil: 'networkidle' });

  // Upload and check file
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(fixturePath('sample.docx'));
  await page.waitForSelector('text=sample.docx', { timeout: 5000 });

  // Enable PagedJS
  await page.locator('#usePaged').check();

  // Call the E2E helper to preview and wait for pages
  await page.evaluate(async () => { if (window.__E2E_EXPOSE && window.__E2E_EXPOSE.previewDocx) await window.__E2E_EXPOSE.previewDocx(0); });
  await page.waitForSelector('.pagedjs_pages', { timeout: 30000 });

  // Take screenshot of the preview area
  const el = page.locator('.pagedjs_pages');
  const screenshot = await el.screenshot({ type: 'png' });

  // Baseline path
  const baselineFile = fixturePath('pagedjs_baseline.png');
  if (!fs.existsSync(baselineFile)) {
    // Fail fast with instructions to generate baseline
    throw new Error('Baseline not found. Generate it with `npm run test:e2e:baseline:pagedjs`');
  }

  const baselineBuffer = fs.readFileSync(baselineFile);
  const imgA = PNG.sync.read(screenshot);
  const imgB = PNG.sync.read(baselineBuffer);
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });

  // Allow small pixel diffs due to antialiasing; fail if > 100 pixels
  expect(mismatched).toBeLessThanOrEqual(100);
});
