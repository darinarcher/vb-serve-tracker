// @ts-check
const { test, expect } = require('@playwright/test');
const { makeData, resetApp, seedApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test('TC-01/02: main page scrolls before and after serve interaction', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  const scrollMetrics = await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    return {
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  expect(scrollMetrics.maxScroll).toBeGreaterThan(0);
  expect(scrollMetrics.scrollY).toBeGreaterThan(0);
  await expect(page.getByText('Start Fresh')).toBeVisible();
});

test('TC-03: scrolling works after player-name focus and blur', async ({ page }) => {
  const player = page.locator('#playerName');
  await player.fill('Keyboard Test');
  await player.press('Enter');
  await page.locator('header').click({ position: { x: 10, y: 10 } });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('TC-04: populated history modal scrolls independently', async ({ page }) => {
  const matches = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    date: `2026-08-${String(index + 1).padStart(2, '0')}`,
    sets: [{ turns: [{ overIn: 2, overOut: 1, net: 1, foot: 0 }] }],
  }));
  await seedApp(page, makeData({ matches }));
  await page.locator('#historyBtn').click();

  const modal = page.locator('#historyModal');
  const metrics = await modal.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    };
  });
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.scrollTop).toBeGreaterThan(0);
});

test('TC-05: long turns list scrolls within its container', async ({ page }) => {
  const turns = Array.from({ length: 15 }, (_, index) => ({
    overIn: index + 1,
    overOut: 0,
    net: 0,
    foot: 0,
  }));
  const matches = [{ id: 1, date: '2026-08-17', sets: [{ turns }] }];
  await seedApp(page, makeData({ matches }));

  const list = page.locator('#turnsList');
  const metrics = await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    };
  });
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(metrics.scrollTop).toBeGreaterThan(0);
});

test('TC-07: landscape-sized viewport keeps controls reachable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.reload();

  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    serveButtons: document.querySelectorAll('.serve-btn').length,
  }));
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.serveButtons).toBe(4);
  await expect(page.getByRole('button', { name: /OVER\/IN/i })).toBeVisible();
});

test('TC-10.7: main and history views have no horizontal overflow', async ({ page }) => {
  expect(await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  })).toBeLessThanOrEqual(1);

  await page.locator('#historyBtn').click();
  const modalOverflow = await page.locator('#historyModal').evaluate((element) => {
    return element.scrollWidth - element.clientWidth;
  });
  expect(modalOverflow).toBeLessThanOrEqual(1);
});
