import { test, expect } from '@playwright/test';

test('can add to cart and checkout', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('link', { name: 'Products' }).click();
  await page.getByRole('link').filter({ hasText: /Aurora/ }).first().click();
  await page.getByRole('button', { name: /Add to cart/i }).click();
  await page.getByLabel('Cart').click();
  await expect(page.getByText('Subtotal')).toBeVisible();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/orders\//);
});


