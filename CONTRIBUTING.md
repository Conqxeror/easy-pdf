# Contributing to easy-pdf

Thank you for your interest in contributing to easy-pdf! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:
- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

### Prerequisites
- Node.js v18+ (v20+ recommended)
- npm v8+
- Git
- Basic knowledge of React, Next.js, and Tailwind CSS

### Fork and Clone
```powershell
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/easy-pdf.git
cd easy-pdf

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/easy-pdf.git

# Install dependencies
npm install
```

### Setup Development Environment
```powershell
# Run development server
npm run dev

# In another terminal, watch for lint errors
npm run lint -- --watch
```

## How to Contribute

### Types of Contributions

**Bug Reports**
- Check existing issues first
- Use the bug report template
- Include steps to reproduce
- Provide browser/OS information

**Feature Requests**
- Check existing issues/discussions first
- Explain the use case clearly
- Consider implementation complexity
- Be open to feedback

**Code Contributions**
- Bug fixes
- New tools/features
- Performance improvements
- Documentation improvements
- Test coverage

**Documentation**
- Fix typos or unclear sections
- Add examples or tutorials
- Translate documentation
- Improve inline code comments

## Development Workflow

### 1. Create a Branch
```powershell
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### Branch Naming Convention
- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes
- Follow the [coding standards](#coding-standards)
- Write clear, self-documenting code
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```powershell
# Lint your code
npm run lint

# Type check
npm run type-check

# Build to ensure no errors
npm run build

# Manual testing (see testing checklist)
npm run dev
```

### 4. Commit Your Changes
**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(merge): add option to preserve bookmarks

Add a checkbox to allow users to preserve PDF bookmarks when merging multiple documents.

Closes #123
```

```
fix(compress): handle corrupted PDF files gracefully

Previously, corrupted PDFs would crash the page. Now we show a user-friendly error message.

Fixes #456
```

### 5. Push and Create Pull Request
```powershell
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Use the PR template
# Link related issues
```

## Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm run validate`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages are clear and follow convention
- [ ] PR description explains the changes clearly
- [ ] Related issues are linked

### PR Title Format
```
<type>: <description>

Examples:
feat: Add PDF watermark tool
fix: Correct OCR language detection
docs: Update README with new tool examples
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123
Related to #456

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How has this been tested?
- [ ] Manual testing
- [ ] Unit tests
- [ ] E2E tests

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process
1. **Automated Checks:** CI/CD runs lint, type-check, build
2. **Code Review:** Maintainer reviews code
3. **Feedback:** Address review comments
4. **Approval:** Once approved, maintainer merges

### After Your PR is Merged
```powershell
# Update your main branch
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Coding Standards

### JavaScript/React
- **Use modern ES6+ syntax**
- **Prefer functional components** over class components
- **Use hooks** for state and side effects
- **Avoid inline functions** in JSX (performance)
- **Destructure props** for clarity

**Good:**
```javascript
const MyComponent = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  
  return (
    <div className="container">
      <h1>{title}</h1>
      <p>{description}</p>
      <Button onClick={handleClick}>Toggle</Button>
    </div>
  );
};
```

**Avoid:**
```javascript
const MyComponent = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ padding: '20px' }}>  {/* Use Tailwind classes */}
      <h1>{props.title}</h1>  {/* Destructure props */}
      <button onClick={() => setIsOpen(!isOpen)}>  {/* Define function outside JSX */}
        Toggle
      </button>
    </div>
  );
};
```

### Styling
- **Use Tailwind CSS** classes
- **Use design tokens** from `@/lib/designTokens`
- **Avoid inline styles** unless absolutely necessary
- **Use shared components** from `@/components/ui/`

### File Structure
```
src/app/my-tool/
├── page.js          # Main UI component
├── layout.js        # Metadata and layout
└── metadata.js      # (optional) Separate metadata config
```

