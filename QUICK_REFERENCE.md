# Quick Reference Card — easy-pdf

**Last Updated:** October 4, 2025

## 🚀 Development Commands

```powershell
# Start development
npm run dev              # Dev server (localhost:3000)

# Build & validation
npm run build            # Production build
npm run lint             # ESLint check
npm run type-check       # TypeScript check
npm run validate         # Lint + typecheck (runs in CI)

# Validation scripts
node scripts/validate-seo.js                    # SEO validation
node scripts/validate-content-templates.js      # Content validation
node scripts/analyze-pdfjs-usage.js             # Bundle analysis
```

## 📊 Project Status (Oct 4, 2025)

### Sprint 1: ✅ COMPLETE
- [x] Project audit & baselines
- [x] Layout analysis (already well-organized)
- [x] UI standardization (already done)
- [x] Content validation scripts
- [x] SEO validation scripts
- [x] Performance optimization (8 pages, ~4.16MB deferred)
- [x] PDF worker handling (centralized)
- [x] Developer documentation (README.dev.md, CONTRIBUTING.md)
- [x] Product backlog & roadmap (docs/backlog.md)

### Sprint 2: 🟢 READY TO START
- [ ] Run validation scripts & fix findings
- [ ] Accessibility improvements (axe audits, WCAG)
- [ ] Unit testing (70%+ coverage for src/lib/*)
- [ ] Linting harmonization & pre-commit hooks
- [ ] E2E testing with Playwright

### Sprint 3: 📋 PLANNED
- [ ] Additional bundle optimizations
- [ ] SEO & content final validation
- [ ] Performance monitoring (Sentry)
- [ ] Advanced features
- [ ] Launch prep

## 📁 Key Files

### Documentation
- `README.md` — Project overview
- `README.dev.md` — Developer guide (setup, patterns, guidelines)
- `CONTRIBUTING.md` — Contribution guidelines
- `docs/audit-report.md` — Performance audit results
- `docs/backlog.md` — 3-sprint roadmap
- `docs/component-guidelines.md` — Component usage patterns
- `docs/session-summary-oct4.md` — Today's session summary

### Scripts
- `scripts/validate-seo.js` — SEO validator
- `scripts/validate-content-templates.js` — Content validator
- `scripts/analyze-pdfjs-usage.js` — Bundle analyzer
- `scripts/apply-pdfjs-worker-pattern.js` — Automated transformer

### Helpers
- `src/lib/pdfjsWorker.js` — PDF.js lazy loading
- `src/lib/tesseractWorker.js` — Tesseract lazy loading
- `src/lib/seoEnhancements.js` — SEO metadata helpers
- `src/lib/enhancedUX.js` — UX helpers (safe URLs, sanitize)

## 🎯 Performance Metrics

### Current (Post-Optimization)
- **Optimized pages:** 690-694 KB First Load JS (↓ 42% from 1.23 MB)
- **Unoptimized pages:** 1.23 MB (pdf-lib heavy)
- **Shared vendor:** 638 KB
- **Build time:** 44s

### Targets (Sprint 2-3)
- **Performance score:** 75+ (currently 51-57)
- **LCP:** <2.5s (currently 6.4-10.3s)
- **TBT:** <200ms (currently 695-1048ms)
- **A11y score:** 95+ (currently ~91)

## 🛠️ Development Patterns

### Adding a New Tool
1. Create `src/app/my-tool/` directory
2. Create `layout.js` with metadata (use `generateEnhancedMetadata`)
3. Create `page.js` with UI & logic (use ToolPageLayout)
4. Use `loadPdfJs()` for PDF operations
5. Test: `npm run validate && npm run build`

### Performance Best Practices
- ✅ Use `loadPdfJs()` for PDF rendering
- ✅ Use `createTesseractWorker()` for OCR
- ✅ Use `safeCreateObjectURL()` and `safeRevokeObjectURL()`
- ✅ Import UI components from `@/components/ui/`
- ✅ Use design tokens (Tailwind classes)

### SEO Best Practices
- ✅ Use `generateEnhancedMetadata()` in layouts
- ✅ Use `generateComprehensiveJsonLd()` for structured data
- ✅ Add unique titles, descriptions, keywords
- ✅ Include canonical URLs

## 📋 Next Actions

### Immediate (This Week)
1. Run validation scripts:
   ```powershell
   node scripts/validate-seo.js
   node scripts/validate-content-templates.js
   ```
2. Fix identified issues (prioritize high-severity)
3. Start accessibility audit (axe-core)

### Short-Term (Next 2 Weeks — Sprint 2)
1. Set up testing framework (Vitest/Jest)
2. Write unit tests for `src/lib/*`
3. Add pre-commit hooks (husky + lint-staged)
4. Run E2E tests for critical paths
5. Integrate Sentry for error monitoring

### Medium-Term (Weeks 5-6 — Sprint 3)
1. Final bundle optimizations (pdf-lib lazy loading)
2. Validate all SEO & content (run scripts again)
3. Re-run Lighthouse audits (verify improvements)
4. Launch prep (final checks)

## 🐛 Common Issues & Fixes

### Build Fails
```powershell
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Linting Errors
```powershell
npm run lint -- --fix
```

### Type Errors
```powershell
npm run type-check
```

### PDF Worker Not Loading
- Ensure `public/pdf.worker.min.js` exists
- Use `loadPdfJs()` helper (auto-configures)
- Check browser console for errors

## 📞 Getting Help

- **GitHub Issues:** Report bugs or request features
- **GitHub Discussions:** Ask questions
- **Documentation:** See README.dev.md, CONTRIBUTING.md
- **Session Summaries:** Check `docs/session-summary-*.md`

## 📈 Success Metrics

### Sprint 1 ✅
- [x] Bundle size reduced by 42% on 8 pages
- [x] Build and lint passing
- [x] Documentation created

### Sprint 2 Targets
- [ ] Lighthouse A11y ≥95
- [ ] Test coverage ≥70%
- [ ] Zero TypeScript errors
- [ ] Pre-commit hooks active

### Sprint 3 Targets
- [ ] Lighthouse Perf ≥80
- [ ] Lighthouse SEO ≥95
- [ ] All validation scripts passing
- [ ] Production launch ready

---

**Quick Links:**
- [Developer Guide](./README.dev.md)
- [Contributing](./CONTRIBUTING.md)
- [Backlog & Roadmap](./docs/backlog.md)
- [Component Guidelines](./docs/component-guidelines.md)
- [Audit Report](./docs/audit-report.md)
