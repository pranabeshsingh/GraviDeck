import { test, expect } from '@playwright/test';

test.describe('GraviDeck Playwright E2E Test Suite', () => {
  test('launches game, renders 1280x720 canvas, and displays Sector Map', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');

    expect(width).toBe('1280');
    expect(height).toBe('720');
  });
});
