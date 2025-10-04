# Developer Guide - easy-pdf

Welcome to the easy-pdf development documentation! This guide will help you get started with contributing to the project.

## Quick Start

### Prerequisites
- **Node.js:** v18+ (v20+ recommended)
- **npm:** v8+ (comes with Node.js)
- **Git:** Latest stable version
- **VS Code:** Recommended (with extensions below)

### Initial Setup
```powershell
# Clone the repository
git clone https://github.com/yourusername/easy-pdf.git
cd easy-pdf

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Development Commands
```powershell
# Development
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run lint:strict   # ESLint with max warnings = 0
npm run type-check    # TypeScript type checking
npm run validate      # Run all checks (lint + typecheck)

# Validation Scripts
node scripts/validate-seo.js                    # SEO validation
node scripts/validate-content-templates.js      # Content patterns
node scripts/analyze-pdfjs-usage.js             # Bundle analysis
```

## Project Structure

```
easy-pdf/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js            # Homepage
│   │   ├── layout.js          # Root layout
│   │   ├── ClientLayout.js    # Client-side wrapper
│   │   └── [tool-name]/       # Individual tools
│   │       ├── page.js        # Tool UI
│   │       ├── layout.js      # Tool metadata
│   │       └── metadata.js    # (optional) metadata config
│   ├── components/            # Reusable React components
│   │   ├── ui/               # UI primitives (Button, Card, etc.)
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── home/             # Homepage components
│   │   └── tool/             # Tool-specific components
│   ├── lib/                  # Utilities and helpers
│   │   ├── designTokens.js   # Design system tokens
│   │   ├── pdfUtils.js       # PDF manipulation helpers
│   │   ├── pdfjsWorker.js    # PDF.js lazy loading
│   │   ├── tesseractWorker.js # Tesseract.js lazy loading
│   │   ├── seoEnhancements.js # SEO metadata helpers
│   │   ├── structuredData.js  # JSON-LD generators
│   │   ├── enhancedUX.js     # UX helpers (safe URLs, sanitize)
│   │   └── analytics.js      # Analytics utilities
│   ├── contexts/             # React Contexts
│   │   └── ThemeContext.js   # Theme provider
│   └── hooks/                # Custom React hooks
│       └── useWebVitals.js   # Web Vitals tracking
├── public/                   # Static assets
│   ├── pdf.worker.min.js     # PDF.js worker
│   ├── robots.txt
│   ├── sitemap.xml
│   └── ...
├── docs/                     # Documentation
│   ├── audit-report.md       # Performance audit results
│   ├── component-guidelines.md
│   ├── pdfjs-optimization-progress.md
│   └── ...
├── scripts/                  # Build & validation scripts
├── .github/workflows/        # CI/CD pipelines
└── config files              # ESLint, Tailwind, Next.js, etc.
```

## Adding a New Tool

### 1. Create Tool Directory
```powershell
mkdir src/app/my-new-tool
cd src/app/my-new-tool
```

### 2. Create `layout.js` (Metadata)
```javascript
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "My New Tool - Free Online PDF Tool",
  description: "Description of what this tool does",
  keywords: ["pdf tool", "my feature", "free online"],
  canonicalPath: "/my-new-tool",
  category: "Tools",
});

