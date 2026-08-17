# VB Serve Tracker - Claude Code Notes

## Project Overview
Single-page PWA for tracking volleyball serve statistics. All app logic lives in `index.html` (inline `<script>` tag). No build step, no framework.

## Key Files
- `index.html` — Full app (HTML + CSS + JS, all inline)
- `sw.js` — Service worker for PWA caching (bump cache version on every deploy)
- `manifest.json` — PWA manifest
- `test.js` — 148 automated unit assertions (Node.js)
- `e2e/` — Playwright acceptance tests for mobile UI and browser behavior
- `eslint.config.js` — ESLint flat configuration for app, unit, service-worker, and Playwright code
- `.github/workflows/ci.yml` — PR and main-branch quality gate
- `icons/icon.svg` — App icon (volleyball-themed SVG)

## Documentation
- `REQUIREMENTS.md` — Source of truth for features (Implemented + Roadmap). Update when features change.
- `CHANGELOG.md` — Keep-a-Changelog format. Add entries for every release.
- `TEST_PLAN.md` — Manual test cases and regression checklist. Update when behavior changes.
- `REVIEW.md` — Original code review. Bugs/UX sections mostly resolved; remaining items moved to REQUIREMENTS.md Roadmap.
- `README.md` — User-facing project overview. Keep feature list and usage instructions current.

## Running Tests
```bash
npm test
npm run lint
npm run test:uat
npm run test:uat:iphone
npm run test:visual
npm run test:all
npm run check
```
Unit tests use a mock DOM environment — no browser needed. All app functions are extracted from the `<script>` tag in `index.html` via eval. Playwright runs the product suite in WebKit with an iPhone 13 profile; Chromium owns the forced-offline service-worker check because Playwright WebKit cannot reliably reload after its context is forced offline.

## Architecture
- **Data model**: `data.matches[].sets[].turns[]` — each turn has `{overIn, overOut, net, foot}` counts
- **Undo**: `undoStack` array (supports multi-undo). Cleared on newSet/newMatch/resetAllData.
- **State**: `viewingTurnIndex` — `null` means latest turn, number means viewing an old turn (serve buttons disabled)
- **Storage**: localStorage key `volleyball-serve-tracker`, data version 3

## Release Checklist
1. Update version string in `index.html` footer (search for "Serve Tracker v")
2. Bump SW cache version in `sw.js` (`CACHE_NAME` constant)
3. Update `CHANGELOG.md` with new entry
4. Update `REQUIREMENTS.md` if features changed
5. Update `TEST_PLAN.md` if behavior changed
6. Run `npm run check` and verify lint, unit, Playwright, and visual tests pass
7. Complete the real-iPhone smoke test in `TEST_PLAN.md` for device-only behavior
8. Commit, push, merge PR to `main` — Netlify auto-deploys

## Deployment
- **Hosting**: Netlify (site ID in `.netlify/state.json`)
- **Auto-deploy is active**: merging to `main` triggers deploy automatically via GitHub integration
- **Netlify CLI cannot authenticate from Claude Code remote sessions** — proxy blocks outbound auth
- **Manual deploy** (from local machine, if needed): `npx netlify-cli deploy --prod --dir=.`

## PR Workflow (from coding-agent sessions)
- Verify `gh --version` and `gh auth status -h github.com`; availability and authentication vary by session.
- If GitHub CLI is not authenticated, do not assume API or branch-protection access.
- **Fallback**: Provide the user a compare URL + suggested title/body, and let them create the PR manually.
- Compare URL format: `https://github.com/darinarcher/vb-serve-tracker/compare/main...<branch>`

## Versioning
- Version string is in the footer of `index.html` (search for "Serve Tracker v")
- Version text color should be `#888` (visible on dark background)
