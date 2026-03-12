# Project Guidelines

## Architecture
- Keep document processing client-side. Tool workflows should run in the browser unless the task explicitly requires server behavior.
- Follow the route split used across `src/app`: `src/app/[tool]/page.js` is the server component for metadata and structured data, and `src/app/[tool]/components/[Tool]Client.js` holds interactive logic.
- In each tool `page.js`, call `getToolMetadata(href)` from `@/lib/toolSeoHelper` and export `metadata` from that result before rendering the client component.
- Reuse shared UI from `@/components/ui`, especially `ToolPageLayout`, existing shadcn-style primitives, and `lucide-react` icons.

## Heavy Libraries And File Handling
- Do not top-level import heavy browser libraries such as `pdf-lib`, `pdfjs-dist`, `@ffmpeg/ffmpeg`, or `tesseract.js` inside route or client components.
- Use the existing lazy-loading helpers instead: `usePDFLib()` and `usePDFJS()` from `@/lib/pdfUtils`, `loadFfmpegClient()` from `@/lib/ffmpegClient`, and `createTesseractWorker()` from `@/lib/tesseractWorker`.
- Use `safeCreateObjectURL()` and `safeRevokeObjectURL()` from `@/lib/enhancedUX` for generated files and previews. Always clean up object URLs in `useEffect` cleanup or equivalent teardown logic.
- Prefer the repo's existing helpers for user-facing errors and downloads instead of ad hoc browser APIs.

## Build And Test
- Safe routine commands: `npm run validate`, `npm run lint:strict`, `npm run type-check`, `npm run test:e2e`, `npm run test:e2e:prepare`, and `npm run generate-og-static`.
- Do not run `npm run dev`, `npm run build`, or `npm run start` unless the user explicitly asks. The workspace may already have a background server, and `build` also triggers `prebuild` validation and OG generation.
- When changing or adding Playwright coverage that depends on fixtures or media assets, run `npm run test:e2e:prepare` before the relevant tests.

## Conventions
- Use absolute imports with `@/`.
- Keep filenames in kebab-case to satisfy `scripts/validate-filenames.mjs`.
- Match the repo's existing style: most app code is JavaScript or JSX under `src/app`, with TypeScript mainly used for config and tests.
- Prefer Tailwind utility classes and existing UI components over new custom CSS files. Keep global styling changes in `src/app/globals.css` unless there is a strong reason otherwise.
- Show failures in the UI with existing patterns such as `sonner` toasts or alert components. Do not rely on console output as the only error handling path.
- Preserve accessibility: interactive controls need labels, keyboard support, and clear status/error messaging.

## Reference Patterns
- `src/app/compress-images/page.js` shows the standard tool route metadata pattern.
- `src/lib/pdfUtils.js` shows the expected lazy-loading pattern for PDF libraries.
- `src/lib/enhancedUX.js` contains the preferred helpers for object URLs, downloads, and user-facing errors.
- `src/lib/toolSeoHelper.js` is the source of truth for tool metadata and structured data generation.
