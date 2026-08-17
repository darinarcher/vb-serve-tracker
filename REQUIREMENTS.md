# VB Serve Tracker - Requirements

This document serves as the source of truth for app functionality. Update this document whenever features are added or modified.

## Functional Requirements

### FR-001: Serve Counting
**Description:** Track four serve outcomes: OVER/IN (clears the net and lands in bounds, including aces and legal net-touch serves), OVER/OUT (clears the net but lands out long/wide), NET (fails to clear the net), and FOOT (foot fault).

**Acceptance Criteria:**
- [ ] Large, touch-friendly buttons for each serve type in a 2×2 layout
- [ ] Visual distinction between serve types (green=OVER/IN and OVER/OUT, red=NET, yellow=FOOT)
- [ ] Display count for current turn prominently
- [ ] Display cumulative set totals
- [ ] Best-effort vibration on browsers that implement the Vibration API; unavailable on iPhone Safari/WebKit
- [ ] Serve buttons disabled when viewing an old turn to prevent accidental edits

**Status:** Implemented

---

### FR-002: Turn Management
**Description:** Group serves into turns. Support navigation between turns and undo capability.

**Acceptance Criteria:**
- [ ] "Next Turn" button creates a new turn
- [ ] Turn navigation (prev/next) allows reviewing past turns
- [ ] Visual indicator when viewing an older turn vs. current turn
- [ ] Orange "Viewing Turn N" banner with "Return to Latest" button when viewing old turns
- [ ] Multi-level undo: reverse multiple actions (serve recordings and turn creations) via undo stack
- [ ] Undo stack cleared on structural operations (New Set, New Match, Reset)
- [ ] Delete empty turns

**Status:** Implemented

---

### FR-003: Set Management
**Description:** Group turns into sets. Support starting new sets and clearing set data.

