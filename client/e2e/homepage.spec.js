import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('page loads with the correct heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('ShopSmart and save more!');
  });

  test('displays backend health status as ok', async ({ page }) => {
    await page.goto('/');

    // Wait for the backend status to resolve — it may load very quickly
    await expect(page.getByText('Status: ok')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ShopSmart Backend is running')).toBeVisible();
  });

  test('displays the "Our Products" section heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Our Products' })).toBeVisible();
  });

  test('displays the search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });
});
