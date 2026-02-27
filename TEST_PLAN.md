# VB Serve Tracker - Comprehensive Test Plan

**Purpose**: TDD baseline and regression testing for all features
**Last Updated**: 2026-02-27
**App Version**: v2.2.0 (turns within sets)

---

## Quick Regression Checklist

Run this full checklist after every code change:

| Category | Test | Pass |
|----------|------|------|
| Serve | OVER button records | [ ] |
| Serve | NET button records | [ ] |
| Serve | FOOT button records | [ ] |
| Turn | Next Turn creates empty turn | [ ] |
| Turn | Undo reverses last action | [ ] |
| Turn | Turn navigation works | [ ] |
| Set | New Set creates fresh set (with confirmation) | [ ] |
| Set | Delete Empty Set removes empty set | [ ] |
| Set | Clear Set resets current set | [ ] |
| Match | New Match creates fresh match (with confirmation) | [ ] |
| Player | Name input saves | [ ] |
| Player | Name persists on reload | [ ] |
| History | Modal opens with data | [ ] |
| History | CSV exports correctly | [ ] |
| Old Turn | Banner shown, buttons disabled | [ ] |
| Old Turn | Return to Latest works | [ ] |
| Haptic | Vibration on serve tap | [ ] |
| PWA | App works offline | [ ] |
| Data | Data persists across sessions | [ ] |
| Data | Corrupted localStorage recovers | [ ] |
| CSV | Special chars in name escaped | [ ] |

---

## Test Categories

