const STORAGE_KEY = 'volleyball-serve-tracker';

function makeData({ matches, playerName = 'Test Player' } = {}) {
  return {
    version: 3,
    playerName,
    matches: matches || [{
      id: 1,
      date: '2026-08-17',
      sets: [{ turns: [{ overIn: 0, overOut: 0, net: 0, foot: 0 }] }],
    }],
  };
}

async function resetApp(page) {
  await page.goto('/index.html');
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
}

async function seedApp(page, data) {
  await page.goto('/index.html');
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEY, value: data });
  await page.reload();
}

module.exports = {
  STORAGE_KEY,
  makeData,
  resetApp,
  seedApp,
};
