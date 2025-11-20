const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fixtureDir = path.join(process.cwd(), 'tests', 'fixtures');
  const baseline = path.join(fixtureDir, 'pagedjs_baseline.png');

  console.log('Generating PagedJS baseline preview...');
  try {
    await page.goto('http://localhost:3000/docx-to-pdf', { waitUntil: 'networkidle' });
  } catch (err) {
    console.error('Failed to reach dev server: please start the dev server with `npm run dev` before running this script.');
    console.error(err);
    await browser.close();
    process.exit(1);
  }

  // Upload sample.docx fixture
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(path.join(fixtureDir, 'sample.docx'));
  await page.waitForSelector('text=sample.docx', { timeout: 5000 });

  // Ensure PagedJS toggle is enabled
  await page.locator('#usePaged').check();

  // Use exposed E2E helper to trigger a PagedJS preview
  await page.evaluate(async () => {
    if (window.__E2E_EXPOSE && window.__E2E_EXPOSE.previewDocx) {
      await window.__E2E_EXPOSE.previewDocx(0);
    }
  });

  await page.waitForSelector('.pagedjs_pages', { timeout: 30000 });
  const el = page.locator('.pagedjs_pages');
  const buffer = await el.screenshot();
  fs.writeFileSync(baseline, buffer);
  console.log('Wrote baseline to', baseline);
  await browser.close();
})();
