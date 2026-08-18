// @ts-check
const { test, expect } = require('@playwright/test');

test('PWA shell remains available offline after initial load', async ({ page, context }) => {
  await page.goto('/index.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /OVER\/IN/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /OVER\/OUT/i })).toBeVisible();
    await expect(page.getByText('Serve Tracker v3.0.0')).toBeAttached();
  } finally {
    await context.setOffline(false);
  }
});
