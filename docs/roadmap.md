# Roadmap — easy-pdf

Generated: 2025-10-03

This roadmap tracks implementing the prioritized backlog from the audit. We'll update this file after each completed implementation.

## Objectives
- Improve structure and consistency across all tool pages.
- Raise SEO and accessibility scores to industry best practices.
- Reduce bundle sizes and improve page performance.
- Harden PDF/OCR processing to avoid main-thread blocking.
- Add CI, tests, and monitoring.

## Phases
### Phase 0 — Audit & quick wins (current)
- Run lint, build, typecheck.
- Fix critical lint/type errors that block builds.
- Add missing meta titles/descriptions to top pages.

### Phase 1 — Layout & component standardization
- Centralize layout in `src/app/layout.js` and refactor per-tool pages.
- Extract shared UI components into `src/components/ui`.
- Centralize design tokens in `src/lib/designTokens.js`.

### Phase 2 — SEO, Structured Data, and Content Templates
- Implement `src/lib/seoEnhancements.js` usage across pages.
- Add JSON-LD structured data and standard meta tags.

### Phase 3 — Performance & Workers
- Lazy-load heavy libs and run PDF/OCR in web workers.
- Image optimizations and preconnects.

### Phase 4 — Accessibility & Testing
- Axe/Lighthouse fixes and automated a11y checks in CI.
- Add unit and e2e smoke tests.

### Phase 5 — CI, Monitoring, and Rollout
- GitHub Actions to run lint/build/tests/Lighthouse on PRs.
- Integrate Sentry and confirm event flows.

## Sprint backlog (initial)
- Audit & baseline (this sprint)
- Apply meta tags to home and top 10 tools
- Fix lint errors blocking build

## How we'll work
- Each PR will target one todo from the master plan.
- Tests, lint, and build must pass before merging.
- Update this roadmap with completed items and new priorities.

