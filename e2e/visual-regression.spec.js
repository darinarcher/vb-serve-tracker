// @ts-check
const { test, expect } = require('@playwright/test');
const { makeData, resetApp, seedApp } = require('./helpers');

test('VIS-1: iPhone Safari main tracking screen', async ({ page }) => {
  await resetApp(page);
  await expect(page).toHaveScreenshot('main-screen.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

test('VIS-2: iPhone Safari populated history modal', async ({ page }) => {
  const matches = [{
    id: 1,
    date: '2026-08-17',
    sets: [{
      turns: [
        { overIn: 3, overOut: 1, net: 1, foot: 0 },
        { overIn: 2, overOut: 0, net: 0, foot: 1 },
      ],
    }],
  }];
  await seedApp(page, makeData({ matches, playerName: 'Visual Test' }));
  await page.locator('#historyBtn').click();

  await expect(page).toHaveScreenshot('history-modal.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});
