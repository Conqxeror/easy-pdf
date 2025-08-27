# Copilot Instructions for easy-pdf

## Project Overview
- This is a Next.js 15 monorepo for a comprehensive PDF & document toolkit web app. Major features are implemented as modular tools under `src/app/`, each with its own directory (e.g., `compress`, `merge`, `ocr`, etc.).
- UI components are organized in `src/components/` and subfolders (e.g., `ui/`, `layout/`, `home/`). Shared logic and data live in `src/lib/`.
- The app uses Tailwind CSS for styling, Radix UI for accessible components, and PDF.js/Tesseract.js for PDF/OCR operations.

## Architecture & Patterns
- **Tool Routing:** Each tool is a Next.js route under `src/app/TOOLNAME/`. Tool-specific logic/UI is colocated in these folders.
- **Shared Components:** Reusable UI elements are in `src/components/ui/` and `src/components/layout/`.
- **Context & State:** App-wide state (e.g., theme) is managed via React Contexts in `src/contexts/`.
- **Lib Utilities:** Common logic (PDF manipulation, analytics, metadata, etc.) is in `src/lib/`. Use these utilities for cross-tool features.
- **Data:** Static data (tool lists, FAQ, sponsors) is in `src/lib/` as JS/JSON modules.

## Developer Workflows
- **Build:** `npm run build` (Next.js build)
- **Dev Server:** `npm run dev` (hot reload, port 3000)
- **Lint:** `npm run lint` (uses custom ESLint configs: see `eslint.config.*.mjs`)
- **No default test scripts**; add tests as needed. No test runner is preconfigured.
- **Debugging:** Use browser/Next.js dev tools. No custom debug scripts.

## Conventions & Practices
- **File Naming:** Use PascalCase for React components, camelCase for hooks/utilities.
- **Component Structure:** Prefer function components. Use Tailwind for styling, Radix for accessibility.
- **Routing:** All tools are accessed via `/TOOLNAME` routes. Shared layouts are in `src/app/layout.js` and tool-specific layouts in each tool folder.
- **No Redux/MobX:** State is managed via React Context or local state only.
- **No serverless functions or API routes** are present; all logic is client-side.
- **External Libraries:** PDF.js, Tesseract.js, Framer Motion, Radix UI, Tailwind CSS.

## Integration Points
- **PDF.js**: Used for PDF rendering/manipulation in browser (see `src/lib/pdfUtils.js`).
- **Tesseract.js**: Used for OCR (see `src/lib/advancedPdfProcessing.js`).
- **Analytics:** Custom logic in `src/lib/analytics.js` and `src/app/vercel-analytics.js`.
- **SEO:** Structured data and enhancements in `src/lib/seoEnhancements.js` and `src/lib/structuredData.js`.

## Examples
- To add a new tool: create a folder under `src/app/TOOLNAME/` with `page.js` and (optionally) `layout.js`.
- To use a shared UI element: import from `src/components/ui/`.
- To manipulate PDFs: use helpers from `src/lib/pdfUtils.js`.

## Key Files & Directories
- `src/app/` — main app routes/tools
- `src/components/` — shared UI
- `src/lib/` — utilities/data
- `src/contexts/` — React Contexts
- `public/` — static assets
- `eslint.config.*.mjs` — linting configs

---

If any section is unclear or missing, please provide feedback for further refinement.