1. [Serve Counting](#1-serve-counting)
2. [Turn Management](#2-turn-management)
3. [Set Management](#3-set-management)
4. [Match Management](#4-match-management)
5. [Player Name](#5-player-name)
6. [History & CSV Export](#6-history--csv-export)
7. [PWA Functionality](#7-pwa-functionality)
8. [Data Persistence](#8-data-persistence)
9. [Statistics Display](#9-statistics-display)
10. [UI & Responsiveness](#10-ui--responsiveness)
11. [Haptic Feedback & Safety](#11-haptic-feedback--safety)
12. [Data Recovery & CSV Safety](#12-data-recovery--csv-safety)

---

## 1. Serve Counting

### TC-1.1: OVER Button Records Serve

**Precondition**: App loaded, on latest turn

**Steps**:
1. Note current OVER count
2. Tap the green OVER button

**Expected**:
- OVER count increments by 1
- Set total updates
- Button shows visual feedback (scale animation)
- Success rate recalculates

**Verify**:
- [ ] Count on button updates immediately
- [ ] Set total in parentheses updates
- [ ] Footer stats update

---

### TC-1.2: NET Button Records Serve

**Precondition**: App loaded, on latest turn

**Steps**:
1. Note current NET count
2. Tap the red NET button

**Expected**:
- NET count increments by 1
- Set total updates
- Success rate decreases (NET reduces success %)

**Verify**:
- [ ] Count updates
- [ ] Success rate reflects NET as failure

---

### TC-1.3: FOOT Button Records Serve

**Precondition**: App loaded, on latest turn

**Steps**:
1. Note current FOOT count
2. Tap the orange FOOT button

**Expected**:
- FOOT count increments by 1
- Set total updates
- Success rate decreases (FOOT reduces success %)

**Verify**:
- [ ] Count updates
- [ ] Success rate reflects FOOT as failure

---

### TC-1.4: Rapid Serve Recording

**Precondition**: App loaded

**Steps**:
1. Rapidly tap OVER button 10 times in quick succession

**Expected**:
- All 10 taps register
- Count shows 10
- No missed taps or lag

**Verify**:
- [ ] Final count equals tap count
- [ ] No UI stuttering

---

### TC-1.5: Serve Buttons Disabled When Viewing Old Turn

**Precondition**: Have 3+ turns, viewing turn 1

**Steps**:
1. Navigate to turn 1 (not latest)
2. Observe serve buttons
3. Try to tap OVER button

**Expected**:
- Serve buttons are visually disabled (grayed out, opacity 0.4)
- Orange banner appears: "Viewing Turn 1 — Return to Latest"
- Tapping serve buttons has no effect
- Counts do not change

**Verify**:
- [ ] Serve buttons visually disabled
- [ ] Orange banner visible with correct turn number
- [ ] Taps ignored — no count changes
- [ ] "Return to Latest" button present in banner

---

## 2. Turn Management

### TC-2.1: Create New Turn

**Precondition**: App loaded, have some serves recorded

**Steps**:
1. Note current turn number
2. Tap "Next Turn" button

**Expected**:
- New empty turn created
- Turn count increments
- All serve counts reset to 0 on button display
- Set totals remain unchanged
- Now viewing new (latest) turn

**Verify**:
- [ ] Turn number increases
- [ ] Button counts show 0
- [ ] Set totals preserved
- [ ] "viewing old" indicator NOT shown

---

### TC-2.2: Undo Serve Recording

**Precondition**: Just recorded a serve (e.g., OVER)

**Steps**:
1. Record an OVER serve
2. Tap "Undo" button

**Expected**:
- OVER count decrements by 1
- Stats recalculate
- lastAction cleared (second Undo does nothing)

**Verify**:
- [ ] Count goes back
- [ ] Stats update
- [ ] Second Undo has no effect

---

### TC-2.3: Undo Turn Creation

**Precondition**: Have at least 2 turns, latest is empty

**Steps**:
1. Tap "Next Turn" to create empty turn
2. Immediately tap "Undo"

**Expected**:
- Empty turn removed
- Returns to previous turn
- Toast shows "Turn removed"

**Verify**:
- [ ] Turn count decreases
- [ ] Previous turn's data shown
- [ ] Toast notification appears

---

### TC-2.4: Turn Navigation - Previous

**Precondition**: Have 3+ turns with data

**Steps**:
1. Start at latest turn (e.g., Turn 3)
2. Tap left arrow (Previous) in Turn Navigation

**Expected**:
- Shows Turn 2 data
- "viewing old" indicator appears (orange text)
- Serve buttons show Turn 2 counts
- Set totals unchanged

**Verify**:
- [ ] Turn info shows "Turn 2 (viewing old)"
- [ ] Button counts match Turn 2
- [ ] Prev button still enabled if Turn 1 exists

---

### TC-2.5: Turn Navigation - Next

**Precondition**: Viewing Turn 1 (not latest)

**Steps**:
1. While viewing Turn 1, tap right arrow (Next)

**Expected**:
- Advances to Turn 2
- Updates display for Turn 2

**Verify**:
- [ ] Turn number increments
- [ ] Correct turn data displayed

---

### TC-2.6: Turn Navigation - Return to Latest (via arrows)

**Precondition**: Viewing old turn

**Steps**:
1. Navigate to Turn 1
2. Tap right arrow until reaching latest turn

**Expected**:
- "viewing old" indicator disappears
- Orange banner disappears
- Serve buttons re-enabled
- Next button becomes disabled
- Normal operation resumes

**Verify**:
- [ ] Orange indicator and banner gone
- [ ] Serve buttons enabled
- [ ] Next button disabled at latest

---

### TC-2.10: Return to Latest via Banner Button

**Precondition**: Viewing old turn, orange banner visible

**Steps**:
1. Navigate to Turn 1 (not latest)
2. Tap "Return to Latest" button in the orange banner

**Expected**:
- Jumps directly to the latest turn
- Banner disappears
- Serve buttons re-enabled
- Display shows latest turn data

**Verify**:
- [ ] Viewing latest turn
- [ ] Banner hidden
- [ ] Serve buttons active

---

### TC-2.7: Turn List Click Navigation

**Precondition**: Have 3+ turns

**Steps**:
1. Scroll to "Current Set Summary" section
2. Tap on any turn row in the list

**Expected**:
- Navigates to that turn
- Turn becomes highlighted (purple background)
- Display updates to show that turn

**Verify**:
- [ ] Clicked turn highlights
- [ ] Serve buttons reflect clicked turn's data

---

### TC-2.8: Delete Empty Turn

**Precondition**: Have 2+ turns, current turn is empty (0/0/0)

**Steps**:
1. Navigate to an empty turn
2. Tap "Delete Empty Turn" button

**Expected**:
- Turn removed from set
- Toast shows "Turn deleted"
- Viewing index adjusts if needed

**Verify**:
- [ ] Turn count decreases
- [ ] Empty turn gone from list

---

### TC-2.9: Delete Empty Turn - Blocked Cases

**Precondition**: Various scenarios

**Steps & Expected**:
1. Try delete when turn has serves -> Button disabled
2. Try delete when only 1 turn exists -> Button disabled

**Verify**:
- [ ] Button disabled with serves present
- [ ] Button disabled when single turn

---

## 3. Set Management

### TC-3.1: Create New Set

**Precondition**: App loaded with some data

**Steps**:
1. Note current set number
2. Tap "New Set" button
3. Confirm in dialog

**Expected**:
- Confirmation dialog appears asking "Start a new set?"
- On confirm: Set number increments
- New set starts with empty Turn 1
- Previous set data preserved
- Turn count resets to 1
- All serve counts reset to 0

**Verify**:
- [ ] Confirmation dialog appears
- [ ] Header shows new set number
- [ ] Turn is 1
- [ ] Counts are 0
- [ ] Previous set visible in History

---

### TC-3.4: Create New Set - Cancel

**Precondition**: App loaded with data in current set

**Steps**:
1. Tap "New Set" button
2. Cancel in dialog

**Expected**:
- No changes made
- Current set and data preserved

**Verify**:
- [ ] All data intact after cancel

---

### TC-3.5: Delete Empty Set

**Precondition**: Have 2+ sets, current set has no serves recorded (all turns empty)

**Steps**:
1. Create a new set (current set now empty)
2. Scroll to Quick Actions
3. Tap "Delete Empty Set"

**Expected**:
- Empty set removed
- Returns to previous set with its data
- Toast shows "Empty set removed"

**Verify**:
- [ ] Set count decreases
- [ ] Previous set data displayed
- [ ] Toast notification appears

---

### TC-3.6: Delete Empty Set - Blocked Cases

**Steps & Expected**:
1. Try delete when set has serves recorded -> Button disabled
2. Try delete when only 1 set exists -> Button disabled

**Verify**:
- [ ] Button disabled when set has data
- [ ] Button disabled when single set

---

### TC-3.7: New Set Auto-Cleans Empty Previous Set

**Precondition**: Have 2+ sets, current set is entirely empty

**Steps**:
1. Create a new empty set (Set 2)
2. Without recording any serves, tap "New Set" again and confirm

**Expected**:
- Empty Set 2 is replaced (not kept alongside Set 3)
- New set is Set 2 (not Set 3)
- No empty sets accumulated

**Verify**:
- [ ] Header shows Set 2, not Set 3
- [ ] History shows no empty sets

---

### TC-3.2: Clear Set Data

**Precondition**: Current set has multiple turns with serves

**Steps**:
1. Record several serves across multiple turns
2. Tap "Clear Set Data" button
3. Confirm in dialog

**Expected**:
- Confirmation dialog appears
- On confirm: Set resets to single empty turn
- All turns and serves in current set deleted
- Toast shows "Set cleared"

**Verify**:
- [ ] Dialog asks for confirmation
- [ ] After confirm: Turn 1 with 0/0/0
- [ ] Set total shows 0

---

### TC-3.3: Clear Set Data - Cancel

**Precondition**: Current set has data

**Steps**:
1. Tap "Clear Set Data"
2. Cancel in dialog

**Expected**:
- No changes made
- Data preserved

**Verify**:
- [ ] All data intact after cancel

---

## 4. Match Management

### TC-4.1: Create New Match

**Precondition**: Have data in current match

**Steps**:
1. Note current match number
2. Tap "New Match" button
3. Confirm in dialog

**Expected**:
- Confirmation dialog appears asking "Start a new match?"
- On confirm: Match number increments
- New match with Set 1, Turn 1
- All counts reset to 0
- Previous match preserved in history
- Date recorded for new match

**Verify**:
- [ ] Confirmation dialog appears
- [ ] Header shows "Match N - Set 1"
- [ ] Turn info shows "Turn 1"
- [ ] All counts 0
- [ ] Previous match in History modal

---

### TC-4.2: Match Dating

**Precondition**: Create new match

**Steps**:
1. Create a new match
2. Check History modal

**Expected**:
- New match has today's date (YYYY-MM-DD format)

**Verify**:
- [ ] Date is today's date
- [ ] Format is correct (2026-02-02)

---

## 5. Player Name

### TC-5.1: Enter Player Name

**Precondition**: App loaded

**Steps**:
1. Tap player name input field
2. Type "John Smith"
3. Tap outside to dismiss keyboard

**Expected**:
- Name saved immediately
- No save button needed

**Verify**:
- [ ] Name visible in input
- [ ] Saves on each keystroke

---

### TC-5.2: Player Name Persistence

**Precondition**: Player name entered

**Steps**:
1. Enter player name "Jane Doe"
2. Refresh the page (or close/reopen)

**Expected**:
- Player name "Jane Doe" still present

**Verify**:
- [ ] Name persists across page loads

---

### TC-5.3: Player Name in Export

**Precondition**: Player name set

**Steps**:
1. Set player name to "TestPlayer"
2. Record some serves
3. Export CSV

**Expected**:
- CSV filename includes player name
- CSV data rows include player name
- Format: `serves-TestPlayer-2026-02-02.csv`

**Verify**:
- [ ] Filename correct
- [ ] Player column in CSV has name

---

### TC-5.4: Empty Player Name Handling

**Precondition**: No player name set (or cleared)

**Steps**:
1. Clear player name field
2. Export CSV

**Expected**:
- CSV uses "Unknown" or "player" as fallback
- Export still works

**Verify**:
- [ ] Export succeeds
- [ ] Filename has fallback value

---

## 6. History & CSV Export

### TC-6.1: Open History Modal

**Precondition**: Have recorded data

**Steps**:
1. Tap clipboard icon (top right)

**Expected**:
- Modal opens (full screen overlay)
- Shows all matches in reverse chronological order
- Each match shows date, sets, turns

**Verify**:
- [ ] Modal covers screen
- [ ] Most recent match first
- [ ] All data visible

---

### TC-6.2: History Modal Content

**Precondition**: Have 2 matches, each with 2 sets, each with 3 turns

**Steps**:
1. Open History modal
2. Review content

**Expected**:
- Match cards show match number and date
- Each set has header with set number
- Each turn shows: over, net, foot, success rate
- Set totals shown at bottom of each set
- Color coding: green=over, red=net, orange=foot

**Verify**:
- [ ] Hierarchical structure correct
- [ ] Set totals calculated correctly
- [ ] Color coding present

---

### TC-6.3: Close History Modal

**Precondition**: History modal open

**Steps**:
1. Tap X button (top right of modal)

**Expected**:
- Modal closes
- Returns to main app view
- Main page scrollable again

**Verify**:
- [ ] Modal hidden
- [ ] Main UI functional

---

### TC-6.4: History Modal Scrolling

**Precondition**: Lots of data (5+ matches)

**Steps**:
1. Open History modal
2. Scroll within modal

**Expected**:
- Modal content scrolls
- Can reach all match cards
- Momentum scrolling on iOS

**Verify**:
- [ ] Scroll works
- [ ] All content reachable

---

### TC-6.5: CSV Export - Basic

**Precondition**: Have recorded data

**Steps**:
1. Open History modal
2. Tap "Export to CSV" button

**Expected**:
- CSV file downloads
- Toast shows "CSV downloaded!"
- File named correctly

**Verify**:
- [ ] File downloads
- [ ] Toast appears
- [ ] Filename format: `serves-[player]-[date].csv`

---

### TC-6.6: CSV Export - Content Verification

**Precondition**: Known data set (e.g., 1 match, 1 set, 2 turns)

**Steps**:
1. Create specific test data:
   - Turn 1: 5 over, 2 net, 1 foot
   - Turn 2: 3 over, 1 net, 0 foot
2. Export CSV
3. Open CSV file

**Expected**:
CSV header: `Player,Date,Match,Set,Turn,Over,Net,Foot,Total,Success Rate`
Data rows match recorded data exactly

**Verify**:
- [ ] All columns present
- [ ] Turn 1 row: 5,2,1,8,63%
- [ ] Turn 2 row: 3,1,0,4,75%
- [ ] Match/Set numbers correct

---

### TC-6.7: Export & New Player

**Precondition**: Have data and player name

**Steps**:
1. Scroll to "Start Fresh" section
2. Tap "Export & New Player"
3. Confirm reset after download

**Expected**:
- CSV exports first
- Confirmation dialog appears
- On confirm: All data cleared
- Player name cleared
- Fresh Match 1, Set 1, Turn 1

**Verify**:
- [ ] CSV downloads before reset
- [ ] Reset only after confirmation
- [ ] App in fresh state

---

## 7. PWA Functionality

### TC-7.1: Offline Access

**Precondition**: App has been visited once (service worker installed)

**Steps**:
1. Enable airplane mode / disable network
2. Load or refresh the app

**Expected**:
- App loads from cache
- All features work offline
- Data saves to localStorage

**Verify**:
- [ ] App loads without network
- [ ] Can record serves
- [ ] Data persists

---

### TC-7.2: Service Worker Registration

**Precondition**: Fresh browser (clear site data)

**Steps**:
1. Open DevTools > Application > Service Workers
2. Load app
3. Check service worker status

**Expected**:
- Service worker registered
- Status: activated and running
- Scope: current directory

**Verify**:
- [ ] SW registered
- [ ] No console errors

---

### TC-7.3: Add to Home Screen - iOS

**Precondition**: Safari on iOS

**Steps**:
1. Load app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Launch from home screen

**Expected**:
- App icon appears on home screen
- Launches in standalone mode (no Safari UI)
- All features work

**Verify**:
- [ ] Icon on home screen
- [ ] No browser chrome
- [ ] Full functionality

---

### TC-7.4: Add to Home Screen - Android

**Precondition**: Chrome on Android

**Steps**:
1. Load app in Chrome
2. Tap menu (3 dots) > Add to Home screen
3. Launch from home screen

**Expected**:
- App icon appears
- Launches in standalone mode
- All features work

**Verify**:
- [ ] Icon present
- [ ] Standalone mode
- [ ] Full functionality

---

### TC-7.5: Cache Update

**Precondition**: App installed, new version deployed

**Steps**:
1. Deploy code update (increment sw.js cache version)
2. Refresh app
3. Check for new content

**Expected**:
- Service worker updates silently
- New content loads on next visit
- No user action required

**Verify**:
- [ ] New SW activates
- [ ] Old cache cleared

---

## 8. Data Persistence

### TC-8.1: LocalStorage Save

**Precondition**: Fresh app state

**Steps**:
1. Record serves (5 over, 2 net, 1 foot)
2. Open DevTools > Application > Local Storage
3. Check `volleyball-serve-tracker` key

**Expected**:
- Data stored as JSON
- Contains version, playerName, matches array
- Serve counts match recorded values

**Verify**:
- [ ] Key exists
- [ ] JSON structure correct
- [ ] Values accurate

---

### TC-8.2: Data Version Migration

**Precondition**: Simulated v1 data in localStorage

**Steps**:
1. Manually set v1 format data (flat sets without turns)
2. Load app
3. Check data structure

**Expected**:
- App migrates to v2 format
- Existing data preserved as Turn 1 in each set
- Version number updated to 2

**Verify**:
- [ ] Migration successful
- [ ] Data preserved
- [ ] Version = 2

---

### TC-8.3: Reset All Data

**Precondition**: Have substantial data

**Steps**:
1. Scroll to "Start Fresh" section
2. Tap "Reset All Data"
3. Confirm first dialog
4. Confirm second dialog

**Expected**:
- Two confirmation dialogs (safety measure)
- On final confirm: All data wiped
- Fresh state: Match 1, Set 1, Turn 1, no player name
- Toast shows "All data cleared"
- Scrolls to top

**Verify**:
- [ ] Double confirmation required
- [ ] Complete reset
- [ ] Toast appears

---

### TC-8.4: Reset All Data - Cancel

**Precondition**: Have data

**Steps**:
1. Tap "Reset All Data"
2. Cancel at first or second dialog

**Expected**:
- No changes made
- Data preserved

**Verify**:
- [ ] Data intact

---

### TC-8.5: Data Integrity After Crash/Close

**Precondition**: Record data then force close

**Steps**:
1. Record 10+ serves
2. Force close browser/app
3. Reopen

**Expected**:
- All data restored
- No data loss

**Verify**:
- [ ] Counts match pre-close
- [ ] All turns/sets/matches present

---

## 9. Statistics Display

### TC-9.1: Set Success Rate Calculation

**Precondition**: Fresh set

**Steps**:
1. Record: 7 over, 2 net, 1 foot (10 total)
2. Check footer

**Expected**:
- Set success rate = 70% (7/10)

**Verify**:
- [ ] Rate shows 70%
- [ ] Green bold styling

---

### TC-9.2: Turn Success Rate

**Precondition**: Fresh turn

**Steps**:
1. Record: 3 over, 1 net, 1 foot (5 total)
2. Check footer

**Expected**:
- Turn rate = 60% (3/5)

**Verify**:
- [ ] Turn rate shows 60%

---

### TC-9.3: Zero Division Handling

**Precondition**: Empty turn (0 serves)

**Steps**:
1. Start fresh turn
2. Check rates before recording

**Expected**:
- Rates show 0% (not NaN or error)
- No JavaScript errors

**Verify**:
- [ ] Shows 0%
- [ ] No console errors

---

### TC-9.4: Set Total Count

**Precondition**: Multiple turns with serves

**Steps**:
1. Record 5 serves in turn 1
2. Create turn 2, record 3 serves
3. Check footer

**Expected**:
- Set total shows 8 serves

**Verify**:
- [ ] Total = 8

---

### TC-9.5: Statistics Per Turn vs Per Set

**Precondition**: Multiple turns

**Steps**:
1. Turn 1: 5 over, 0 net, 0 foot (100%)
2. Turn 2: 0 over, 5 net, 0 foot (0%)
3. Check stats

**Expected**:
- Turn rate varies when navigating (100% -> 0%)
- Set rate is aggregate (50%)

**Verify**:
- [ ] Turn rate changes with navigation
- [ ] Set rate stays at 50%

---

## 10. UI & Responsiveness

### TC-10.1: Button Visual Feedback

**Precondition**: App loaded

**Steps**:
1. Tap and hold any serve button

**Expected**:
- Button scales down slightly (0.97)
- Opacity reduces to 0.9
- Immediate visual response

**Verify**:
- [ ] Scale animation visible
- [ ] Feels responsive

---

### TC-10.2: Safe Area Handling (Notch Devices)

**Precondition**: Device with notch or Dynamic Island

**Steps**:
1. Load app (both portrait modes)
2. Check header and footer

**Expected**:
- Content not obscured by notch
- Header has extra padding at top
- Footer has extra padding at bottom
- Works in PWA mode

**Verify**:
- [ ] Header visible below notch
- [ ] Footer above home indicator

---

### TC-10.3: Viewport Height Handling

**Precondition**: Mobile device

**Steps**:
1. Load app with address bar visible
2. Scroll to reveal/hide address bar
3. Check layout stability

**Expected**:
- Layout adjusts smoothly
- No content jumping
- Footer stays visible

**Verify**:
- [ ] Dynamic viewport height works
- [ ] No visual glitches

---

### TC-10.4: Below Fold Scroll

**Precondition**: App loaded on mobile

**Steps**:
1. Swipe up on main content area
2. Below fold section should scroll into view

**Expected**:
- Page scrolls to reveal Turn Navigation, Set Summary, Quick Actions
- Smooth momentum scrolling

**Verify**:
- [ ] All below-fold content accessible
- [ ] Scroll is smooth

---

### TC-10.5: Turns List Scroll Containment

**Precondition**: 10+ turns in current set

**Steps**:
1. Scroll to Current Set Summary
2. Scroll within the turns list

**Expected**:
- Turns list scrolls within its container (200px max)
- Main page doesn't scroll when finger is on list
- Can see all turns

**Verify**:
- [ ] List scrolls independently
- [ ] No scroll chaining

---

### TC-10.6: Responsive Controls Layout

**Precondition**: Various screen widths

**Steps**:
1. View on narrow phone (320px)
2. View on tablet

**Expected**:
- Control buttons wrap to 2 columns on narrow screens
- Buttons remain touch-friendly (14px padding minimum)

**Verify**:
- [ ] Flex-wrap works
- [ ] Touch targets adequate

---

### TC-10.7: No Horizontal Scroll

**Precondition**: Mobile device

**Steps**:
1. Try to scroll horizontally

**Expected**:
- No horizontal scrolling possible
- Content fits within viewport

**Verify**:
- [ ] Horizontal scroll disabled
- [ ] No content overflow

---

### TC-10.8: Toast Notification Display

**Precondition**: App loaded

**Steps**:
1. Trigger a toast (e.g., export CSV)
2. Observe toast behavior

**Expected**:
- Toast appears at bottom center
- Visible for 2 seconds
- Fades out smoothly
- Above safe area on notch devices

**Verify**:
- [ ] Position correct
- [ ] Auto-dismiss after 2s
- [ ] Fade animation

---

## Platform Test Matrix

Run key tests on each platform combination:

| Test | Chrome Desktop | Safari Desktop | Chrome Mobile | Safari Mobile | PWA iOS | PWA Android |
|------|----------------|----------------|---------------|---------------|---------|-------------|
| TC-1.1 Serve Recording | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-2.1 Next Turn | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-3.1 New Set | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-4.1 New Match | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-5.2 Name Persistence | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-6.5 CSV Export | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-7.1 Offline Access | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-8.1 Data Save | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-10.4 Scroll | n/a | n/a | [ ] | [ ] | [ ] | [ ] |
| TC-3.5 Delete Empty Set | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| TC-11.1 Haptic Feedback | n/a | n/a | [ ] | n/a | n/a | [ ] |
| TC-12.1 Data Recovery | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 11. Haptic Feedback & Safety

### TC-11.1: Haptic Vibration on Serve

**Precondition**: Android device or browser with vibration API support

**Steps**:
1. Tap any serve button (OVER, NET, FOOT)

**Expected**:
- Short vibration pulse (50ms) on each tap
- Vibration does not fire on devices that don't support it (no errors)

**Verify**:
- [ ] Vibration felt on supported devices
- [ ] No errors on iOS Safari (which doesn't support vibrate)

---

### TC-11.2: Confirmation Dialog on New Set

**Precondition**: App loaded

**Steps**:
1. Tap "New Set"
2. Cancel the dialog
3. Verify no changes
4. Tap "New Set" again
5. Confirm

**Expected**:
- Dialog appears each time
- Cancel preserves current state
- Confirm creates new set

**Verify**:
- [ ] Dialog text: "Start a new set?"
- [ ] Cancel has no effect
- [ ] Confirm creates set

---

### TC-11.3: Confirmation Dialog on New Match

**Precondition**: App loaded

**Steps**:
1. Tap "New Match"
2. Cancel the dialog

**Expected**:
- Dialog appears with "Start a new match?"
- Cancel preserves current state

**Verify**:
- [ ] Dialog appears
- [ ] Cancel has no effect

---

## 12. Data Recovery & CSV Safety

### TC-12.1: Corrupted localStorage Recovery

**Precondition**: App loaded

**Steps**:
1. Open DevTools console
2. Run: `localStorage.setItem('volleyball-serve-tracker', '{invalid json')`
3. Refresh the page

**Expected**:
- App loads without error
- Starts with fresh data (Match 1, Set 1, Turn 1)
- Console shows: "Failed to load data, starting fresh"

**Verify**:
- [ ] No white screen or crash
- [ ] Fresh state loaded
- [ ] Error logged to console

---

### TC-12.2: CSV Escaping - Commas in Player Name

**Precondition**: App loaded

**Steps**:
1. Set player name to `O'Brien, Jr.`
2. Record some serves
3. Export CSV
4. Open in text editor

**Expected**:
- Player name field wrapped in quotes: `"O'Brien, Jr."`
- CSV structure intact (correct number of columns per row)
- File opens correctly in Excel/Google Sheets

**Verify**:
- [ ] Name quoted in CSV
- [ ] All rows have correct column count

---

### TC-12.3: CSV Escaping - Quotes in Player Name

**Steps**:
1. Set player name to `She said "hi"`
2. Export CSV

**Expected**:
- Quotes escaped: `"She said ""hi"""`

**Verify**:
- [ ] Double-quotes properly escaped

---

### TC-12.4: CSV Filename Sanitization

**Steps**:
1. Set player name to `Test/Player <script>`
2. Export CSV

**Expected**:
- Filename uses sanitized name (special chars replaced with `_`)
- Download completes without error

**Verify**:
- [ ] Filename like `serves-Test_Player__script_-2026-02-27.csv`

---

### TC-12.5: Noscript Fallback

**Precondition**: Browser with JavaScript disabled

**Steps**:
1. Disable JavaScript in browser settings
2. Load the app

**Expected**:
- Red banner displayed: "JavaScript Required"
- Message instructs user to enable JavaScript

**Verify**:
- [ ] Message visible
- [ ] No blank page

---

### TC-12.6: Version Display

**Steps**:
1. Scroll to below-fold area (past Quick Actions to "Start Fresh")

**Expected**:
- "Serve Tracker v2.1.0" text visible at the bottom

**Verify**:
- [ ] Version text present
- [ ] Color is subtle (#444)

---

## Edge Cases & Boundary Conditions

### EC-1: Maximum Data Volume

**Steps**:
1. Create 100 matches with 5 sets each, 10 turns each
2. Test app performance

**Expected**:
- App remains responsive
- History modal loads (may be slow)
- CSV export works

---

### EC-2: Very Long Player Name

**Steps**:
1. Enter 100+ character player name
2. Check UI and export

**Expected**:
- Name truncates visually in header
- Full name in localStorage
- CSV filename handles long name

---

### EC-3: Special Characters in Player Name

**Steps**:
1. Enter name: `O'Brien, "Test" <script>`
2. Check display and export

**Expected**:
- Name displays safely (no XSS)
- CSV properly escapes characters

---

### EC-4: Rapid Action Spam

**Steps**:
1. Rapidly tap: OVER, OVER, Undo, NET, Next Turn, Undo
2. Verify final state

**Expected**:
- Each action processes in order
- Final state consistent

---

### EC-5: Back/Forward Browser Navigation

**Steps**:
1. Use browser back/forward buttons
2. Check app state

**Expected**:
- App is SPA; back may leave page
- State preserved in localStorage on return

---

## Test Results Log

| Date | Tester | Platform | Version | Pass/Fail | Notes |
|------|--------|----------|---------|-----------|-------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Related Documents

- [TEST_PLAN_SCROLL.md](./TEST_PLAN_SCROLL.md) - Mobile scroll-specific regression tests (10 detailed cases)

---

## Version History

| Date | Change |
|------|--------|
| 2026-02-02 | Initial comprehensive test plan - all features covered |
| 2026-02-27 | v2.1.0: Updated TC-1.5, TC-2.6, TC-3.1, TC-4.1; added TC-2.10, TC-3.4-3.7, TC-11.1-11.3, TC-12.1-12.6; updated regression checklist and platform matrix |
| 2026-02-27 | v2.2.0: Automated test suite (100 tests) added; verified all test cases pass; fixed 4 defects found during testing |