export default function MyNewToolLayout({ children }) {
  const structuredData = generateComprehensiveJsonLd('tool', {
    name: "My New Tool",
    description: "Description of what this tool does",
    url: "https://yoursite.com/my-new-tool",
    features: ["feature 1", "feature 2"],
  });

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

### 3. Create `page.js` (UI & Logic)
```javascript
"use client";

import React, { useState } from "react";
import { loadPdfJs } from "@/lib/pdfjsWorker";  // If using PDF.js
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function MyNewToolPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Your processing logic here
      // If using PDF.js:
      // const pdfjs = await loadPdfJs();
      // const arrayBuffer = await file.arrayBuffer();
      // const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      // Process the file...
      
      // Success!
      setIsProcessing(false);
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process file. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="My New Tool"
      description="Description of what this tool does"
    >
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <FileDropzone
          onFilesSelected={handleFiles}
          acceptedFileTypes={{
            'application/pdf': ['.pdf'],
          }}
          maxFiles={1}
        />

        {file && (
          <div className="mt-6">
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Process File"}
            </Button>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
```

### 4. Add to Tool List
Edit `src/lib/tools.js` (or wherever tool list is maintained):
```javascript
{
  name: "My New Tool",
  description: "Brief description",
  href: "/my-new-tool",
  icon: MyToolIcon,  // Import from lucide-react
  category: "editing", // or "conversion", "security", etc.
}
```

### 5. Test
```powershell
npm run lint
npm run type-check
npm run build
npm run dev
# Visit http://localhost:3000/my-new-tool
```

## Development Guidelines

### Code Style
- **Format:** Prettier/ESLint configs (auto-format on save recommended)
- **Naming:**
  - Components: `PascalCase` (e.g., `MyComponent.jsx`)
  - Hooks: `camelCase` with `use` prefix (e.g., `useMyHook.js`)
  - Utilities: `camelCase` (e.g., `myUtility.js`)
- **Imports:** Use `@/` alias for absolute imports from `src/`

### Component Patterns
- **Always use design tokens:** Import from `@/lib/designTokens` or use Tailwind classes
- **Use shared UI components:** Import from `@/components/ui/`
- **Client components:** Add `"use client"` directive for interactivity
- **Error handling:** Always implement try/catch and user-friendly error messages

### Performance Best Practices
- **Lazy load heavy libraries:**
  - PDF.js: Use `loadPdfJs()` from `@/lib/pdfjsWorker`
  - Tesseract: Use `createTesseractWorker()` from `@/lib/tesseractWorker`
- **Dynamic imports:** Use `import()` for components not needed initially
- **Object URLs:** Use `safeCreateObjectURL()` and `safeRevokeObjectURL()` from enhancedUX
- **Image optimization:** Use Next.js `<Image>` component when possible

### SEO Guidelines
- **Every tool needs:**
  - Metadata in `layout.js` using `generateEnhancedMetadata()`
  - JSON-LD structured data using `generateComprehensiveJsonLd()`
  - Unique title, description, keywords
  - Canonical URL
- **Avoid:** Hardcoded meta tags (use metadata export)

### Accessibility (A11Y)
- **Semantic HTML:** Use proper tags (`<button>`, `<nav>`, `<main>`, etc.)
- **ARIA labels:** Add where needed (especially for icon-only buttons)
- **Keyboard navigation:** Test tab/enter/escape keys
- **Color contrast:** Follow WCAG AA standards (use design tokens)
- **Focus indicators:** Don't remove default focus outlines

## Testing

### Manual Testing Checklist
- [ ] Upload file (valid and invalid types)
- [ ] Process file successfully
- [ ] Handle errors gracefully
- [ ] Download result
- [ ] Test on mobile (responsive)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (if possible)

### Automated Tests (TODO)
```powershell
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e
```

## Debugging

### Common Issues

**Build fails:**
```powershell
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Linting errors:**
```powershell
# Auto-fix where possible
npm run lint -- --fix
```

**Type errors:**
```powershell
# Check types
npm run type-check
```

**PDF worker not loading:**
- Ensure `public/pdf.worker.min.js` exists
- Use `loadPdfJs()` helper (auto-configures worker)
- Check browser console for worker errors

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **PDF.js:** https://mozilla.github.io/pdf.js/
- **Tesseract.js:** https://tesseract.projectnaptha.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/docs/primitives

## Getting Help

- **GitHub Issues:** Report bugs or request features
- **Discussions:** Ask questions
- **Contributing Guide:** See CONTRIBUTING.md

---

Happy coding! 🚀