### Imports
```javascript
// React imports first
import React, { useState, useEffect } from "react";

// External libraries
import { PDFDocument } from "pdf-lib";

// Internal utilities (absolute paths with @/)
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { sanitizeFileName } from "@/lib/enhancedUX";

// Components
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";

// Styles (if any)
import styles from "./styles.module.css";
```

### Error Handling
```javascript
// Always use try/catch for async operations
try {
  const result = await processFile(file);
  setSuccess(true);
} catch (error) {
  console.error("File processing failed:", error);
  setError("Failed to process file. Please try again.");
}

// Provide user-friendly error messages
// Don't expose technical details to users
```

### Performance
- **Lazy load heavy libraries** (`loadPdfJs`, `createTesseractWorker`)
- **Use dynamic imports** for non-critical components
- **Cleanup effects:** Always cleanup timers, object URLs, etc.
- **Memoize expensive calculations** with `useMemo`
- **Debounce user inputs** for search/filter

### Accessibility
- **Use semantic HTML** (`<button>`, `<nav>`, `<main>`, etc.)
- **Add ARIA labels** for icon-only buttons
- **Ensure keyboard navigation** (tab, enter, escape)
- **Test with screen readers** (NVDA, JAWS, VoiceOver)
- **Color contrast:** WCAG AA minimum

## Testing Guidelines

### Manual Testing Checklist
Before submitting a PR, test your changes:

**Functionality:**
- [ ] Feature works as intended
- [ ] Edge cases handled (empty input, large files, etc.)
- [ ] Error handling works (show friendly errors)
- [ ] Success states are clear

**UI/UX:**
- [ ] Responsive on mobile, tablet, desktop
- [ ] Buttons/links are clickable (not too small)
- [ ] Loading states are shown
- [ ] Success/error messages are clear

**Accessibility:**
- [ ] Tab navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader friendly (add ARIA labels)
- [ ] Keyboard shortcuts work (if applicable)

**Performance:**
- [ ] No console errors/warnings
- [ ] Reasonable load time
- [ ] No memory leaks (cleanup in useEffect)

**Cross-Browser:**
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Automated Tests (TODO)
```powershell
# When tests are added:
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
To run Playwright fast during development (recommended):

```powershell
# Start next dev server in one terminal:
npm run dev

# In a second terminal start the Playwright tests against the dev server:
npm run test:e2e:dev
```

If you prefer Playwright to automatically build and start a production server before running tests (slower but matches prod):

```powershell
npm run test:e2e  # runs build + start in CI-like mode
```

Note: `test:e2e:dev` runs `npm run test:e2e:prepare` first to generate fixtures (including `sample.docx`) so tests don't need persistent checked-in binaries.
npm run test:watch    # Watch mode
```

### Playwright / E2E Troubleshooting & Tips

We use Playwright for end-to-end tests under `tests/e2e`. These tests exercise browser-only tools and client-side flows (e.g., `docx-to-pdf`, `video-trim`). Occasionally E2E tests can be flaky due to codec differences or how headless browsers attach in-memory Blobs to hidden file inputs. Below are helpful commands and tips to run tests, generate deterministic fixtures, and debug failures.

Commands you will use frequently:
```powershell
# Generate fixtures (sample.docx, tiny.webm) used by tests
npm run test:e2e:prepare

# Run all tests (slow - builds the site)
npm run test:e2e

# Run tests against the dev server (fast loop, recommended for local development)
npm run test:e2e:dev

# Run a single test suite and watch output (good for debugging)
npx playwright test tests/e2e/new-tools.spec.ts -g "Video Trim: upload small generated webm and generate thumbnails" --headed
```

Fixes we added to make E2E more reliable
- During CI we saw flakiness in uploading in-memory blobs via Playwright's `setInputFiles`. The `video-trim` test now uses a multi-step fallback:
  1. Try `setInputFiles()` with an in-memory Buffer (fast, private)
  2. If that fails, dispatch a `drop` event with a `DataTransfer` containing an in-page `File` object — this uses the app's `handleDrop` logic and avoids issues with hidden inputs
  3. If still not attached, `tests/fixtures/tiny.webm` is used (generated by `npm run test:e2e:prepare`) as a deterministic on-disk fixture

