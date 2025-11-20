import { test, expect } from '@playwright/test';

test.describe('AI Tools', () => {

  test('Remove Background should load and UI should be visible', async ({ page }) => {
    await page.goto('/remove-background');
    await expect(page.getByRole('heading', { name: 'Remove Background' })).toBeVisible();

    // Check upload area
    await expect(page.getByText('Click or drag image to upload')).toBeVisible();

    // Check download button is disabled initially
    await expect(page.getByRole('button', { name: 'Download Transparent Image' })).toBeDisabled();
  });

  test('Face Blur should load and UI should be visible', async ({ page }) => {
    await page.goto('/face-blur');
    await expect(page.getByRole('heading', { name: 'Blur Faces' })).toBeVisible();

    // Check upload area
    await expect(page.getByText('Click or drag image to upload')).toBeVisible();

    // Check download button is disabled initially
    await expect(page.getByRole('button', { name: 'Download Image' })).toBeDisabled();
  });

  // Skipping actual processing test for now as it requires downloading large models
  // and might be flaky in CI without proper caching strategy.
  /*
  test('Remove Background should process image', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for model download
    await page.goto('/remove-background');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample.jpg'));
    
    // Wait for processing
    await expect(page.getByText('Removing background...')).toBeVisible();
    await expect(page.getByText('Removing background...')).toBeHidden({ timeout: 50000 });
    
    // Check result
    await expect(page.getByRole('button', { name: 'Download Transparent Image' })).toBeEnabled();
  });
  */
});
