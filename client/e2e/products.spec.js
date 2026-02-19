import { test, expect } from '@playwright/test';

test.describe('Product Listing & Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for products to load (the product cards should appear)
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  });

  test('renders all 6 products on initial load', async ({ page }) => {
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(6);
  });

  test('each product card displays name, category, price, and stock status', async ({ page }) => {
    // Check the first product card has the expected elements
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('.category')).toBeVisible();
    await expect(firstCard.locator('.price')).toBeVisible();
    await expect(firstCard.locator('.stock-badge')).toBeVisible();
    await expect(firstCard.locator('button')).toBeVisible();
  });

  test('search filters products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Headphones');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Wait for the filtered results
    await expect(page.locator('.product-card')).toHaveCount(1, { timeout: 5000 });
    await expect(page.locator('.product-card h3')).toHaveText('Premium Wireless Headphones');
  });

  test('search filters products by category', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Electronics');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Electronics has 2 products: Headphones and Gaming Mouse
    await expect(page.locator('.product-card')).toHaveCount(2, { timeout: 5000 });
  });

  test('clear search resets to all products', async ({ page }) => {
    // First, search for something
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Headphones');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.locator('.product-card')).toHaveCount(1, { timeout: 5000 });

    // Now clear the search
    await page.getByRole('button', { name: 'Clear search' }).click();

    // All 6 products should come back
    await expect(page.locator('.product-card')).toHaveCount(6, { timeout: 5000 });
  });

  test('in-stock product has an enabled "Add to Cart" button', async ({ page }) => {
    // Find an in-stock product card (one with .in-stock badge)
    const inStockCard = page.locator('.product-card').filter({ has: page.locator('.in-stock') }).first();
    const addBtn = inStockCard.locator('button');
    await expect(addBtn).toHaveText('Add to Cart');
    await expect(addBtn).toBeEnabled();
  });

  test('out-of-stock product has a disabled button', async ({ page }) => {
    // Find an out-of-stock product card
    const outOfStockCard = page.locator('.product-card').filter({ has: page.locator('.out-of-stock') }).first();
    const btn = outOfStockCard.locator('button');
    await expect(btn).toHaveText('Out of Stock');
    await expect(btn).toBeDisabled();
  });

  test('clicking "Add to Cart" shows an alert', async ({ page }) => {
    // Listen for the dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Added');
      expect(dialog.message()).toContain('to cart!');
      await dialog.accept();
    });

    // Click the first in-stock "Add to Cart" button
    const inStockCard = page.locator('.product-card').filter({ has: page.locator('.in-stock') }).first();
    await inStockCard.locator('button').click();
  });

  test('no products found message when search has no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('xyznonexistent');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page.getByText('No products found.')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.product-card')).toHaveCount(0);
  });
});
