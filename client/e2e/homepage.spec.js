import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('page loads with the navbar and hero section', async ({ page }) => {
    await page.goto('/');
    // NavBar
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.navbar__logo')).toContainText('Shop');

    // Hero
    await expect(page.locator('.hero__title')).toContainText('Discover Premium');
    await expect(page.getByText('Shop Now →')).toBeVisible();
  });

  test('displays the Our Products section heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.products-section__title')).toBeVisible();
  });

  test('displays the search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });

  test('displays the footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.getByText('Crafted with')).toBeVisible();
  });

  test('cart button opens cart drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Open cart').click();
    await expect(page.getByText(/Your Cart/)).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});
