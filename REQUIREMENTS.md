# VB Serve Tracker - Requirements

This document serves as the source of truth for app functionality. Update this document whenever features are added or modified.

## Functional Requirements

### FR-001: Serve Counting
**Description:** Track three types of serves: OVER (successful), NET (hit net), FOOT (foot fault).

**Acceptance Criteria:**
- [ ] Large, touch-friendly buttons for each serve type
- [ ] Visual distinction between serve types (green=OVER, red=NET, yellow=FOOT)
- [ ] Display count for current turn prominently
- [ ] Display cumulative set totals
- [ ] Haptic feedback (vibration) on serve recording for tactile confirmation
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
- [ ] Undo last action (serve recording or new turn creation)
- [ ] Delete empty turns

**Status:** Implemented

---

### FR-003: Set Management
**Description:** Group turns into sets. Support starting new sets and clearing set data.

**Acceptance Criteria:**
- [ ] "New Set" button creates a fresh set (with confirmation dialog)
- [ ] Set summary displays all turns with their stats
- [ ] "Clear Set Data" removes all turns in current set (with confirmation)
- [ ] Set success rate calculated and displayed
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
- [ ] CSV includes: Player, Date, Match, Set, Turn, Over, Net, Foot, Total, Success Rate
- [ ] CSV fields properly escaped (commas, quotes, newlines) to prevent injection
- [ ] CSV filename sanitized to remove special characters
- [ ] "Export & New Player" exports data then resets for new player

**Status:** Implemented

---

### FR-007: Statistics
**Description:** Calculate and display success rates at turn and set levels.

**Acceptance Criteria:**
- [ ] Turn success rate: (over / total) * 100 for current turn
- [ ] Set success rate: (over / total) * 100 for all serves in set
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
- [ ] Safe area insets respected (notch handling)
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
- [ ] Haptic feedback (vibration) on serve recording
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
- [ ] Success indicators in green (#2ecc71)

**Status:** Implemented

---

## Data Model

### Version 2 Schema

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

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-02 | Initial requirements document | vbtracker/polecats/obsidian |
| 2026-02-27 | v2.1.0: Added empty set removal, old-turn safety, haptic feedback, confirmations, CSV escaping, error recovery, network-first SW, proper icons | claude |
