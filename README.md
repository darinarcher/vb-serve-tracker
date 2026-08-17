# VB Serve Tracker

A mobile-first Progressive Web App for tracking volleyball serve statistics during practice and matches.

**[Live Demo](https://vb-serve-tracker.netlify.app)**

## Features

- **Real-time serve tracking** - Tap to record OVER/IN, OVER/OUT, NET, or FOOT with haptic feedback
- **Turn-based organization** - Track serves by turn within sets and matches
- **Live statistics** - See the in-play rate update instantly for both current turn and set totals
- **Match history** - Review past matches with detailed per-turn breakdowns
- **CSV export** - Download your data for analysis in spreadsheets (properly escaped)
- **Works offline** - Full PWA support with network-first service worker caching
- **Mobile optimized** - Designed for one-handed use during practice with confirmation dialogs on irreversible actions
- **Data persistence** - All data saved locally in your browser with crash recovery
- **Empty set management** - Remove sets where a player didn't serve, or auto-cleanup on new set creation

## Tech Stack

- **Vanilla JavaScript** - No frameworks, minimal dependencies
- **PWA** - Installable on mobile devices with offline support
- **localStorage** - Client-side data persistence
- **Netlify** - Static hosting with automatic deployments

## Getting Started

### Prerequisites

- A modern web browser
- A local HTTP server (for development)

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vbtracker
   ```

2. Start a local server. Any of these options work:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (if you have npx)
   npx serve

   # Or use VS Code Live Server extension
   ```

3. Open `http://localhost:8000` in your browser

### Project Structure

```
vbtracker/
├── index.html          # Main app (HTML, CSS, and JS in single file)
├── manifest.json       # PWA manifest for installability
├── sw.js               # Service worker for offline caching (network-first)
├── test.js             # Dependency-free Node.js unit tests
├── e2e/                # Playwright acceptance tests
├── package.json        # Test tooling and scripts
├── icons/
│   └── icon.svg        # App icon (volleyball-themed SVG)
└── .netlify/           # Netlify configuration
```

## Deployment

The app is deployed automatically to Netlify on push to main.

### Manual Deployment

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Alternative: Drag and Drop

Simply drag the project folder to [Netlify Drop](https://app.netlify.com/drop).

## Usage

### Recording Serves

- **OVER/IN (green)** - Serve cleared the net and landed in bounds (includes aces and legal net-touch serves)
- **OVER/OUT (green)** - Serve cleared the net but went out long or wide
- **NET (red)** - Serve failed to clear the net
- **FOOT (orange)** - Foot fault

The in-play rate is `OVER/IN ÷ total serves`. It is a tracking metric, not a replacement for USA Volleyball or OVR rules.

### Navigation

- **Next Turn** - Start a new turn within the current set
- **New Set** - Start a new set within the current match (with confirmation)
- **New Match** - Start a completely new match (with confirmation)
- **Undo** - Reverse recent actions (supports multiple undos within a set)
- **Return to Latest** - When viewing an old turn, return to the current turn

### Data Management

- Enter your name in the Player field for personalized exports
- Tap the clipboard icon to view match history
- Export to CSV for detailed analysis
- Use "Export & New Player" to save data and reset for someone else
- Use "Delete Empty Set" if a set was created but the player didn't serve
- Use "Delete Empty Turn" to remove turns with no serves recorded

## Testing

```bash
# Lint all JavaScript, including the inline app script
npm run lint

# Unit tests (Node.js, no browser)
npm run test:unit

# Playwright UAT (iPhone Safari/WebKit plus Chromium offline-PWA coverage)
npm ci
npx playwright install webkit chromium
npm run test:uat

# Primary iPhone-Safari project only
npm run test:uat:iphone

# Review/update intentional iPhone visual changes
npm run test:visual
npm run test:visual:update

# Complete local/CI quality gate
npm run check
```

GitHub Actions runs `npm run check` automatically for pull requests and pushes to `main`. The deterministic suite covers 147 unit assertions, 24 emulated iPhone-Safari tests (including two visual snapshots), and one Chromium offline-PWA test. Physical iPhone checks remain required for haptics, safe areas, keyboard/gesture physics, installation, and offline installed-PWA launch; see `TEST_PLAN.md`.

## Contributing

Contributions are welcome! Here's how to help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly on mobile devices
5. Commit with clear messages: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Development Guidelines

- Keep the single-file architecture (HTML/CSS/JS in index.html)
- Treat iPhone Safari as the primary browser; use the documented real-iPhone release smoke test for device-only behavior
- Maintain PWA functionality (test offline mode)
- Follow existing code style and naming conventions

## License

MIT License - see [LICENSE](LICENSE) for details.
