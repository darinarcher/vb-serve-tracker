# VB Serve Tracker - Claude Code Notes

## Project Overview
Single-page PWA for tracking volleyball serve statistics. All app logic lives in `index.html` (inline `<script>` tag). No build step, no framework.

## Key Files
- `index.html` — Full app (HTML + CSS + JS, all inline)
- `sw.js` — Service worker for PWA caching (bump cache version on every deploy)
- `manifest.json` — PWA manifest
- `test.js` — 112+ automated tests (Node.js, no dependencies)
- `icons/icon.svg` — App icon (volleyball-themed SVG)

## Documentation
- `REQUIREMENTS.md` — Source of truth for features (Implemented + Roadmap). Update when features change.
- `CHANGELOG.md` — Keep-a-Changelog format. Add entries for every release.
- `TEST_PLAN.md` — Manual test cases and regression checklist. Update when behavior changes.
- `REVIEW.md` — Original code review. Bugs/UX sections mostly resolved; remaining items moved to REQUIREMENTS.md Roadmap.
- `README.md` — User-facing project overview. Keep feature list and usage instructions current.

## Running Tests
```bash
node test.js
```
Tests use a mock DOM environment — no browser needed. All app functions are extracted from the `<script>` tag in `index.html` via eval.

## Architecture
- **Data model**: `data.matches[].sets[].turns[]` — each turn has `{over, net, foot}` counts
- **Undo**: `undoStack` array (supports multi-undo). Cleared on newSet/newMatch/resetAllData.
- **State**: `viewingTurnIndex` — `null` means latest turn, number means viewing an old turn (serve buttons disabled)
- **Storage**: localStorage key `volleyball-serve-tracker`, data version 2

## Release Checklist
1. Update version string in `index.html` footer (search for "Serve Tracker v")
2. Bump SW cache version in `sw.js` (`CACHE_NAME` constant)
3. Update `CHANGELOG.md` with new entry
4. Update `REQUIREMENTS.md` if features changed
5. Update `TEST_PLAN.md` if behavior changed
6. Run `node test.js` and verify all tests pass
7. Commit, push, merge PR to `main` — Netlify auto-deploys

## Deployment
- **Hosting**: Netlify (site ID in `.netlify/state.json`)
- **Auto-deploy is active**: merging to `main` triggers deploy automatically via GitHub integration
- **Netlify CLI cannot authenticate from Claude Code remote sessions** — proxy blocks outbound auth
- **Manual deploy** (from local machine, if needed): `npx netlify-cli deploy --prod --dir=.`

## PR Workflow (from Claude Code remote sessions)
- The `gh` binary in this environment is `node-gh` (NOT GitHub CLI) — it won't work for PRs
- GitHub API also can't be called directly (no auth token available)
- **Workaround**: Provide the user a compare URL + suggested title/body, they create the PR manually
- Compare URL format: `https://github.com/darinarcher/vb-serve-tracker/compare/main...<branch>`

## Versioning
- Version string is in the footer of `index.html` (search for "Serve Tracker v")
- Version text color should be `#888` (visible on dark background)
