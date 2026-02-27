# VB Serve Tracker - Claude Code Notes

## Project Overview
Single-page PWA for tracking volleyball serve statistics. All app logic lives in `index.html` (inline `<script>` tag). No build step, no framework.

## Key Files
- `index.html` — Full app (HTML + CSS + JS, all inline)
- `sw.js` — Service worker for PWA caching (bump cache version on every deploy)
- `manifest.json` — PWA manifest
- `test.js` — 112+ automated tests (Node.js, no dependencies)

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

## Deployment
- **Hosting**: Netlify (site ID in `.netlify/state.json`)
- **Auto-deploy is active**: merging to `main` triggers deploy automatically via GitHub integration
- **Netlify CLI cannot authenticate from Claude Code remote sessions** — proxy blocks outbound auth
- **Manual deploy** (from local machine, if needed): `npx netlify-cli deploy --prod --dir=.`
- **Important**: Bump the SW cache version in `sw.js` with every release so PWA users get updates

## PR Workflow (from Claude Code remote sessions)
- The `gh` binary in this environment is `node-gh` (NOT GitHub CLI) — it won't work for PRs
- GitHub API also can't be called directly (no auth token available)
- **Workaround**: Provide the user a compare URL + suggested title/body, they create the PR manually
- Compare URL format: `https://github.com/darinarcher/vb-serve-tracker/compare/main...<branch>`

## Versioning
- Version string is in the footer of `index.html` (search for "Serve Tracker v")
- Version text color should be `#888` (visible on dark background)
