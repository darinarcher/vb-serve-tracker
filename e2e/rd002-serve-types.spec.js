// @ts-check
const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'volleyball-serve-tracker';

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
});

test('RD-002: four serve buttons in 2x2 layout with OVER/IN and OVER/OUT labels', async ({ page }) => {
  await expect(page.getByRole('button', { name: /OVER\/IN/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /OVER\/OUT/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^NET/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^FOOT/i })).toBeVisible();

  const serveButtons = page.locator('.serve-btn');
  await expect(serveButtons).toHaveCount(4);

  const rows = page.locator('.buttons-container .btn-row');
  await expect(rows).toHaveCount(2);

  const [topRow, bottomRow] = await Promise.all([
    rows.nth(0).boundingBox(),
    rows.nth(1).boundingBox(),
  ]);
  expect(topRow).not.toBeNull();
  expect(bottomRow).not.toBeNull();
  expect(Math.abs(topRow.height - bottomRow.height)).toBeLessThanOrEqual(1);

  const buttonBoxes = await serveButtons.evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height };
    })
  );
  for (const box of buttonBoxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('RD-002: recording each serve type updates turn counts', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.getByRole('button', { name: /^NET/i }).click();
  await page.getByRole('button', { name: /^FOOT/i }).click();

  await expect(page.locator('#overInCount')).toHaveText('2');
  await expect(page.locator('#overOutCount')).toHaveText('1');
  await expect(page.locator('#netCount')).toHaveText('1');
  await expect(page.locator('#footCount')).toHaveText('1');
  await expect(page.locator('#setTotal')).toHaveText('5');
});

test('RD-002: in-play rate uses OVER/IN only (3/6 = 50%)', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /OVER\/IN/i }).click();
  }
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  }
  await page.getByRole('button', { name: /^NET/i }).click();

  await expect(page.locator('#inPlayRate')).toHaveText('50%');
  await expect(page.locator('#turnRate')).toHaveText('50%');
});

test('RD-002: v2 localStorage migrates legacy over to overIn', async ({ page }) => {
  const v2Data = {
    version: 2,
    playerName: 'Legacy',
    matches: [{
      id: 1,
      date: '2026-02-27',
      sets: [{ turns: [{ over: 7, net: 2, foot: 1 }] }],
    }],
  };

  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: STORAGE_KEY, data: v2Data });

  await page.reload();

  await expect(page.locator('#overInCount')).toHaveText('7');
  await expect(page.locator('#overOutCount')).toHaveText('0');
  await expect(page.locator('#netCount')).toHaveText('2');
  await expect(page.locator('#footCount')).toHaveText('1');
  await expect(page.locator('#setTotal')).toHaveText('10');
  await expect(page.locator('#inPlayRate')).toHaveText('70%');

  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(persisted.version).toBe(3);
  expect(persisted.matches[0].sets[0].turns[0]).toEqual({
    overIn: 7,
    overOut: 0,
    net: 2,
    foot: 1,
  });
});

test('RD-002: history modal shows In/Out breakdown per turn', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.getByRole('button', { name: /^NET/i }).click();

  await page.locator('#historyBtn').click();
  const modal = page.locator('#historyModal');
  const turnStats = modal.locator('.turn-row:not(.set-total) .turn-stats').first();
  await expect(modal).toHaveClass(/open/);
  await expect(turnStats).toContainText('IN 1');
  await expect(turnStats).toContainText('OUT 1');
  await expect(turnStats).toContainText('NET 1');

  const horizontalOverflow = await modal.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});

test('RD-002: CSV export Total column equals sum of serve types', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.getByRole('button', { name: /^NET/i }).click();
  await page.getByRole('button', { name: /^FOOT/i }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#historyBtn').click();
  await page.locator('#exportBtn').click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = require('fs');
  const csv = fs.readFileSync(path, 'utf8');
  const dataRow = csv.trim().split('\n')[1].split(',');
  const overIn = parseInt(dataRow[5], 10);
  const overOut = parseInt(dataRow[6], 10);
  const net = parseInt(dataRow[7], 10);
  const foot = parseInt(dataRow[8], 10);
  const total = parseInt(dataRow[9], 10);

  expect(overIn).toBe(2);
  expect(overOut).toBe(1);
  expect(net).toBe(1);
  expect(foot).toBe(1);
  expect(total).toBe(overIn + overOut + net + foot);
  expect(csv.split('\n')[0]).toBe('Player,Date,Match,Set,Turn,OverIn,OverOut,Net,Foot,Total,In-Play Rate');
  expect(dataRow[10]).toBe('40%');
});