Playwright traces & screenshots — when uploads fail
- The `video-trim` test captures Playwright tracing (`tracing.start`) and a screenshot if the upload path fails. After a failure you'll find:
  - `test-results/<test-name>/video-attach-failure-trace.zip` (open with `npx playwright show-trace`)
  - `test-results/<test-name>/video-attach-failure.png` (screenshot of the page when it failed)

How to inspect a trace
```powershell
npx playwright show-trace test-results/new-tools-New-tool-flows-*/video-attach-failure-trace.zip
```
This opens the Playwright Trace Viewer in your browser and shows DOM snapshots, console logs, network requests, and performance information at each step.

E2E helpers available in `video-trim` tests
- Because generating thumbnails from a small synthetic webm can be flaky in some headless environments, `video-trim` exposes test helpers on `window.__E2E_EXPOSE`:
  - `window.__E2E_EXPOSE.setLastSnappedTime(t)` — sets the last snapped time for UI highlighting.
  - `window.__E2E_EXPOSE.loadThumbs(thumbs)` — programmatically sets thumbnails and opens a minimal preview. This lets tests inject deterministic thumbnails after the page has mounted and avoids race conditions.

Use `window.__E2E_EXPOSE` in a test like this:
```ts
// After upload or fallback
await page.evaluate(() => window.__E2E_EXPOSE.loadThumbs([{ time: 1, data: 'data:image/png;base64,....' }]));
```

Other tips
- If Playwright can't attach in-memory blobs in your environment, use `npm run test:e2e:prepare:video` to generate `tests/fixtures/tiny.webm` and let the test use the on-disk file.
- If you still see flakiness: enable full Playwright tracing on the run with `DEBUG=pw:api npx playwright test ...` and attach the trace artifacts to the PR for maintainers to inspect.

PagedJS visual baseline tests
- We added a visual diff test for `docx-to-pdf` that verifies PagedJS preview fidelity using a baseline screenshot. To create a baseline, run:
```powershell
npm run test:e2e:baseline:pagedjs
```
This will upload `sample.docx`, toggle PagedJS, and save a baseline screenshot to `tests/fixtures/pagedjs_baseline.png`.

To run the visual test and make sure there are no visual regressions:
```powershell
npx playwright test tests/e2e/pagedjs-visual.spec.ts --headed -g "DOCX PagedJS visual diff vs baseline"
```

If the baseline needs updating (e.g., after a CSS change), regenerate the baseline and commit the updated image or include a note in your PR explaining why the baseline changed.

## Documentation

### Code Comments
- **Explain "why", not "what"** (code should be self-explanatory)
- **Document complex algorithms** or business logic
- **Use JSDoc** for functions (parameters, return values)

```javascript
/**
 * Compresses a PDF by removing unnecessary metadata and optimizing images.
 * 
 * @param {File} file - The PDF file to compress
 * @param {Object} options - Compression options
 * @param {number} options.quality - Image quality (0-100)
 * @param {boolean} options.removeMetadata - Whether to remove metadata
 * @returns {Promise<Blob>} - Compressed PDF as Blob
 * @throws {Error} - If file is corrupted or not a valid PDF
 */
async function compressPdf(file, options = {}) {
  // Implementation...
}
```

### README Updates
- Update `README.md` if you add a new tool
- Update `README.dev.md` if you change development workflow
- Add examples for new features

### Inline Documentation
- Keep comments up-to-date with code changes
- Remove outdated or obvious comments
- Use TODO comments for future improvements:
  ```javascript
  // TODO: Add support for password-protected PDFs
  // FIXME: This breaks on very large files (>100MB)
  ```

## Questions?

- **GitHub Discussions:** Ask questions
- **GitHub Issues:** Report bugs or request features
- **Email:** contact@yourproject.com

Thank you for contributing! 🎉
