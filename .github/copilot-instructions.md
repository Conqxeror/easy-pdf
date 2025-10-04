# Copilot Instructions for easy-pdf

# Copilot Instructions for easy-pdf

Short, actionable guidance to work effectively in this repository.

Overview
- Framework: Next.js (app router, Next 15). Routes/tools live under `src/app/`.
- Styling: Tailwind CSS is used everywhere; utility classes are embedded in JSX.
- UI primitives: `src/components/ui/` contains canonical components (Button, Card, Input, Progress, Slider, Tooltip, Badge, etc.). Reuse these.

Key architecture notes
- Tool-per-route: each tool is a folder `src/app/<tool>/` with `page.js`. Client-heavy logic (PDF processing) belongs in `src/app/<tool>/components/*` and should be client-only (`"use client"`).
- Dynamic imports: heavy libs (PDF.js, pdf-lib, Tesseract) are dynamically imported in client components via `src/lib/pdfUtils.js` / `advancedPdfProcessing.js`.
- Shared layout: app-level layout is in `src/app/layout.js` and `src/app/ClientLayout.js`.

Developer workflows (commands you should run)
- Dev server: `npm run dev` (open http://localhost:3000)  specifically.
- Production build: `npm run build`
- Lint: `npm run lint` (run after edits; maintains code health)
- Visual QA: manually check Home, Compress, Merge, OCR pages in dark mode after styling changes.

Project-specific conventions & gotchas
- "use client" boundaries: Do not import browser-only libs into server components; put them in client components or use dynamic import.
- Tailwind edits: Many className strings are computed/template-literals. Avoid global regex replacements; change className locals and run `npm run lint` + `npm run build`.
- Dark-mode consistency: Components frequently include both light and `dark:` variants. Preserve `dark:` tokens (e.g., `bg-gray-50 dark:bg-gray-950`).
- Accessibility: UI primitives use ARIA and keyboard handlers—preserve these when refactoring (see `src/components/ui/*`).

Integration & important files
- PDF helpers: `src/lib/pdfUtils.js`, `src/lib/advancedPdfProcessing.js` (look here for browser-only integration patterns).
- Analytics: `src/lib/analytics.js` and `src/app/vercel-analytics.js`.
- UI primitives: `src/components/ui/` (Button, Input, Progress, Slider, Badge, Tooltip, Card).

Concrete examples
- Adding a new tool page:
	- Create `src/app/<tool>/page.js` and client components under `src/app/<tool>/components/`. Keep heavy libs in client components.
- Progress/Slider dark pattern:
	- Track: `bg-gray-950` (dark)
	- Indicator: `bg-white/70`

Quality gates
- After any visual or component change: run `npm run lint` then `npm run build` to catch SSR and compile-time issues.
- Follow with manual visual QA in dark mode for Home, Compress, Merge, and OCR pages.

If anything here is unclear or you want additional examples (e.g., component extension pattern or a small refactor), ask and I will update this file.
- `public/` — static assets

Important Messages:
- Never ever run "npm run build" & "npm run dev" as it will be already running in the background & when you run this command again other crashes. Tell user to run these commands when needed.
- Keep consistency all around the project.
- If you find anything which is an issue related to UI, SEO, or anything, while reading code or modifying code or you come around any way, then fix it & inform user.
- Whenever working on an issue or implementation, look for similar components that might have same issue and fix them too.