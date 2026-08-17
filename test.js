// test.js - Comprehensive Node.js test script for VB Serve Tracker
// Tests all JavaScript logic from index.html in a mocked DOM environment.

const fs = require('fs');
const path = require('path');

// ===========================
// Test infrastructure
// ===========================
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName, detail) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${testName}`);
  } else {
    failed++;
    const msg = detail ? `${testName} -- ${detail}` : testName;
    failures.push(msg);
    console.log(`  FAIL: ${msg}`);
  }
}

function assertEqual(actual, expected, testName) {
  const ok = actual === expected;
  const detail = ok ? '' : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
  assert(ok, testName, detail);
}

function assertIncludes(str, substr, testName) {
  const ok = String(str).includes(substr);
  const detail = ok ? '' : `expected string to include ${JSON.stringify(substr)}, got ${JSON.stringify(String(str).substring(0, 200))}`;
  assert(ok, testName, detail);
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

// ===========================
// Mock DOM environment
// ===========================
function createMockEnv() {
  // localStorage mock
  const storageData = {};
  const mockLocalStorage = {
    getItem(key) { return storageData[key] !== undefined ? storageData[key] : null; },
    setItem(key, value) { storageData[key] = String(value); },
    removeItem(key) { delete storageData[key]; },
    clear() { Object.keys(storageData).forEach(k => delete storageData[k]); },
    _data: storageData,
  };

  // Vibrate tracking
  const vibrateCalls = [];
  const mockNavigator = {
    vibrate(pattern) { vibrateCalls.push(pattern); return true; },
    serviceWorker: { register() { return Promise.resolve(); } },
  };

  // Confirm mock - defaults to true, can be overridden
  let confirmReturnValue = true;
  const confirmCalls = [];
  function mockConfirm(msg) {
    confirmCalls.push(msg);
    if (typeof confirmReturnValue === 'function') return confirmReturnValue(msg);
    if (Array.isArray(confirmReturnValue)) return confirmReturnValue.shift();
    return confirmReturnValue;
  }

  // setTimeout/clearTimeout mock
  let timeoutId = 0;
  const timeouts = {};
  function mockSetTimeout(fn, ms) {
    const id = ++timeoutId;
    timeouts[id] = { fn, ms };
    return id;
  }
  function mockClearTimeout(id) {
    delete timeouts[id];
  }

  // scrollTo mock
  const scrollToCalls = [];
  function mockScrollTo(x, y) {
    scrollToCalls.push({ x, y });
  }

  // Mock elements store
  const elements = {};

  function makeMockElement(id) {
    const el = {
      _id: id,
      textContent: '',
      value: '',
      innerHTML: '',
      disabled: false,
      href: '',
      download: '',
      dataset: {},
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); },
        toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      },
      _listeners: {},
      addEventListener(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
      },
      click() {
        if (this._listeners['click']) this._listeners['click'].forEach(fn => fn({ target: this }));
      },
      closest() { return null; },
      appendChild() {},
      removeChild() {},
    };
    return el;
  }

  // Pre-create all elements used by the app
  const elementIds = [
    'matchInfo', 'turnInfo', 'playerName',
    'overInCount', 'overOutCount', 'netCount', 'footCount',
    'overInTurnCount', 'overOutTurnCount', 'netTurnCount', 'footTurnCount',
    'inPlayRate', 'setTotal', 'turnRate',
    'currentTurnNum', 'totalTurns', 'summarySetNum', 'summarySetRate',
    'prevTurnBtn', 'nextTurnNavBtn',
    'viewingOldBanner', 'viewingOldTurnNum',
    'turnsList',
    'deleteEmptyTurnBtn', 'deleteEmptySetBtn',
    'toast',
    'nextTurnBtn', 'newSetBtn', 'newMatchBtn', 'undoBtn',
    'historyBtn', 'exportBtn', 'closeModal',
    'historyModal', 'historyContent',
    'returnToLatestBtn',
    'clearSetBtn', 'exportAndResetBtn', 'resetAllBtn',
  ];

  elementIds.forEach(id => {
    elements[id] = makeMockElement(id);
  });

  // Serve buttons (queried via querySelectorAll('.serve-btn'))
  const serveBtns = [
    Object.assign(makeMockElement('serve-overIn'), { dataset: { type: 'overIn' } }),
    Object.assign(makeMockElement('serve-overOut'), { dataset: { type: 'overOut' } }),
    Object.assign(makeMockElement('serve-net'), { dataset: { type: 'net' } }),
    Object.assign(makeMockElement('serve-foot'), { dataset: { type: 'foot' } }),
  ];

  // URL mock
  const blobUrls = [];
  const mockURL = {
    createObjectURL(blob) { const url = 'blob://mock-' + blobUrls.length; blobUrls.push({ url, blob }); return url; },
    revokeObjectURL() {},
  };

  // Blob mock
  function MockBlob(parts, options) {
    this.parts = parts;
    this.type = options ? options.type : '';
    this.content = parts.join('');
  }

  // Created elements tracking (for export link)
  const createdElements = [];

  const mockDocument = {
    getElementById(id) {
      return elements[id] || makeMockElement(id);
    },
    querySelectorAll(selector) {
      if (selector === '.serve-btn') return serveBtns;
      return [];
    },
    createElement(tag) {
      const el = makeMockElement('created-' + tag + '-' + createdElements.length);
      el._tag = tag;
      createdElements.push(el);
      return el;
    },
    body: {
      appendChild() {},
      removeChild() {},
    },
  };

  return {
    localStorage: mockLocalStorage,
    navigator: mockNavigator,
    vibrateCalls,
    confirm: mockConfirm,
    confirmCalls,
    setConfirmReturn(val) { confirmReturnValue = val; },
    setTimeout: mockSetTimeout,
    clearTimeout: mockClearTimeout,
    timeouts,
    scrollTo: mockScrollTo,
    scrollToCalls,
    document: mockDocument,
    URL: mockURL,
    Blob: MockBlob,
    blobUrls,
    createdElements,
    elements,
    serveBtns,
    console: { log() {}, error() {}, warn() {} },
  };
}

// ===========================
// Extract JS from HTML and eval with mock env
// ===========================
function loadAppCode() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error('No <script> tag found in index.html');
  return scriptMatch[1];
}

const appCode = loadAppCode();

// Build a function that evaluates the app code with our mocks injected.
// Returns the app's global state and functions.
function initApp(env) {
  env = env || createMockEnv();

  // Reset confirm state (clear in-place, don't replace the array reference)
  env.confirmCalls.length = 0;
  env.setConfirmReturn(true);

  // We wrap the app code so we can capture all globals it defines.
  // The app uses: const STORAGE_KEY, DATA_VERSION, let data, undoStack, viewingTurnIndex
  // and defines many functions at top-level scope.
  const wrappedCode = `
    (function(localStorage, navigator, confirm, document, setTimeout, clearTimeout, window, URL, Blob, console) {
      // Make window refer to the mock env
      var window = arguments[9] || {};
      window.scrollTo = arguments[10];

      ${appCode}

      return {
        STORAGE_KEY,
        DATA_VERSION,
        get data() { return data; },
        set data(v) { data = v; },
        get undoStack() { return undoStack; },
        set undoStack(v) { undoStack = v; },
        get viewingTurnIndex() { return viewingTurnIndex; },
        set viewingTurnIndex(v) { viewingTurnIndex = v; },
        loadData, migrateData, createFreshData, saveData,
        getCurrentMatch, getCurrentSet, getCurrentTurn, getCurrentTurnIndex,
        goToTurn, goToPrevTurn, goToNextTurn, goToLatestTurn,
        isTurnEmpty, isSetEmpty, getSetTotals,
        emptyTurn, getTurnTotal, getInPlayRate, migrateTurn,
        updateDisplay, recordServe, undo, nextTurn, prevTurn,
        newSet, deleteEmptySet, newMatch,
        deleteEmptyTurn, clearSetData, resetAllData, exportAndReset,
        showToast, csvEscape, exportCSV, showHistory,
      };
    })
  `;

  const factory = eval(wrappedCode);
  const app = factory(
    env.localStorage,
    env.navigator,
    env.confirm,
    env.document,
    env.setTimeout,
    env.clearTimeout,
    { scrollTo: env.scrollTo },
    env.URL,
    env.Blob,
    env.console,
    env.scrollTo
  );

  return { app, env };
}

// Helper: fresh app (empty localStorage)
function freshApp(opts) {
  const env = createMockEnv();
  if (opts && opts.confirmReturn !== undefined) {
    env.setConfirmReturn(opts.confirmReturn);
  }
  if (opts && opts.storageData) {
    Object.entries(opts.storageData).forEach(([k, v]) => env.localStorage.setItem(k, v));
  }
  return initApp(env);
}

// ===========================
// Tests
// ===========================

section('TC-1: Serve Counting');

(function TC_1_1() {
  const { app } = freshApp();
  const before = app.getCurrentTurn().overIn;
  app.recordServe('overIn');
  assertEqual(app.getCurrentTurn().overIn, before + 1, 'TC-1.1: recordServe("overIn") increments overIn count');
})();

(function TC_1_2() {
  const { app } = freshApp();
  const before = app.getCurrentTurn().net;
  app.recordServe('net');
  assertEqual(app.getCurrentTurn().net, before + 1, 'TC-1.2: recordServe("net") increments net count');
})();

(function TC_1_3() {
  const { app } = freshApp();
  const before = app.getCurrentTurn().foot;
  app.recordServe('foot');
  assertEqual(app.getCurrentTurn().foot, before + 1, 'TC-1.3: recordServe("foot") increments foot count');
})();

(function TC_1_3b() {
  const { app } = freshApp();
  const before = app.getCurrentTurn().overOut;
  app.recordServe('overOut');
  assertEqual(app.getCurrentTurn().overOut, before + 1, 'TC-1.1b: recordServe("overOut") increments overOut count');
})();

(function TC_1_4() {
  const { app } = freshApp();
  for (let i = 0; i < 10; i++) app.recordServe('overIn');
  assertEqual(app.getCurrentTurn().overIn, 10, 'TC-1.4: Rapid recording - 10 calls, overIn count is 10');
})();

(function TC_1_5() {
  const { app } = freshApp();
  // Create 3 turns
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.nextTurn();
  app.recordServe('foot');
  // Navigate to turn 0 (old turn)
  app.goToTurn(0);
  const overInBefore = app.data.matches[0].sets[0].turns[0].overIn;
  app.recordServe('overIn'); // should do nothing
  assertEqual(app.data.matches[0].sets[0].turns[0].overIn, overInBefore, 'TC-1.5: recordServe does nothing when viewingTurnIndex is not null');
})();

(function TC_1_6() {
  const { app } = freshApp();
  const turnBefore = JSON.stringify(app.getCurrentTurn());
  const undoDepthBefore = app.undoStack.length;
  app.recordServe('unknown');
  assertEqual(JSON.stringify(app.getCurrentTurn()), turnBefore, 'TC-1.6a: unknown serve type does not alter turn data');
  assertEqual(app.undoStack.length, undoDepthBefore, 'TC-1.6b: unknown serve type does not alter undo history');
})();

section('TC-2: Turn Management');

(function TC_2_1() {
  const { app } = freshApp();
  app.recordServe('overIn');
  const turnsBefore = app.getCurrentSet().turns.length;
  app.nextTurn();
  assertEqual(app.getCurrentSet().turns.length, turnsBefore + 1, 'TC-2.1a: nextTurn creates new turn');
  const newTurn = app.getCurrentTurn();
  assertEqual(app.getTurnTotal(newTurn), 0, 'TC-2.1b: new turn is empty');
})();

(function TC_2_2() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.recordServe('overIn');
  assertEqual(app.getCurrentTurn().overIn, 2, 'TC-2.2a: over is 2 after two records');
  app.undo();
  assertEqual(app.getCurrentTurn().overIn, 1, 'TC-2.2b: undo decrements count to 1');
  app.undo(); // second undo should also work (undo stack)
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-2.2c: second undo decrements to 0');
  app.undo(); // third undo should do nothing (stack empty)
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-2.2d: third undo does nothing (stack empty)');
})();

(function TC_2_3() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  const turnsAfterNext = app.getCurrentSet().turns.length;
  app.undo(); // undo the nextTurn
  assertEqual(app.getCurrentSet().turns.length, turnsAfterNext - 1, 'TC-2.3: undo after nextTurn removes the empty turn');
})();

(function TC_2_4() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.nextTurn();
  app.recordServe('foot');
  // At turn 3 (index 2), go prev
  app.goToPrevTurn();
  assertEqual(app.viewingTurnIndex, 1, 'TC-2.4: goToPrevTurn sets viewingTurnIndex to previous turn (index 1)');
})();

(function TC_2_5() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.nextTurn();
  app.recordServe('foot');
  app.goToTurn(0);
  assertEqual(app.viewingTurnIndex, 0, 'TC-2.5a: viewing turn 0');
  app.goToNextTurn();
  assertEqual(app.viewingTurnIndex, 1, 'TC-2.5b: goToNextTurn advances to turn 1');
})();

(function TC_2_6() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.goToTurn(0);
  assert(app.viewingTurnIndex !== null, 'TC-2.6a: viewing old turn (not null)');
  app.goToLatestTurn();
  assertEqual(app.viewingTurnIndex, null, 'TC-2.6b: goToLatestTurn sets viewingTurnIndex to null');
})();

(function TC_2_7() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.nextTurn();
  app.recordServe('foot');
  app.goToTurn(1);
  assertEqual(app.viewingTurnIndex, 1, 'TC-2.7: goToTurn(1) sets correct viewing index');
})();

(function TC_2_8() {
  const { app } = freshApp();
  // Create turns: T0 with data, T1 empty, T2 with data
  app.recordServe('overIn');
  app.nextTurn();
  // T1 is empty, add T2
  app.nextTurn();
  app.recordServe('net');
  // Navigate to T1 (the empty middle one)
  app.goToTurn(1);
  const turnsBefore = app.getCurrentSet().turns.length;
  app.deleteEmptyTurn();
  assertEqual(app.getCurrentSet().turns.length, turnsBefore - 1, 'TC-2.8: deleteEmptyTurn removes empty turn from middle');
})();

(function TC_2_9() {
  const { app } = freshApp();
  // Single turn with serves - delete should be blocked
  app.recordServe('overIn');
  const turnsBefore = app.getCurrentSet().turns.length;
  app.deleteEmptyTurn();
  assertEqual(app.getCurrentSet().turns.length, turnsBefore, 'TC-2.9a: deleteEmptyTurn blocked when turn has serves');

  // Only one turn, no serves - still blocked (only turn)
  const { app: app2 } = freshApp();
  const turns2 = app2.getCurrentSet().turns.length;
  app2.deleteEmptyTurn();
  assertEqual(app2.getCurrentSet().turns.length, turns2, 'TC-2.9b: deleteEmptyTurn blocked when only one turn');
})();

(function TC_2_10() {
  const { app } = freshApp();
  app.recordServe('overIn');
  app.nextTurn();
  app.recordServe('net');
  app.goToTurn(0);
  assert(app.viewingTurnIndex !== null, 'TC-2.10a: viewing old turn');
  app.goToLatestTurn();
  assertEqual(app.viewingTurnIndex, null, 'TC-2.10b: goToLatestTurn after viewing old turn returns to null');
  assertEqual(app.getCurrentTurn().net, 1, 'TC-2.10c: after goToLatestTurn, viewing latest turn data');
})();

section('TC-3: Set Management');

(function TC_3_1() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  const setsBefore = app.getCurrentMatch().sets.length;
  app.newSet();
  assertEqual(app.getCurrentMatch().sets.length, setsBefore + 1, 'TC-3.1a: newSet with confirm=true creates new set');
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-3.1b: new set starts empty');
  assert(env.confirmCalls.length > 0, 'TC-3.1c: confirm dialog was shown');
})();

(function TC_3_2() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  app.recordServe('net');
  app.nextTurn();
  app.recordServe('foot');
  app.clearSetData();
  const set = app.getCurrentSet();
  assertEqual(set.turns.length, 1, 'TC-3.2a: clearSetData resets to single turn');
  assertEqual(app.getTurnTotal(set.turns[0]), 0, 'TC-3.2b: turn is empty after clear');
})();

(function TC_3_3() {
  const { app, env } = freshApp();
  app.recordServe('overIn');
  app.recordServe('net');
  env.setConfirmReturn(false);
  app.clearSetData();
  assertEqual(app.getCurrentTurn().overIn, 1, 'TC-3.3: clearSetData with confirm=false does nothing');
})();

(function TC_3_4() {
  const { app, env } = freshApp();
  app.recordServe('overIn');
  env.setConfirmReturn(false);
  const setsBefore = app.getCurrentMatch().sets.length;
  app.newSet();
  assertEqual(app.getCurrentMatch().sets.length, setsBefore, 'TC-3.4: newSet with confirm=false does nothing');
})();

(function TC_3_5() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  app.newSet(); // creates set 2 (empty)
  assertEqual(app.getCurrentMatch().sets.length, 2, 'TC-3.5a: have 2 sets');
  app.deleteEmptySet();
  assertEqual(app.getCurrentMatch().sets.length, 1, 'TC-3.5b: deleteEmptySet removes empty set');
})();

(function TC_3_6() {
  const { app, env } = freshApp();
  // Only 1 set - should not delete
  const setsBefore = app.getCurrentMatch().sets.length;
  app.deleteEmptySet();
  assertEqual(app.getCurrentMatch().sets.length, setsBefore, 'TC-3.6a: deleteEmptySet blocked when only set');

  // Set with serves - should not delete
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  app.newSet();
  // Go back conceptually - the latest set IS the new empty one, put data in old set
  // Actually the current set is the new empty one. Let's record in it to make it non-empty.
  app.recordServe('net');
  const setsNow = app.getCurrentMatch().sets.length;
  app.deleteEmptySet();
  assertEqual(app.getCurrentMatch().sets.length, setsNow, 'TC-3.6b: deleteEmptySet blocked when set has serves');
})();

(function TC_3_7() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn'); // put data in set 1
  app.newSet(); // creates set 2 (empty)
  assertEqual(app.getCurrentMatch().sets.length, 2, 'TC-3.7a: 2 sets after first newSet');
  // Now set 2 is empty, call newSet again - should auto-clean the empty set
  app.newSet(); // empty set 2 should be replaced, not set 3 added alongside
  assertEqual(app.getCurrentMatch().sets.length, 2, 'TC-3.7b: auto-cleans empty previous set, count stays 2 not 3');
})();

section('TC-4: Match Management');

(function TC_4_1() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  const matchesBefore = app.data.matches.length;
  app.newMatch();
  assertEqual(app.data.matches.length, matchesBefore + 1, 'TC-4.1a: newMatch creates new match');
  const newMatch = app.getCurrentMatch();
  assert(typeof newMatch.id === 'number' && newMatch.id > 0, 'TC-4.1b: match has numeric id (Date.now()-like)');
  assert(env.confirmCalls.some(m => m.includes('new match')), 'TC-4.1c: confirm dialog shown for new match');
})();

(function TC_4_2() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.newMatch();
  const newMatch = app.getCurrentMatch();
  const today = new Date().toISOString().split('T')[0];
  assertEqual(newMatch.date, today, 'TC-4.2: newMatch sets today\'s date');
})();

section('TC-5: Player Name');

(function TC_5_1() {
  const { app, env } = freshApp();
  app.data.playerName = 'TestPlayer';
  app.saveData();
  const stored = JSON.parse(env.localStorage.getItem('volleyball-serve-tracker'));
  assertEqual(stored.playerName, 'TestPlayer', 'TC-5.1: playerName persisted via saveData');
})();

(function TC_5_2() {
  const env = createMockEnv();
  const storedData = {
    version: 2,
    playerName: 'Jane Doe',
    matches: [{ id: 1, date: '2026-02-27', sets: [{ turns: [{ over: 3, net: 1, foot: 0 }] }] }]
  };
  env.localStorage.setItem('volleyball-serve-tracker', JSON.stringify(storedData));
  const { app } = initApp(env);
  assertEqual(app.data.playerName, 'Jane Doe', 'TC-5.2: loadData retrieves stored player name');
})();

(function TC_5_3() {
  const { app, env } = freshApp();
  app.data.playerName = 'TestPlayer';
  app.recordServe('overIn');
  app.exportCSV();
  // Check that the created anchor has the player name in download filename
  const anchor = env.createdElements.find(e => e._tag === 'a');
  assertIncludes(anchor.download, 'TestPlayer', 'TC-5.3a: player name in CSV filename');
  // Check CSV content via Blob
  const blob = env.blobUrls[env.blobUrls.length - 1].blob;
  assertIncludes(blob.content, 'TestPlayer', 'TC-5.3b: player name in CSV content');
})();

(function TC_5_4() {
  const { app, env } = freshApp();
  app.data.playerName = '';
  app.exportCSV();
  const anchor = env.createdElements.find(e => e._tag === 'a');
  const blob = env.blobUrls[env.blobUrls.length - 1].blob;
  assertIncludes(anchor.download, 'serves-player-', 'TC-5.4a: empty player name uses filename fallback');
  assertIncludes(blob.content, 'Unknown,', 'TC-5.4b: empty player name uses CSV fallback');
})();

section('TC-6: CSV Export');

(function TC_6_1() {
  const { app, env } = freshApp();
  app.data.playerName = 'Test';
  app.recordServe('overIn');
  app.exportCSV();
  const blob = env.blobUrls[env.blobUrls.length - 1].blob;
  const csv = blob.content;
  const lines = csv.split('\n');
  assertEqual(lines[0], 'Player,Date,Match,Set,Turn,OverIn,OverOut,Net,Foot,Total,In-Play Rate', 'TC-6.6a: CSV header row correct');
})();

(function TC_6_2() {
  const { app, env } = freshApp();
  app.data.playerName = 'Alice';
  // Turn 1: 5 over/in, 2 net, 1 foot
  for (let i = 0; i < 5; i++) app.recordServe('overIn');
  for (let i = 0; i < 2; i++) app.recordServe('net');
  app.recordServe('foot');
  // Turn 2
  app.nextTurn();
  for (let i = 0; i < 3; i++) app.recordServe('overIn');
  app.recordServe('net');
  app.exportCSV();
  const blob = env.blobUrls[env.blobUrls.length - 1].blob;
  const csv = blob.content;
  const lines = csv.split('\n');
  // Line 1 (turn1): Alice,date,1,1,1,5,0,2,1,8,63%
  assertIncludes(lines[1], '5,0,2,1,8,63%', 'TC-6.6b: CSV turn 1 data matches');
  // Line 2 (turn2): Alice,date,1,1,2,3,0,1,0,4,75%
  assertIncludes(lines[2], '3,0,1,0,4,75%', 'TC-6.6c: CSV turn 2 data matches');
})();

(function TC_6_3() {
  const { app } = freshApp();
  const result = app.csvEscape("O'Brien, Jr.");
  assertEqual(result, '"O\'Brien, Jr."', 'TC-12.2: csvEscape escapes commas');
})();

(function TC_6_4() {
  const { app } = freshApp();
  const result = app.csvEscape('She said "hi"');
  assertEqual(result, '"She said ""hi"""', 'TC-12.3a: csvEscape escapes quotes');
})();

(function TC_6_5() {
  const { app } = freshApp();
  const result = app.csvEscape('Line1\nLine2');
  assertEqual(result, '"Line1\nLine2"', 'TC-12.3b: csvEscape handles newlines');
})();

(function TC_6_6() {
  const { app, env } = freshApp();
  app.data.playerName = 'Test/Player <script>';
  app.recordServe('overIn');
  app.exportCSV();
  const anchor = env.createdElements.find(e => e._tag === 'a');
  assert(!anchor.download.includes('/'), 'TC-12.4a: CSV filename has no slash');
  assert(!anchor.download.includes('<'), 'TC-12.4b: CSV filename has no angle bracket');
  assertIncludes(anchor.download, 'Test_Player__script_', 'TC-12.4c: special chars replaced with _');
})();

(function TC_6_7() {
  const { app, env } = freshApp();
  app.data.playerName = 'Verify';
  app.recordServe('overIn');
  app.recordServe('overIn');
  app.recordServe('overOut');
  app.recordServe('net');
  app.recordServe('foot');
  app.exportCSV();
  const blob = env.blobUrls[env.blobUrls.length - 1].blob;
  const row = blob.content.split('\n')[1].split(',');
  const overIn = parseInt(row[5], 10);
  const overOut = parseInt(row[6], 10);
  const net = parseInt(row[7], 10);
  const foot = parseInt(row[8], 10);
  const total = parseInt(row[9], 10);
  assertEqual(overIn + overOut + net + foot, total, 'TC-6.7: CSV Total column equals sum of serve types');
})();

section('TC-8: Data Persistence');

(function TC_8_1() {
  const { app, env } = freshApp();
  app.recordServe('overIn');
  app.recordServe('overIn');
  app.recordServe('net');
  const stored = env.localStorage.getItem('volleyball-serve-tracker');
  assert(stored !== null, 'TC-8.1a: data stored in localStorage');
  const parsed = JSON.parse(stored);
  assertEqual(parsed.version, 3, 'TC-8.1b: version is 3');
  assertEqual(parsed.matches[0].sets[0].turns[0].overIn, 2, 'TC-8.1c: overIn count stored correctly');
  assertEqual(parsed.matches[0].sets[0].turns[0].net, 1, 'TC-8.1d: net count stored correctly');
})();

(function TC_8_2() {
  const { app } = freshApp();
  // Simulate v1 data (flat sets without turns)
  const v1Data = {
    playerName: 'OldPlayer',
    matches: [{
      id: 1,
      date: '2026-01-01',
      sets: [{ over: 5, net: 2, foot: 1 }]
    }]
  };
  const migrated = app.migrateData(v1Data);
  assertEqual(migrated.version, 3, 'TC-8.2a: version updated to 3');
  assert(Array.isArray(migrated.matches[0].sets[0].turns), 'TC-8.2b: set now has turns array');
  assertEqual(migrated.matches[0].sets[0].turns[0].overIn, 5, 'TC-8.2c: legacy over migrated to overIn');
  assertEqual(migrated.matches[0].sets[0].turns[0].overOut, 0, 'TC-8.2d: overOut is 0 after v1 migration');
})();

(function TC_8_3() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.recordServe('overIn');
  app.recordServe('overIn');
  app.recordServe('overIn');
  app.resetAllData();
  assertEqual(app.data.matches.length, 1, 'TC-8.3a: resetAllData leaves one match');
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-8.3b: turn is empty after reset');
  assert(env.confirmCalls.length >= 2, 'TC-8.3c: double confirm required (got ' + env.confirmCalls.length + ' calls)');
  assert(env.scrollToCalls.length > 0, 'TC-8.3d: scrollTo called after reset');
})();

(function TC_8_4() {
  // Cancel at first confirm
  const { app: app1, env: env1 } = freshApp();
  app1.recordServe('overIn');
  env1.setConfirmReturn(false);
  app1.resetAllData();
  assertEqual(app1.getCurrentTurn().overIn, 1, 'TC-8.4a: resetAllData cancelled at first confirm preserves data');

  // Cancel at second confirm
  const { app: app2, env: env2 } = freshApp();
  app2.recordServe('overIn');
  env2.setConfirmReturn([true, false]); // first true, second false
  app2.resetAllData();
  assertEqual(app2.getCurrentTurn().overIn, 1, 'TC-8.4b: resetAllData cancelled at second confirm preserves data');
})();

section('TC-9: Statistics');

(function TC_9_1() {
  const { app } = freshApp();
  for (let i = 0; i < 7; i++) app.recordServe('overIn');
  for (let i = 0; i < 2; i++) app.recordServe('net');
  app.recordServe('foot');
  const totals = app.getSetTotals(app.getCurrentSet());
  const rate = app.getInPlayRate(totals);
  assertEqual(rate, 70, 'TC-9.1: Set in-play rate = 70% (7/10)');
})();

(function TC_9_2() {
  const { app } = freshApp();
  for (let i = 0; i < 3; i++) app.recordServe('overIn');
  app.recordServe('net');
  app.recordServe('foot');
  const turn = app.getCurrentTurn();
  const rate = app.getInPlayRate(turn);
  assertEqual(rate, 60, 'TC-9.2: Turn in-play rate = 60% (3/5)');
})();

(function TC_9_3() {
  const { app } = freshApp();
  const turn = app.getCurrentTurn();
  const rate = app.getInPlayRate(turn);
  assertEqual(rate, 0, 'TC-9.3: Zero division handling returns 0%, not NaN');
  assert(!isNaN(rate), 'TC-9.3b: rate is not NaN');
})();

(function TC_9_4() {
  const { app } = freshApp();
  for (let i = 0; i < 3; i++) app.recordServe('overIn');
  app.recordServe('net');
  app.recordServe('foot');
  app.nextTurn();
  for (let i = 0; i < 2; i++) app.recordServe('overIn');
  app.recordServe('net');
  const totals = app.getSetTotals(app.getCurrentSet());
  assertEqual(totals.overIn, 5, 'TC-9.4a: getSetTotals overIn=5 across turns');
  assertEqual(totals.net, 2, 'TC-9.4b: getSetTotals net=2 across turns');
  assertEqual(totals.foot, 1, 'TC-9.4c: getSetTotals foot=1 across turns');
  assertEqual(app.getTurnTotal(totals), 8, 'TC-9.4d: total serves = 8');
})();

(function TC_9_5() {
  const { app } = freshApp();
  for (let i = 0; i < 5; i++) app.recordServe('overIn');
  app.nextTurn();
  for (let i = 0; i < 5; i++) app.recordServe('net');

  const totals = app.getSetTotals(app.getCurrentSet());
  assertEqual(app.getInPlayRate(totals), 50, 'TC-9.5a: set rate is 50% (aggregate)');

  const turn2 = app.getCurrentTurn();
  assertEqual(app.getInPlayRate(turn2), 0, 'TC-9.5b: turn 2 rate is 0%');

  app.goToTurn(0);
  const turn1 = app.getCurrentTurn();
  assertEqual(app.getInPlayRate(turn1), 100, 'TC-9.5c: turn 1 rate is 100%');

  const totals2 = app.getSetTotals(app.getCurrentSet());
  assertEqual(app.getInPlayRate(totals2), 50, 'TC-9.5d: set rate still 50% when viewing turn 1');
})();

(function TC_9_6() {
  const { app } = freshApp();
  for (let i = 0; i < 3; i++) app.recordServe('overIn');
  for (let i = 0; i < 2; i++) app.recordServe('overOut');
  app.recordServe('net');
  const turn = app.getCurrentTurn();
  assertEqual(app.getTurnTotal(turn), 6, 'TC-9.6a: getTurnTotal includes overOut');
  assertEqual(app.getInPlayRate(turn), 50, 'TC-9.6b: in-play rate = 50% (3/6, overOut not counted)');
})();

(function TC_9_7() {
  const { app } = freshApp();
  const cases = [
    { name: 'empty', counts: { overIn: 0, overOut: 0, net: 0, foot: 0 }, total: 0, rate: 0 },
    { name: 'all in', counts: { overIn: 4, overOut: 0, net: 0, foot: 0 }, total: 4, rate: 100 },
    { name: 'all out', counts: { overIn: 0, overOut: 4, net: 0, foot: 0 }, total: 4, rate: 0 },
    { name: 'rounds down', counts: { overIn: 1, overOut: 1, net: 1, foot: 0 }, total: 3, rate: 33 },
    { name: 'rounds up', counts: { overIn: 2, overOut: 0, net: 1, foot: 0 }, total: 3, rate: 67 },
    { name: 'all categories', counts: { overIn: 3, overOut: 2, net: 4, foot: 1 }, total: 10, rate: 30 },
  ];

  cases.forEach(({ name, counts, total, rate }) => {
    assertEqual(app.getTurnTotal(counts), total, `TC-9.7 total: ${name}`);
    assertEqual(app.getInPlayRate(counts), rate, `TC-9.7 in-play rate: ${name}`);
  });
})();

(function TC_9_8() {
  const { app } = freshApp();
  const set = {
    turns: [
      { overIn: 2, overOut: 1, net: 0, foot: 1 },
      { overIn: 3, overOut: 0, net: 2, foot: 0 },
    ],
  };
  const before = JSON.stringify(set);
  const totals = app.getSetTotals(set);
  assertEqual(totals.overIn, 5, 'TC-9.8a: aggregation sums overIn');
  assertEqual(totals.overOut, 1, 'TC-9.8b: aggregation sums overOut');
  assertEqual(totals.net, 2, 'TC-9.8c: aggregation sums net');
  assertEqual(totals.foot, 1, 'TC-9.8d: aggregation sums foot');
  assertEqual(app.getTurnTotal(totals), 9, 'TC-9.8e: aggregate total includes every category');
  assertEqual(app.getInPlayRate(totals), 56, 'TC-9.8f: aggregate in-play rate rounds correctly');
  assertEqual(JSON.stringify(set), before, 'TC-9.8g: aggregation does not mutate source turns');
})();

section('TC-11: Safety');

(function TC_11_1() {
  const { app, env } = freshApp();
  app.recordServe('overIn');
  assert(env.vibrateCalls.length > 0, 'TC-11.1a: navigator.vibrate called on recordServe');
  assertEqual(env.vibrateCalls[0], 50, 'TC-11.1b: vibrate called with 50ms');
})();

(function TC_11_1_unsupported() {
  const env = createMockEnv();
  delete env.navigator.vibrate;
  const { app } = initApp(env);
  app.recordServe('overIn');
  assertEqual(app.getCurrentTurn().overIn, 1, 'TC-11.1c: serve records when vibration API is unavailable');
})();

(function TC_11_2() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.newSet();
  assert(env.confirmCalls.some(m => m.toLowerCase().includes('new set')), 'TC-11.2: newSet shows confirm dialog');
})();

(function TC_11_3() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  app.newMatch();
  assert(env.confirmCalls.some(m => m.toLowerCase().includes('new match')), 'TC-11.3: newMatch shows confirm dialog');
})();

section('TC-12: Data Recovery');

(function TC_12_1() {
  // Corrupted JSON in localStorage
  const env = createMockEnv();
  env.localStorage.setItem('volleyball-serve-tracker', '{invalid json!!!');
  // loadData should catch the error and return fresh data
  const { app } = initApp(env);
  assertEqual(app.data.version, 3, 'TC-12.1a: corrupted JSON falls back to fresh data with version 3');
  assertEqual(app.data.matches.length, 1, 'TC-12.1b: fresh data has 1 match');
  assertEqual(app.data.matches[0].sets[0].turns[0].overIn, 0, 'TC-12.1c: fresh data turn is empty');
})();

(function TC_12_2() {
  const env = createMockEnv();
  const validData = {
    version: 2,
    playerName: 'Valid',
    matches: [{ id: 99, date: '2026-02-27', sets: [{ turns: [{ over: 10, net: 2, foot: 1 }] }] }]
  };
  env.localStorage.setItem('volleyball-serve-tracker', JSON.stringify(validData));
  const { app } = initApp(env);
  assertEqual(app.data.playerName, 'Valid', 'TC-8.2e: valid stored JSON retains player name');
  assertEqual(app.data.version, 3, 'TC-8.2f: v2 data migrated to version 3');
  assertEqual(app.data.matches[0].sets[0].turns[0].overIn, 10, 'TC-8.2g: legacy over migrated to overIn');
  assertEqual(app.data.matches[0].sets[0].turns[0].overOut, 0, 'TC-8.2h: overOut is 0 after v2 migration');
  const persisted = JSON.parse(env.localStorage.getItem('volleyball-serve-tracker'));
  assertEqual(persisted.version, 3, 'TC-8.2i: v2 migration is persisted immediately');
  assertEqual(persisted.matches[0].sets[0].turns[0].overIn, 10, 'TC-8.2j: persisted migration retains legacy over count');
})();

(function TC_12_3() {
  const { app } = freshApp();
  const fresh = app.createFreshData();
  assertEqual(fresh.version, 3, 'INV-1a: createFreshData version is 3');
  assertEqual(fresh.playerName, '', 'INV-1b: playerName is empty string');
  assertEqual(fresh.matches.length, 1, 'INV-1c: one match');
  assertEqual(fresh.matches[0].sets.length, 1, 'INV-1d: one set');
  assertEqual(fresh.matches[0].sets[0].turns.length, 1, 'INV-1e: one turn');
  const turn = fresh.matches[0].sets[0].turns[0];
  assertEqual(app.getTurnTotal(turn), 0, 'INV-1f: turn is empty');
})();

section('Edge Cases');

(function EC_1() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  // Create 100 matches with data
  for (let m = 0; m < 100; m++) {
    app.recordServe('overIn');
    app.recordServe('net');
    app.newMatch();
  }
  assert(app.data.matches.length === 101, 'EC-1a: 101 matches created (initial + 100)');
  // Export should not crash
  let exportOk = true;
  try {
    app.exportCSV();
  } catch {
    exportOk = false;
  }
  assert(exportOk, 'EC-1b: exportCSV with 100 matches does not crash');
})();

(function EC_3() {
  const { app, env } = freshApp();
  // Set a name with XSS-like content
  app.data.playerName = '<script>alert("xss")</script>';
  app.saveData();
  // The app uses textContent for display, so the name would be stored as-is
  // but rendered safely. We just verify it's stored correctly.
  const stored = JSON.parse(env.localStorage.getItem('volleyball-serve-tracker'));
  assertEqual(stored.playerName, '<script>alert("xss")</script>', 'EC-3a: special chars stored as-is');
  // The updateDisplay uses textContent (not innerHTML) for player input value
  // and the player name only appears in CSV export (via csvEscape) and as input value.
  // Verify csvEscape handles it:
  const escaped = app.csvEscape(app.data.playerName);
  // The name doesn't have commas/quotes/newlines so it should pass through unchanged
  // Actually it has quotes? No - angle brackets. No commas/quotes/newlines in this string.
  // So csvEscape returns it as-is. That's fine since CSV doesn't have XSS concerns.
  assert(typeof escaped === 'string', 'EC-3b: csvEscape handles special chars without error');
})();

(function TC_2_11() {
  const { app } = freshApp();
  // Record 7 OVERs
  for (let i = 0; i < 7; i++) app.recordServe('overIn');
  assertEqual(app.getCurrentTurn().overIn, 7, 'TC-2.11a: 7 overs recorded');
  // Undo all 7
  for (let i = 0; i < 7; i++) app.undo();
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-2.11b: 7 undos brings count back to 0');
  // One more undo does nothing
  app.undo();
  assertEqual(app.getCurrentTurn().overIn, 0, 'TC-2.11c: 8th undo does nothing (stack empty)');
})();

(function TC_3_8() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  // Record serves to populate undo stack
  app.recordServe('overIn');
  app.recordServe('net');
  app.recordServe('foot');
  assert(app.undoStack.length === 3, 'TC-3.8a: undo stack has 3 entries before newSet');
  app.newSet();
  assertEqual(app.undoStack.length, 0, 'TC-3.8b: undo stack cleared after newSet');
  // Undo should do nothing now
  app.undo();
  const turn = app.getCurrentTurn();
  assertEqual(app.getTurnTotal(turn), 0, 'TC-3.8c: undo does nothing after newSet');
})();

(function TC_4_3() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  // Record serves to populate undo stack
  app.recordServe('overIn');
  app.recordServe('overIn');
  assert(app.undoStack.length === 2, 'TC-4.3a: undo stack has 2 entries before newMatch');
  app.newMatch();
  assertEqual(app.undoStack.length, 0, 'TC-4.3b: undo stack cleared after newMatch');
  // Undo should do nothing now
  app.undo();
  const turn = app.getCurrentTurn();
  assertEqual(app.getTurnTotal(turn), 0, 'TC-4.3c: undo does nothing after newMatch');
})();

(function TC_12_5_6() {
  // Verify static fallbacks and version metadata in the HTML source.
  const html = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  assertIncludes(html, '<noscript>', 'TC-12.5a: noscript fallback element is present');
  assertIncludes(html, 'JavaScript Required', 'TC-12.5b: noscript fallback names the requirement');
  assertIncludes(html, 'Please enable JavaScript', 'TC-12.5c: noscript fallback gives recovery guidance');
  assertIncludes(html, 'Serve Tracker v3.0.0', 'TC-12.6a: version string present in HTML');
  assert(html.includes('color: #888') && html.includes('Serve Tracker v3.0.0'), 'TC-12.6b: version text uses visible color #888');
})();

(function EC_4() {
  const { app, env } = freshApp();
  env.setConfirmReturn(true);
  // Rapid alternating: OVER, OVER, Undo, NET, Next Turn, Undo
  app.recordServe('overIn');
  app.recordServe('overIn');
  app.undo();
  app.recordServe('net');
  app.nextTurn();
  app.undo(); // undo nextTurn

  // Expected state: Turn 1 with over=1, net=1
  const set = app.getCurrentSet();
  assertEqual(set.turns.length, 1, 'EC-4a: 1 turn after rapid alternating');
  assertEqual(set.turns[0].overIn, 1, 'EC-4b: overIn=1 after rapid alternating');
  assertEqual(set.turns[0].net, 1, 'EC-4c: net=1 after rapid alternating');
})();

// ===========================
// Summary
// ===========================
const total = passed + failed;
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${total} total`);

if (failures.length > 0) {
  console.log(`\nFailing tests:`);
  failures.forEach(f => console.log(`  - ${f}`));
}

process.exit(failed > 0 ? 1 : 0);
