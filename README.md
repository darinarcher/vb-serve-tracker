# VB Serve Tracker

A mobile-first Progressive Web App for tracking volleyball serve statistics during practice and matches.

**[Live Demo](https://vb-serve-tracker.netlify.app)**

## Features

- **Real-time serve tracking** - Tap to record successful serves, net faults, or foot faults
- **Turn-based organization** - Track serves by turn within sets and matches
- **Live statistics** - See your success rate update instantly for both current turn and set totals
- **Match history** - Review past matches with detailed per-turn breakdowns
- **CSV export** - Download your data for analysis in spreadsheets
- **Works offline** - Full PWA support with service worker caching
- **Mobile optimized** - Designed for one-handed use during practice
- **Data persistence** - All data saved locally in your browser

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
├── index.html      # Main app (HTML, CSS, and JS in single file)
├── manifest.json   # PWA manifest for installability
├── sw.js           # Service worker for offline caching
└── .netlify/       # Netlify configuration
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

- **OVER (green)** - Successful serve that cleared the net
- **NET (red)** - Serve hit the net
- **FOOT (orange)** - Foot fault

### Navigation

- **Next Turn** - Start a new turn within the current set
- **New Set** - Start a new set within the current match
- **New Match** - Start a completely new match
- **Undo** - Reverse the last action

### Data Management

- Enter your name in the Player field for personalized exports
- Tap the clipboard icon to view match history
- Export to CSV for detailed analysis
- Use "Export & New Player" to save data and reset for someone else

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
- Test on both mobile and desktop browsers
- Maintain PWA functionality (test offline mode)
- Follow existing code style and naming conventions

## License

MIT License - see [LICENSE](LICENSE) for details.
