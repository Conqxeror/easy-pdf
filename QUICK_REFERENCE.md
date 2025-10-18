# Easy-PDF - Quick Issues Reference & Best Practices

## Current State Summary (October 2025)

### ✅ What's Working Well
- **Accessibility**: Comprehensive ARIA attributes, skip navigation, keyboard support
- **SEO**: Robust metadata generation, structured data (JSON-LD), sitemap
- **Performance**: Code splitting, lazy loading, optimized fonts
- **Dark Mode**: Complete CSS variable system, Tailwind dark mode
- **PWA**: Manifest, service worker ready, offline support planned
- **Security**: CSP headers, security headers (HSTS, X-Frame-Options, etc.)

### ⚠️ Known Limitations (Documented)
1. **CSP uses 'unsafe-inline' and 'unsafe-eval'** - Required for:
   - Next.js React hydration
   - PDF.js and Tesseract.js workers
   - Third-party widgets (Buy Me a Coffee)
   - JSON-LD structured data injection
   
2. **Hard-coded fallback base URL** - Will use `https://easy-pdf-murex.vercel.app` if environment variables not set

3. **Large client bundles** - Heavy PDF libraries (pdf-lib, pdfjs-dist, tesseract.js)
   - Mitigated with webpack code splitting
   - Consider Web Workers for further optimization

## Development Checklist

### Before Making Changes
- [ ] Read `IMPROVEMENTS_2025-10.md` for recent fixes
- [ ] Check `.github/copilot-instructions.md` for project conventions
- [ ] Verify you're following the design system (CSS variables, Tailwind)

### When Adding a New Tool Page
1. Add tool to `src/lib/toolData.js` with complete metadata
2. Create `src/app/[tool-name]/layout.js` using this template:
```javascript
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolSeo = getToolMetadata('/your-tool-name');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
```
3. Create `src/app/[tool-name]/page.js` with `"use client"` directive
4. Use `ToolPageLayout` component for consistent UI
5. Add FAQ if relevant (improves SEO)

### When Modifying Metadata/SEO
- Always use `generateEnhancedMetadata()` from `src/lib/seoEnhancements.js`
- Never hardcode base URLs - use env variables with fallback
- Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)
- Don't add fake ratings or reviews to structured data

### When Adding External Dependencies
- Check if it's a client-only library (most PDF tools are)
- Use dynamic import if library is heavy: `const lib = await import('heavy-lib')`
- Add to `serverExternalPackages` in `next.config.mjs` if needed
- Update webpack `splitChunks` config for large libs
- Consider Web Worker usage for CPU-intensive operations

### When Modifying Styles
- Prefer CSS variables from `globals.css` over hardcoded colors
- Use Tailwind utility classes, not inline styles
- Ensure dark mode variant exists: `bg-white dark:bg-black`
- Test in both light and dark modes
- Avoid `!important` - use Tailwind layer system instead

### When Adding Interactivity
- Use proper ARIA attributes for custom controls
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Add loading states for async operations
- Use `aria-live` regions for dynamic content updates
- Test with screen reader (NVDA, JAWS, or VoiceOver)

## Common Issues & Solutions

### Issue: "Metadata not showing in production"
**Solution**: Check that environment variables are set in your deployment platform (Vercel/Netlify):
- `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_BASE_URL`
- Run `npm run validate-env` locally to verify

### Issue: "CSP blocking external resources"
**Solution**: Add allowed domains to CSP in `next.config.mjs`:
```javascript
script-src 'self' https://your-domain.com;
```

### Issue: "Bundle size too large"
**Solution**:
1. Run `npm run analyze` to identify large chunks
2. Use dynamic imports for heavy components
3. Verify webpack splitChunks is working
4. Consider lazy loading below-the-fold components

### Issue: "Dark mode colors wrong"
**Solution**: Check that you're using:
- CSS variables: `bg-[rgb(var(--background))]`
- Or Tailwind dark classes: `bg-white dark:bg-black`
- Not hardcoded colors: ❌ `bg-gray-900`

### Issue: "Skip link not working"
**Solution**: Verify:
- Skip link has `href="#main-content"`
- Main content has `id="main-content"`
- Skip link is first focusable element (not hidden by default)
- Uses `.sr-only` and `.focus:not-sr-only` classes

## Testing Checklist

### Before Each PR
- [ ] Run `npm run validate` (env + lint + type-check)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test light and dark modes
- [ ] Test keyboard navigation
- [ ] Verify no console errors/warnings
- [ ] Check network tab for failed requests

### Before Release
- [ ] Run Lighthouse audit (aim for 90+ in all categories)
- [ ] Run axe accessibility scan (0 violations)
- [ ] Test on mobile devices (iOS Safari, Chrome Android)
- [ ] Verify PWA installability
- [ ] Test offline mode (if applicable)
- [ ] Validate structured data with Google tools
- [ ] Check bundle size hasn't increased significantly

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run validate-env        # Check environment variables

# Quality Checks
npm run lint               # ESLint check
npm run lint:strict        # Strict linting (used in prebuild)
npm run type-check         # TypeScript type checking
npm run validate           # Run all validations

# Build & Deploy
npm run build              # Production build
npm run start              # Start production server
npm run analyze            # Analyze bundle size

# Debugging
# Run lighthouse
npm run run-lighthouse     # If script exists
# Or use Chrome DevTools → Lighthouse tab
```

## Project Structure Quick Reference

```
src/
├── app/                    # Next.js 15 app router
│   ├── layout.js          # Root layout (metadata, fonts)
│   ├── ClientLayout.js    # Client-side layout (nav, theme)
│   ├── page.js            # Homepage
│   ├── [tool]/            # Tool-specific pages
│   │   ├── layout.js      # Tool metadata
│   │   ├── page.js        # Tool UI (client component)
│   │   └── components/    # Tool-specific components
│   └── globals.css        # CSS variables, design tokens
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components (nav, footer)
├── lib/                   # Utilities and helpers
│   ├── seoEnhancements.js # Metadata generation
│   ├── toolSeoHelper.js   # Tool-specific SEO
│   ├── toolData.js        # Tool definitions
│   └── pdfUtils.js        # PDF processing utilities
└── contexts/              # React contexts (theme, etc.)

public/
├── site.webmanifest       # PWA manifest
├── robots.txt             # Search engine directives
└── [icons]                # Favicons and app icons

scripts/
├── validate-env.js        # Environment validation
└── [other-scripts]        # Build and maintenance scripts
```

## Environment Variables Reference

### Required (or will use fallback)
- `NEXT_PUBLIC_SITE_URL` - Base URL for canonical links
- `NEXT_PUBLIC_BASE_URL` - Alternate base URL variable
- `VERCEL_URL` - Auto-set by Vercel deployment

### Optional
- `GOOGLE_SITE_VERIFICATION` - Google Search Console verification
- `BING_VERIFICATION` - Bing Webmaster verification
- `FACEBOOK_VERIFICATION` - Facebook domain verification
- `YANDEX_VERIFICATION` - Yandex verification
- `ANALYZE` - Set to 'true' to run bundle analyzer

### Development Only
- `ESLINT_CONFIG_FILE` - Override ESLint config for dev mode

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Schema.org](https://schema.org/) - Structured data reference
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Performance auditing

---

**Last Updated**: October 18, 2025  
**Maintained by**: Development Team  
**Questions?** Check `IMPROVEMENTS_2025-10.md` or `.github/copilot-instructions.md`
