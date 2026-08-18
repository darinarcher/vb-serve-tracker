# VB Serve Tracker - Mobile Scroll Test Plan

**Purpose**: Regression testing for page scrolling on mobile devices
**Last Updated**: 2026-08-17
**Primary Platforms**: iPhone Safari and iPhone PWA
**Compatibility Platforms**: Android Chrome and Android PWA (manual, non-blocking)

---

## Quick Regression Checklist

Run `npm run check` after every code change. Before release, run this physical-gesture checklist on iPhone Safari and iPhone PWA. Android is an optional compatibility pass:

| # | Test | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 1 | Load page, swipe up on main content | Page scrolls to reveal "below fold" section | [ ] | [ ] |
| 2 | Swipe down from below fold | Page scrolls back up | [ ] | [ ] |
| 3 | Open History modal (clipboard icon), swipe up | Modal content scrolls | [ ] | [ ] |
| 4 | Tap each serve button, then scroll | Scroll still works after button taps | [ ] | [ ] |
| 5 | Enter player name, dismiss keyboard, scroll | Scroll works after keyboard dismissal | [ ] | [ ] |
| 6 | Add to Home Screen, launch as PWA, scroll | Scroll works in standalone mode | [ ] | [ ] |

---

## Platform-Specific Setup

### iOS Safari
- Test in Safari browser
- Test as PWA (Add to Home Screen via Share menu)
- Use Safari Web Inspector (Mac) for debugging