**Acceptance Criteria:**
- [ ] "New Set" button creates a fresh set (with confirmation dialog)
- [ ] Set summary displays all turns with their stats
- [ ] "Clear Set Data" removes all turns in current set (with confirmation)
- [ ] Set in-play rate calculated and displayed
- [ ] "Delete Empty Set" removes current set if no serves were recorded (e.g., player didn't serve)
- [ ] Auto-cleanup: creating a new set replaces the current set if it was entirely empty

**Status:** Implemented

---

### FR-004: Match Management
**Description:** Group sets into matches. Support starting new matches.

**Acceptance Criteria:**
- [ ] "New Match" button creates a fresh match (with confirmation dialog)
- [ ] Match identified by unique ID (timestamp-based) and date
- [ ] Current match and set numbers displayed in header

**Status:** Implemented

---

### FR-005: Player Identity
**Description:** Input and persist player name for data attribution.

**Acceptance Criteria:**
- [ ] Text input field for player name
- [ ] Name persists across sessions
- [ ] Name included in exported data

**Status:** Implemented

---

### FR-006: History & Export
**Description:** View match history and export data to CSV format.

**Acceptance Criteria:**
- [ ] History modal shows all matches, sets, and turns
- [ ] Matches displayed in reverse chronological order
- [ ] Export button generates CSV with all data
- [ ] CSV includes: Player, Date, Match, Set, Turn, OverIn, OverOut, Net, Foot, Total, In-Play Rate
- [ ] CSV fields properly escaped (commas, quotes, newlines) to prevent injection
- [ ] CSV filename sanitized to remove special characters
- [ ] "Export & New Player" exports data then resets for new player

**Status:** Implemented

---

### FR-007: Statistics
**Description:** Calculate and display neutral in-play rates at turn and set levels. Match outcomes and rule-defined success remain governed by USA Volleyball and OVR rules, not this app.

**Acceptance Criteria:**
- [ ] Turn in-play rate: (overIn / total) * 100 for current turn
- [ ] Set in-play rate: (overIn / total) * 100 for all serves in set
- [ ] Stats displayed in footer and set summary
- [ ] Per-turn stats shown in turn navigation list

**Status:** Implemented

---

### FR-008: Data Persistence
**Description:** All data survives browser refresh using localStorage.

**Acceptance Criteria:**
- [ ] Data stored in localStorage under 'volleyball-serve-tracker' key
- [ ] Data versioning for migration support
- [ ] Data loaded automatically on page load with error recovery (corrupted data falls back to fresh state)
- [ ] Changes saved immediately after each action
- [ ] "Reset All Data" clears all stored data (with double confirmation)

**Status:** Implemented

---

### FR-009: PWA
**Description:** Installable Progressive Web App that works offline.

**Acceptance Criteria:**
- [ ] Valid web app manifest
- [ ] Service worker registered for offline support with network-first caching strategy
- [ ] Standalone display mode when installed
- [ ] App icon defined as standalone SVG file (icons/icon.svg) with consistent cross-platform rendering
- [ ] Version number displayed in the UI (below-fold area)
- [ ] `<noscript>` fallback message when JavaScript is disabled

**Status:** Implemented

---

### FR-010: Cross-Platform
**Description:** Works on iOS Safari, Android Chrome, and desktop browsers.

**Acceptance Criteria:**
- [ ] iOS Safari: apple-mobile-web-app-capable meta tag
- [ ] iOS Safari: black-translucent status bar style
- [ ] Portrait safe-area insets respected; landscape Dynamic Island refinement remains in RD-008
- [ ] Touch-friendly interactions (no tap highlight)
- [ ] Works with webkit-specific scrolling

**Status:** Implemented

---

## Non-Functional Requirements

### NFR-001: Mobile-First Responsive Design
**Description:** UI designed primarily for mobile devices, scaling up to desktop.

**Acceptance Criteria:**
- [ ] Flexible button sizing using flexbox
- [ ] Content fills available viewport height (100dvh with fallbacks)
- [ ] Portrait orientation preferred
- [ ] Below-fold content for secondary actions

**Status:** Implemented

---

### NFR-002: Touch-Friendly Large Buttons
**Description:** All interactive elements sized for comfortable touch interaction.

**Acceptance Criteria:**
- [ ] Main serve buttons are large and prominent
- [ ] Minimum touch target size of 44x44px for navigation buttons
- [ ] Adequate spacing between buttons to prevent misclicks
- [ ] Visual feedback on button press (scale/opacity transitions)
- [ ] Best-effort vibration on supported browsers; primary iPhone Safari has no web vibration API
- [ ] Confirmation dialogs on irreversible actions (New Set, New Match)

**Status:** Implemented

---

### NFR-003: Fast Load Time
**Description:** Application loads in under 2 seconds.

**Acceptance Criteria:**
- [ ] Single HTML file with embedded CSS/JS (no external dependencies)
- [ ] No network requests required for core functionality
- [ ] Service worker caches all assets
- [ ] Minimal total payload size

**Status:** Implemented

---

### NFR-004: Accessible Color Contrast
**Description:** Text and interactive elements meet accessibility contrast requirements.

**Acceptance Criteria:**
- [ ] Light text (#eee, #fff) on dark backgrounds (#1a1a2e, #16213e)
- [ ] Distinct colors for serve types (green, red, yellow on dark)
- [ ] Muted colors (#aaa, #666) for secondary text
- [ ] In-play indicators in green (#2ecc71)

**Status:** Implemented

---

## Roadmap

### RD-001: Multiple Player Tracking
**Description:** Track serve stats for 6+ players in rotation. A player selector or multi-player mode would significantly increase coaching utility.

**Status:** Roadmap

---

### RD-002: Serve Type Expansion
**Description:** Add categories beyond OVER/NET/FOOT — e.g., ace, out (long/wide), let — for competitive team analysis. Minimal addition would be to split "Over" green button to two green buttons with OVER/IN and OVER/OUT. Other ideas need a mockup as the buttons are intended to be 'fat finger' compliant.

**Status:** Implemented (v3.0.0 — OVER/IN + OVER/OUT split; aces and legal net-touch serves recorded as OVER/IN)

---

### RD-003: Data Visualization
**Description:** Simple bar charts or trend lines showing in-play rate over turns/sets/matches. Achievable with pure CSS or canvas — no library needed. Also need to add stats that show current percentage for whole of tournament (multiple matches within a day or two) and/or current match.

**Status:** Roadmap

---

### RD-004: Cloud Sync / Sharing
**Description:** localStorage is device-locked. Options range from JSON import/export (simple) to Firebase sync (medium) to URL-encoded sharing (for small datasets). Netlify options preferred if low to zero cost.

**Status:** Roadmap

---

### RD-005: Deeper Undo Stack Limit
**Description:** Currently the undo stack is unbounded within a set. Consider a configurable depth limit (e.g., 50) to bound memory usage for very long sets. Consider with "Edit" mode for data from prior sets and matches that were entered incorrectly.

**Status:** Roadmap

---

### RD-006: Notes per Turn/Set
**Description:** Annotations like "serving from zone 1" or "switched to float serve" add context when reviewing history later.

**Status:** Roadmap

---

### RD-007: Time-Based Analytics
**Description:** Timestamps on serves/turns would enable insights like "performance drops after turn 5."

**Status:** Roadmap

---

### RD-008: Landscape / Tablet Support
**Description:** Add media queries for wider viewports. A max-width container or responsive column layout would improve the tablet experience. Physical iPhone UAT on iOS 26.6 found that the landscape Dynamic Island makes left-side content challenging to see; add horizontal safe-area insets and validate both landscape orientations.

**Status:** Roadmap

---

### RD-009: Swipe Gesture Navigation
**Description:** Touch-based left/right swipe between turns would feel natural and be faster than the below-fold navigation buttons.

**Status:** Roadmap

---

### RD-010: Empty Turns Removed Automatically
**Description:** New Set and New Match carry forward the place-holder starting point for a turn that might not have happened. For example, server serves and it's out. Next team serves and back and forth, but server being tracked doesn't serve again.

**Status:** Roadmap

---

### RD-011: Dependable iPhone Haptic Feedback
**Description:** Courtside users want tactile confirmation for every serve tap, but iPhone Safari/WebKit does not expose the Vibration API. Revisit when WebKit adds an official capability, or evaluate a native wrapper with a supported haptics API. Do not depend on private or accessibility-control hacks for a scoring workflow.

**Status:** Roadmap — blocked for a pure iPhone Safari PWA pending an official web API; native packaging would be a separate product decision

---

### RD-012: App Icon and Favicon Redesign
**Description:** Redesign the installed-PWA icon and browser favicon for clearer identification on the iPhone Home Screen while retaining maskable and cross-platform variants.

**Status:** Roadmap

---


## Data Model

### Version 3 Schema

```javascript
{
  version: 3,
  playerName: string,
  matches: [
    {
      id: number (timestamp via Date.now()),
      date: string (ISO date),
      sets: [
        {
          turns: [
            { overIn: number, overOut: number, net: number, foot: number }
          ]
        }
      ]
    }
  ]
}
```

### Version 2 Schema (legacy)

```javascript
{
  version: 2,
  playerName: string,
  matches: [
    {
      id: number (timestamp via Date.now()),
      date: string (ISO date),
      sets: [
        {
          turns: [
            { over: number, net: number, foot: number }
          ]
        }
      ]
    }
  ]
}
```

### Migration Notes
- Version 1 used flat sets without turns
- Migration from v1 wraps existing set data in a single turn
- Migration from v2 maps `over` → `overIn`, sets `overOut` to 0
- Successful migrations are written back to localStorage immediately

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-02 | Initial requirements document | vbtracker/polecats/obsidian |
| 2026-02-27 | v2.1.0: Added empty set removal, old-turn safety, haptic feedback, confirmations, CSV escaping, error recovery, network-first SW, proper icons | claude |
| 2026-02-27 | v2.2.0: Multi-level undo stack, version text visibility fix, test suite (112 tests), 4 defect fixes | claude |
| 2026-04-08 | Added Roadmap section with future feature ideas; updated FR-002 for multi-undo | claude |
| 2026-08-04 | Added Roadmap item | Darin (User) |
| 2026-08-17 | v3.0.0: RD-002 serve type expansion (OVER/IN, OVER/OUT), data model v3, Playwright UAT | Cursor/Codex |
