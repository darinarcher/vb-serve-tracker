# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [3.0.0] - Unreleased

### Added
- RD-002: Split OVER into **OVER/IN** (in bounds, includes aces and legal net-touch serves) and **OVER/OUT** (cleared net but out long/wide)
- 2×2 serve button layout: OVER/IN | OVER/OUT on top row, NET | FOOT on bottom row
- Data model v3 with `overIn` and `overOut` fields; v2 `over` counts migrate to `overIn`
- CSV columns: OverIn, OverOut, Net, Foot, Total (sum verification), In-Play Rate
- Playwright UAT suite (`npm run test:uat`) for RD-002 acceptance
- Unit tests for overOut recording, v2→v3 migration, and CSV total verification
- Reproducible Playwright tooling with a committed dependency lockfile
- Automated offline PWA shell regression coverage
- ESLint flat configuration covering the inline app script, service worker, test harness, and Playwright tests
- Table-driven unit coverage for totals, rate rounding, aggregation, and unknown serve-type protection
- GitHub Actions quality gate for lint, unit tests, and Playwright UAT
- Legacy workflow coverage for turns, sets, matches, names, history, reset, recovery, persistence, and mobile scrolling
- Primary iPhone-Safari/WebKit project and two reviewed visual regression baselines
- Test-plan traceability maps separating deterministic CI coverage from actual-iPhone checks
- Unit coverage for unnamed-player CSV fallback and the noscript recovery message
- Physical iPhone Safari and installed-PWA UAT evidence for tracking, history, CSV, rotation, persistence, offline use, and recovery
- Unsupported-vibration fallback coverage for iPhone Safari/WebKit

### Changed
- In-play rate (OVER/IN ÷ total serves) replaces legacy over/total success rate
- History and set summary show IN/OUT/NET/FOOT breakdown per turn
- v1/v2 migrations are persisted to localStorage immediately
- Unknown serve types are ignored instead of corrupting turn data and undo history
- Service worker cache bumped to v10
- Version display updated to v3.0.0
- iPhone Safari is documented as the sole primary client; Android remains an optional compatibility pass
- Real-iPhone UAT is risk-based; deterministic workflow, history, CSV, math, and migration regressions remain owned by automation
- Haptic feedback is documented as best-effort on supporting browsers because iPhone Safari/WebKit has no web vibration API

## [2.2.0] - 2026-02-27

### Added
- Automated test suite (100 tests) covering all app logic: serves, turns, sets, matches, CSV, statistics, data recovery, edge cases
- `Number.isFinite()` guard in `goToTurn()` to prevent NaN index crash from DOM tampering

### Fixed
- `createFreshData()` now uses `Date.now()` for match IDs (was hardcoded `1`, inconsistent with `newMatch()`)
- Service worker fetch handler now filters to GET requests only (`cache.put` throws TypeError on non-GET)
- Service worker `cache.put` promise rejection now caught (quota exceeded, etc.)
- Undo now supports multi-level: replaced single `lastAction` variable with `undoStack` array (was only undoing once)
- Version text color changed from `#444` to `#888` for visibility on dark background

### Changed
- Service worker cache bumped to v9
- Version display updated to v2.2.0

## [2.1.0] - 2026-02-27

### Added
- "Delete Empty Set" button for when a player doesn't serve in a set
- Auto-cleanup: creating a new set replaces the current one if it was entirely empty
- Orange "Viewing Turn N" banner with "Return to Latest" button when navigating to old turns
- Serve buttons disabled when viewing old turns to prevent accidental edits
- Haptic feedback (50ms vibration) on serve recording for courtside tactile confirmation
- Confirmation dialogs before New Set and New Match to prevent accidental taps
- `<noscript>` fallback message when JavaScript is disabled
- Version display (v2.1.0) in below-fold area
- Proper standalone SVG app icon replacing inline emoji-based icon
- `isSetEmpty()` and `isTurnEmpty()` helper functions

### Fixed
- Service worker now uses network-first strategy so users receive app updates (was cache-first, silently serving stale content)
- `loadData()` wrapped in try/catch so corrupted localStorage gracefully resets instead of crashing the app
- CSV export properly escapes fields containing commas, quotes, and newlines (prevents injection)
- CSV filename sanitized to remove special characters from player name
- Download element cleanup delayed to avoid race condition on mobile Safari
- Match IDs now use `Date.now()` instead of `length + 1` to prevent collisions on deletion
- Netlify config replaced hardcoded `/Users/darinarcher/...` path with relative `"."`

### Changed
- Service worker cache bumped to v7
- Manifest icons now reference external `icons/icon.svg` file instead of inline data URI

## [1.0.0] - 2026-02-02

### Added
- Initial release of VB Serve Tracker
- Serve counting with OVER, NET, and FOOT fault buttons
- Turn-based tracking with navigation between turns
- Set and match management
- Player name persistence across sessions
- Match history modal with game data
- CSV export functionality for match data
- PWA support for offline functionality and installability
- Mobile scroll fix for iOS Safari
