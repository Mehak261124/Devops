import { test, expect } from '@playwright/test';

test.describe('Product Listing & Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for products to load
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('renders product cards on initial load', async ({ page }) => {
    const productCards = page.locator('.product-card');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each product card displays name, category, price, and stock badge', async ({ page }) => {
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard.locator('.product-card__name')).toBeVisible();
    await expect(firstCard.locator('.product-card__category')).toBeVisible();
    await expect(firstCard.locator('.product-card__price')).toBeVisible();
    await expect(firstCard.locator('.product-card__badge')).toBeVisible();
  });

  test('search filters products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Headphones');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Wait for filtered results
    await page.waitForTimeout(1000);
    const cards = page.locator('.product-card');
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(2);

    if (count > 0) {
      await expect(cards.first().locator('.product-card__name')).toContainText('Headphones');
    }
  });

  test('clear search resets to all products', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('Headphones');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForTimeout(500);

    // Clear search
    await page.getByRole('button', { name: 'Clear search' }).click();
    await page.waitForTimeout(500);

    const cards = page.locator('.product-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('in-stock product has an enabled add button', async ({ page }) => {
    const inStockCard = page.locator('.product-card').filter({ has: page.locator('.in-stock') }).first();
    const addBtn = inStockCard.locator('.product-card__add-btn');
    await expect(addBtn).toContainText('Add');
    await expect(addBtn).toBeEnabled();
  });

  test('out-of-stock product has a disabled button', async ({ page }) => {
    const outOfStockCard = page.locator('.product-card').filter({ has: page.locator('.out-of-stock') }).first();
    const btn = outOfStockCard.locator('.product-card__add-btn');
    await expect(btn).toContainText('Sold Out');
    await expect(btn).toBeDisabled();
  });

  test('clicking add to cart shows toast notification', async ({ page }) => {
    const inStockCard = page.locator('.product-card').filter({ has: page.locator('.in-stock') }).first();
    await inStockCard.locator('.product-card__add-btn').click();

    // Toast should appear
    await expect(page.locator('.toast')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.toast__message')).toContainText('added to cart');
  });

  test('clicking add to cart updates cart badge', async ({ page }) => {
    const inStockCard = page.locator('.product-card').filter({ has: page.locator('.in-stock') }).first();
    await inStockCard.locator('.product-card__add-btn').click();

    // Cart badge should appear with count
    await expect(page.locator('.navbar__cart-badge')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.navbar__cart-badge')).toHaveText('1');
  });

  test('clicking product card opens detail modal', async ({ page }) => {
    const firstCard = page.locator('.product-card').first();
    // Click the card body (not the add button)
    await firstCard.locator('.product-card__body').click();

    await expect(page.locator('.modal')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.modal__title')).toBeVisible();
    await expect(page.locator('.modal__description')).toBeVisible();
  });

  test('no products found message when search has no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('xyznonexistent');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page.getByText('No products found')).toBeVisible({ timeout: 5000 });
  });

  test('category filter pills are visible', async ({ page }) => {
    await expect(page.locator('.category-filter')).toBeVisible();
    await expect(page.locator('.category-filter__pill').first()).toBeVisible();
  });
});
