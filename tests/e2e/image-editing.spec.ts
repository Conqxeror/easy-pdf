import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Editing Tools', () => {

  test('Image Filters should load and process image', async ({ page }) => {
    await page.goto('/image-filters');
    await expect(page.getByRole('heading', { name: 'Image Filters' })).toBeVisible();

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample.jpg'));

    // Check if preview appears
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    // Adjust slider
    const slider = page.locator('[role="slider"]').first();
    await slider.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0); // Move slider
    await page.mouse.up();

    // Check download button
    await expect(page.getByRole('button', { name: 'Download Image' })).toBeEnabled();
  });

  test('Image Text Overlay should add text', async ({ page }) => {
    await page.goto('/image-text-overlay');
    await expect(page.getByRole('heading', { name: 'Add Text to Image' })).toBeVisible();

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample.jpg'));

    // Check preview
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    // Change text
    const textInput = page.getByPlaceholder('Enter text...');
    await textInput.fill('Hello World');

    // Check download
    await expect(page.getByRole('button', { name: 'Download Image' })).toBeEnabled();
  });

  test('Image Drawing should allow drawing', async ({ page }) => {
    await page.goto('/image-drawing');
    await expect(page.getByRole('heading', { name: 'Draw on Image' })).toBeVisible();

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample.jpg'));

    // Check canvas
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Simulate drawing
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.up();
    }

    // Check download
    await expect(page.getByRole('button', { name: 'Download Image' })).toBeEnabled();
  });

  test('Image Watermark should load and process', async ({ page }) => {
    await page.goto('/image-watermark');
    await expect(page.getByRole('heading', { name: 'Add Watermark to Image' })).toBeVisible();

    // Upload base image
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.first().setInputFiles(path.join(__dirname, '../fixtures/sample.jpg'));

    // Upload watermark image
    await fileInputs.nth(1).setInputFiles(path.join(__dirname, '../fixtures/sample.png'));

    // Check preview
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    // Check download
    await expect(page.getByRole('button', { name: 'Download Image' })).toBeEnabled();
  });

});
