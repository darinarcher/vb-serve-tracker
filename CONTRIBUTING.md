# Contributing to VB Serve Tracker

Thanks for your interest in contributing to VB Serve Tracker! This is a simple volleyball serve tracking app, and we welcome contributions of all kinds.

## Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, or Edge)
- A text editor
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-fork>/vbtracker.git
   cd vbtracker
   ```

2. **Open for development**

   This is a static PWA with no build step. Simply open `index.html` in your browser:
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Or use a local server for service worker testing
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Test offline functionality**

   Use a local server (step above) to test the service worker and PWA features.

## Project Structure

```
vbtracker/
├── index.html      # Main app (HTML, CSS, and JS in one file)
├── manifest.json   # PWA manifest
├── sw.js           # Service worker for offline support
└── TEST_PLAN.md    # Manual testing checklist
```

This is intentionally a single-file app for simplicity. All styles and scripts are inline in `index.html`.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:

1. **Title**: Brief description (e.g., "Undo button doesn't work after set change")
2. **Environment**: Browser, device type (mobile/desktop), OS
3. **Steps to reproduce**: Numbered list of actions
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If applicable

Example:
```
Title: Serve count resets unexpectedly

Environment: Chrome 120, iPhone 14, iOS 17

Steps to reproduce:
1. Start a new match
2. Record 5 serves
3. Lock the phone screen
4. Unlock after 30 seconds

Expected: Serve count remains at 5
Actual: Serve count shows 0
```

### Requesting Features

Have an idea? Open an issue with:

1. **Title**: Brief feature name
2. **Problem**: What problem does this solve?
3. **Proposed solution**: How should it work?
4. **Alternatives considered**: Other approaches you thought of
5. **Mockups**: Rough sketches if UI is involved

Keep in mind this is meant to be a simple, focused app. Features that add complexity should have strong justification.

### Submitting Code

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Make your changes**
   - Follow the code style guidelines below
   - Keep changes focused on one thing
   - Test thoroughly using TEST_PLAN.md

4. **Commit your changes**
   ```bash
   git add index.html
   git commit -m "feat: add serve streak counter"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### JavaScript

- **Vanilla JS only** - no frameworks or build tools
- Use `const` by default, `let` when reassignment is needed
- Use descriptive function and variable names
- Keep functions small and focused
- Comment complex logic, but prefer self-documenting code

```javascript
// Good
const updateServeCount = (type) => {
    currentTurn[type]++;
    saveToStorage();
    renderStats();
};

// Avoid
const u = (t) => { ct[t]++; s(); r(); };
```

### CSS

- Use CSS custom properties for colors and repeated values
- Mobile-first responsive design
- Keep selectors simple and specific
- Group related styles together

```css
/* Good */
.serve-btn {
    border: none;
    border-radius: 16px;
    font-size: 28px;
    font-weight: bold;
}

/* Avoid */
div.buttons-container > button.serve-btn:first-child { ... }
```

### HTML

- Use semantic HTML elements
- Keep accessibility in mind (labels, aria attributes)
- Maintain consistent indentation (4 spaces)

## Commit Message Format

Use conventional commits:

```
<type>: <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes nor adds
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add match history export to CSV

fix: prevent double-tap zoom on iOS

docs: update README with PWA install instructions

refactor: extract storage functions to separate section
```

## Testing Requirements

Before submitting a PR, run through the relevant sections of `TEST_PLAN.md`:

1. **Always test:**
   - Basic serve counting (OVER, NET, FOOT buttons)
   - Undo functionality
   - Data persistence (refresh the page)

2. **If you changed UI:**
   - Test on mobile viewport (375px width)
   - Test touch interactions
   - Check all buttons are reachable

3. **If you changed data/storage:**
   - Test localStorage persistence
   - Test with cleared storage
   - Verify no data loss on refresh

4. **If you changed service worker:**
   - Test offline functionality
   - Clear cache and reload
   - Test on actual mobile device if possible

## Pull Request Process

1. **Title**: Use commit message format (e.g., "feat: add serve streak counter")

2. **Description**: Include:
   - What changes were made
   - Why (link to issue if applicable)
   - How to test
   - Screenshots for UI changes

3. **Checklist** (include in PR):
   ```
   - [ ] Tested on Chrome
   - [ ] Tested on Safari/mobile
   - [ ] Ran TEST_PLAN.md regression checklist
   - [ ] Code follows style guidelines
   - [ ] Commit messages follow format
   ```

4. **Review**: A maintainer will review your PR. Be responsive to feedback.

5. **Merge**: Once approved and CI passes, your PR will be merged.

## Questions?

- Open an issue for general questions
- Tag maintainers if you're stuck on a contribution

Thanks for helping make VB Serve Tracker better!
