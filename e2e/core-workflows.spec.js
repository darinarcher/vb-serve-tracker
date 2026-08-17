// @ts-check
const { test, expect } = require('@playwright/test');
const { STORAGE_KEY, resetApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test('TC-2: turn creation, navigation, old-turn lock, and return to latest', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: 'Next Turn' }).click();
  await page.getByRole('button', { name: /^NET/i }).click();

  await expect(page.locator('#currentTurnNum')).toHaveText('2');
  await expect(page.locator('#totalTurns')).toHaveText('2');
  await expect(page.locator('#overInTurnCount')).toHaveText('(set: 1)');
  await expect(page.locator('#netTurnCount')).toHaveText('(set: 1)');

  await page.locator('#prevTurnBtn').click();
  await expect(page.locator('#viewingOldBanner')).toBeVisible();
  for (const button of await page.locator('.serve-btn').all()) {
    await expect(button).toBeDisabled();
  }
  await expect(page.locator('#overInCount')).toHaveText('1');

  await page.locator('#returnToLatestBtn').click();
  await expect(page.locator('#viewingOldBanner')).toBeHidden();
  for (const button of await page.locator('.serve-btn').all()) {
    await expect(button).toBeEnabled();
  }
  await expect(page.locator('#netCount')).toHaveText('1');
});

test('TC-2.2/2.3: undo reverses serves and empty turn creation', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('#overOutCount')).toHaveText('1');

  await page.getByRole('button', { name: 'Next Turn' }).click();
  await expect(page.locator('#totalTurns')).toHaveText('2');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('#totalTurns')).toHaveText('1');
  await expect(page.locator('#overOutCount')).toHaveText('1');
  await expect(page.locator('#toast')).toHaveText('Turn removed');
});

test('TC-3: new-set confirmation, cancellation, and clear-set behavior', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'New Set' }).click();
  await expect(page.locator('#matchInfo')).toHaveText('Match 1 - Set 1');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'New Set' }).click();
  await expect(page.locator('#matchInfo')).toHaveText('Match 1 - Set 2');
  await expect(page.locator('#setTotal')).toHaveText('0');

  await page.getByRole('button', { name: /^NET/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#clearSetBtn').click();
  await expect(page.locator('#setTotal')).toHaveText('0');
  await expect(page.locator('#totalTurns')).toHaveText('1');
});

test('TC-4: new-match confirmation and cancellation', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'New Match' }).click();
  await expect(page.locator('#matchInfo')).toHaveText('Match 1 - Set 1');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'New Match' }).click();
  await expect(page.locator('#matchInfo')).toHaveText('Match 2 - Set 1');
  await expect(page.locator('#setTotal')).toHaveText('0');
});

test('TC-5.1/5.2: player name persists across reload', async ({ page }) => {
  const player = page.locator('#playerName');
  await player.fill('Daughter Test');
  await page.reload();
  await expect(player).toHaveValue('Daughter Test');

  const storedName = await page.evaluate((key) => {
    return JSON.parse(localStorage.getItem(key)).playerName;
  }, STORAGE_KEY);
  expect(storedName).toBe('Daughter Test');
});

test('TC-8.1/8.5: serve data persists across reload', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.getByRole('button', { name: /OVER\/OUT/i }).click();
  await page.reload();

  await expect(page.locator('#overInCount')).toHaveText('1');
  await expect(page.locator('#overOutCount')).toHaveText('1');
  await expect(page.locator('#setTotal')).toHaveText('2');
});

test('TC-6.1/6.3: history opens with data and closes cleanly', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await page.locator('#historyBtn').click();
  await expect(page.locator('#historyModal')).toHaveClass(/open/);
  await expect(page.locator('#historyContent')).toContainText('IN 1');

  await page.locator('#closeModal').click();
  await expect(page.locator('#historyModal')).not.toHaveClass(/open/);
  await expect(page.getByRole('button', { name: /OVER\/IN/i })).toBeEnabled();
});

test('TC-6.7: export and new player downloads before resetting', async ({ page }) => {
  await page.locator('#playerName').fill('Export Test');
  await page.getByRole('button', { name: /OVER\/IN/i }).click();

  const downloadPromise = page.waitForEvent('download');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#exportAndResetBtn').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^serves-Export_Test-/);
  await expect(page.locator('#playerName')).toHaveValue('');
  await expect(page.locator('#setTotal')).toHaveText('0');
});

test('TC-8.3/8.4: reset requires two confirmations and preserves data when cancelled', async ({ page }) => {
  await page.getByRole('button', { name: /OVER\/IN/i }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.locator('#resetAllBtn').click();
  await expect(page.locator('#setTotal')).toHaveText('1');

  let confirmation = 0;
  page.on('dialog', async (dialog) => {
    confirmation += 1;
    await dialog.accept();
  });
  await page.locator('#resetAllBtn').click();
  await expect(page.locator('#setTotal')).toHaveText('0');
  expect(confirmation).toBe(2);
});

test('TC-12.1: corrupted localStorage recovers to a fresh usable state', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{invalid'), STORAGE_KEY);
  await page.reload();

  await expect(page.locator('#matchInfo')).toHaveText('Match 1 - Set 1');
  await expect(page.locator('#setTotal')).toHaveText('0');
  await page.getByRole('button', { name: /OVER\/IN/i }).click();
  await expect(page.locator('#setTotal')).toHaveText('1');
});
