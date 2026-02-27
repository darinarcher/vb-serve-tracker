# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.2.0] - 2026-02-27

### Added
- Automated test suite (100 tests) covering all app logic: serves, turns, sets, matches, CSV, statistics, data recovery, edge cases
- `Number.isFinite()` guard in `goToTurn()` to prevent NaN index crash from DOM tampering

### Fixed
- `createFreshData()` now uses `Date.now()` for match IDs (was hardcoded `1`, inconsistent with `newMatch()`)
- Service worker fetch handler now filters to GET requests only (`cache.put` throws TypeError on non-GET)
- Service worker `cache.put` promise rejection now caught (quota exceeded, etc.)

### Changed
- Service worker cache bumped to v8
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