### Android Chrome
- Test in Chrome browser
- Test as PWA (Add to Home Screen via menu)
- Use Chrome DevTools remote debugging (chrome://inspect)

---

## Detailed Test Cases

### TC-01: Main Page Vertical Scroll

**Precondition**: Page loaded in mobile browser

**Steps**:
1. Place finger on the main content area (anywhere on colored buttons)
2. Swipe upward with normal gesture speed
3. Observe if page moves

**Expected**:
- Page scrolls smoothly upward
- "Below Fold" section (Turn Navigation, Current Set Summary) becomes visible
- No rubber-band/bounce-back to original position

**Platform notes**:
- iOS: Check `-webkit-overflow-scrolling: touch` for momentum
- Android: Check `overscroll-behavior` if bounce is unwanted

**If failing, check**:
- `html, body` must have `overflow: auto` (not `hidden`)
- No JavaScript calling `e.preventDefault()` on touch events

---

### TC-02: Scroll After Button Interaction

**Precondition**: Page loaded

**Steps**:
1. Tap each serve button: OVER/IN, OVER/OUT, NET, and FOOT
2. Immediately try to scroll the page upward
3. Repeat after each serve type

**Expected**:
- Buttons register taps normally
- Scrolling works immediately after button tap
- No "stuck" state where scroll is disabled

**Platform notes**:
- iOS: 300ms tap delay removed by `touch-action: manipulation`
- Android: Similar, but Chrome handles it natively

**If failing, check**:
- Button touch handlers shouldn't call `preventDefault()` on touchmove
- Check for any global touch event listeners

---

### TC-03: Scroll After Keyboard Dismissal

**Precondition**: Page loaded

**Steps**:
1. Tap the "Player:" input field (keyboard appears)
2. Type any text
3. Dismiss keyboard (tap outside / Done button / back gesture)
4. Attempt to scroll the page

**Expected**:
- Keyboard dismisses cleanly
- Page scroll works immediately
- No visual viewport offset issues

**Platform notes**:
- iOS: `viewport-fit=cover` + `env(safe-area-inset-*)` critical
- Android: `interactive-widget=resizes-content` may help (newer Chrome)

**If failing, check**:
- viewport meta tag settings
- iOS: `min-height: -webkit-fill-available` handling
- Android: Check if `100vh` is causing issues (use `dvh` for dynamic viewport)

---

### TC-04: History Modal Scroll

**Precondition**: Have at least 3+ turns of data recorded

**Steps**:
1. Tap the clipboard icon (top right)
2. History modal opens
3. Swipe up inside the modal content area

**Expected**:
- Modal content scrolls independently
- Match history cards scroll into view
- Closing modal returns to main page (scrollable)

**Platform notes**:
- iOS: Needs `-webkit-overflow-scrolling: touch` on modal
- Android: Standard `overflow-y: auto` sufficient

**If failing, check**:
- Modal shouldn't have `touch-action: none`
- Check z-index and pointer-events

---

### TC-05: Turns List Scroll (Below Fold)

**Precondition**: Create 5+ turns in current set

**Steps**:
1. Scroll down to "Current Set Summary" section
2. Swipe inside the turns list area

**Expected**:
- Turns list scrolls within its container (max-height: 200px)
- Can see all turns by scrolling
- Main page doesn't scroll when swiping inside list (scroll chaining)

**Platform notes**:
- Both: May need `overscroll-behavior: contain` to prevent scroll chaining

---

### TC-06: PWA Standalone Mode

**iOS Steps**:
1. In Safari, tap Share > Add to Home Screen
2. Launch app from Home Screen icon

**Android Steps**:
1. In Chrome, tap menu (3 dots) > Add to Home screen (or install prompt)
2. Launch app from Home Screen icon

**Test**:
- Attempt all scroll tests above in standalone mode

**Expected**:
- All scrolling behaviors work identically to browser
- Safe area insets don't block content (iOS notch/Dynamic Island)
- Navigation bar area handled correctly (Android gesture nav)

**If failing, check**:
- iOS: `viewport-fit=cover` and `env(safe-area-inset-*)`
- Android: `display: standalone` in manifest, theme-color

---

### TC-07: Orientation Change

**Steps**:
1. Load page in portrait, scroll down
2. Rotate to landscape
3. Attempt to scroll
4. Rotate back to portrait
5. Attempt to scroll

**Expected**:
- Scroll works in both orientations
- Content reflows correctly
- No scroll position reset bugs

**Platform notes**:
- iOS: May trigger viewport resize events
- Android: Chrome handles this well, but check older devices

---

### TC-08: Overscroll / Rubber-band

**Steps**:
1. Pull down hard from top of page (overscroll)
2. Release and immediately try to scroll normally
3. Scroll to bottom, overscroll past bottom
4. Release and try to scroll up

**Expected**:
- Native overscroll behavior works (bounce on iOS, glow on Android)
- No "stuck" scroll after overscroll
- Momentum scrolling functions normally

**Platform notes**:
- iOS: Rubber-band is native, don't fight it
- Android: Pull-to-refresh may interfere (check if unintended)

---

### TC-09: Fast Fling Scroll (Android specific)

**Steps**:
1. Perform a fast fling gesture upward
2. Let momentum carry the scroll
3. Tap to stop mid-scroll
4. Continue scrolling manually

**Expected**:
- Fling scrolls smoothly with momentum
- Tap stops scroll cleanly
- Can resume scrolling immediately

---

### TC-10: Edge Swipe Conflict (Android gesture nav)

**Precondition**: Android device with gesture navigation enabled

**Steps**:
1. Start scroll gesture from near left edge of screen
2. Start scroll gesture from near right edge of screen

**Expected**:
- Scroll works, doesn't trigger back gesture
- If back gesture triggers, it's expected Android behavior near edges

---

## Automation Coverage Map

The `iphone-safari` Playwright project uses WebKit with an iPhone 13 profile. Programmatic scroll and viewport assertions are deterministic regression coverage; they do not simulate the physics of a finger, the iOS keyboard, safe areas, or installed-PWA chrome.

| Case | Automated coverage | Actual-device coverage |
|------|--------------------|------------------------|
| TC-01 | `mobile-scroll.spec.js`: page has vertical range and reaches below-fold content | Verify normal finger swipe and momentum |
| TC-02 | `mobile-scroll.spec.js`: all serve interactions leave page scrolling usable | Verify immediate swipe after physical taps |
| TC-03 | `mobile-scroll.spec.js`: input focus/blur leaves scrolling usable | Verify iOS keyboard appearance/dismissal and viewport offset |
| TC-04 | `mobile-scroll.spec.js`: populated modal has and uses independent scroll range | Verify finger momentum and return to main page |
| TC-05 | `mobile-scroll.spec.js`: long turn list has and uses its own scroll range | Verify scroll chaining by touch |
| TC-06 | Offline shell is automated in `pwa-offline.spec.js` on Chromium | Required on installed iPhone PWA: all scroll cases plus safe areas |
| TC-07 | `mobile-scroll.spec.js`: landscape-sized WebKit viewport reflows with no horizontal overflow | Required physical portrait→landscape→portrait rotation |
| TC-08 | Not meaningfully emulated | Required iOS top/bottom rubber-band and momentum recovery |
| TC-09 | Not automated; Android-only | Optional Android compatibility check |
| TC-10 | Main/history horizontal overflow is covered under TC-10.7 in `mobile-scroll.spec.js`; edge navigation is not emulated | Optional Android gesture-navigation check |

The two iPhone visual baselines in `visual-regression.spec.js` protect the primary tracking screen and populated history modal at 375×667. Update them only with `npm run test:visual:update` after inspecting the intended UI change.

Physical UAT on iOS 26.6 passed rotation and safe-area checks for v3.0.0, with an accepted limitation: the landscape Dynamic Island makes left-side content challenging to see. Horizontal safe-area refinement is tracked in RD-008.

## Known Scroll Killers by Platform

### Both Platforms
| Pattern | Why it breaks | Status |
|---------|---------------|--------|
| `overflow: hidden` on body | Disables scroll | `overflow: auto` |
| `position: fixed` on body | Same effect | Not present |
| `touch-action: none` | Blocks gestures | Not present |
| `e.preventDefault()` in touchmove | JS blocks scroll | Verify handlers |
| `height: 100vh` issues | Viewport != visible | Uses fallbacks |

### iOS Specific
| Pattern | Why it breaks | Status |
|---------|---------------|--------|
| Missing `-webkit-overflow-scrolling: touch` | No momentum | Present |
| Bad `100vh` without `-webkit-fill-available` | Address bar overlap | Has fallback |
| Passive event listeners missing | May block scroll | Check JS |

### Android Specific
| Pattern | Why it breaks | Status |
|---------|---------------|--------|
| Missing `touch-action: manipulation` | 300ms delay | Could add |
| `overscroll-behavior` conflicts | Pull-to-refresh issues | Not set |
| Old `<meta viewport>` patterns | Zoom/scale issues | Modern setup |

---

## CSS Scroll Properties Reference

Current settings affecting scroll (index.html):

```css
/* Line 19-23: Main scroll enablers */
html, body {
    height: 100%;
    overflow: auto;                      /* CRITICAL: both platforms */
    -webkit-overflow-scrolling: touch;   /* iOS momentum scroll */
}

/* Line 29-30: iOS height handling */
body {
    min-height: 100%;
    min-height: -webkit-fill-available;  /* iOS viewport fix */
    /* Consider adding: min-height: 100dvh; for modern browsers */
}

/* Line 221-223: Modal scroll */
.modal {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

/* Line 421-423: Turns list scroll */
.turns-list {
    max-height: 200px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
```

**Potential improvements for Android**:
```css
/* Add to * selector if tap delay is an issue */
* {
    touch-action: manipulation;  /* Removes 300ms tap delay */
}

/* Add to scrollable containers if scroll chaining is problematic */
.turns-list, .modal {
    overscroll-behavior: contain;
}
```

---

## Debugging Tools

### iOS (Safari Web Inspector)
1. Connect iPhone via USB to Mac
2. On iPhone: Settings > Safari > Advanced > Web Inspector ON
3. On Mac: Safari > Develop > [device name] > [page]
4. Inspect computed styles on `html` and `body`

### Android (Chrome DevTools)
1. Connect Android via USB
2. On Android: Settings > Developer options > USB debugging ON
3. On computer: Chrome > `chrome://inspect` > select device
4. Full DevTools access to inspect styles/JS

### Quick CSS Override Test
Add temporarily to isolate CSS issues:
```css
html, body {
    overflow: auto !important;
    height: auto !important;
    position: static !important;
}
```

### JS Event Debugging
```javascript
// Check if touch events are being prevented
document.addEventListener('touchmove', e => {
    console.log('touchmove prevented:', e.defaultPrevented);
}, { passive: true });

// Check for scroll event firing
document.addEventListener('scroll', () => console.log('scroll event'));
```

---

## Test Results Log

| Date | Tester | Platform | OS Ver | TC01 | TC02 | TC03 | TC04 | TC05 | TC06 | TC07 | TC08 | TC09 | TC10 | Notes |
|------|--------|----------|--------|------|------|------|------|------|------|------|------|------|------|-------|
| | | iPhone Safari | | | | | | | | | | n/a | n/a | |
| | | iPhone PWA | | | | | | | | | | n/a | n/a | |
| | | Android Chrome | | | | | | | | | | | | |
| | | Android PWA | | | | | | | | | | | | |

---

## Version History

| Date | Change |
|------|--------|
| 2026-02-02 | Initial test plan - iOS Safari + Android Chrome coverage |
| 2026-08-17 | Added iPhone-Safari/WebKit automation map, visual baselines, and explicit actual-device gesture boundary |
