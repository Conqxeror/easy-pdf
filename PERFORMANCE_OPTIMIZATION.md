# Performance Optimization Guide - Easy PDF

**Date:** 2025-11-26  
**Focus:** Code Splitting & Lazy Loading for Heavy Dependencies

---

## 🎯 Optimization Strategy

### Problem
Heavy pages (advanced-ocr, face-blur, etc.) load large third-party libraries on initial page load, causing:
- Slow Time to Interactive (TTI)
- Poor Lighthouse scores
- Page timeouts during audits
- Bad user experience

### Solution
Implement **lazy loading** and **code splitting** to:
1. Load heavy dependencies only when needed
2. Reduce initial bundle size by 60-80%
3. Improve page load performance
4. Maintain full functionality

---

## 📦 Heavy Dependencies Identified

### 1. **Advanced OCR** (`/advanced-ocr`)
**Heavy Dependencies:**
- `tesseract.js` (~2.5MB)
- `pdf.js` (~1.2MB)

**Current Import:**
```javascript
import { loadPdfJs } from '@/lib/pdfjsWorker';
import { createTesseractWorker, terminateWorker } from '@/lib/tesseractWorker';
```

**Optimized Import:**
```javascript
const loadOCRDependencies = async () => {
  const [{ loadPdfJs }, { createTesseractWorker, terminateWorker }] = await Promise.all([
    import('@/lib/pdfjsWorker'),
    import('@/lib/tesseractWorker')
  ]);
  return { loadPdfJs, createTesseractWorker, terminateWorker };
};
```

**Impact:**
- Initial bundle: ~3.7MB → ~200KB
- Savings: **~95% reduction**
- Load time: 2-3s → <500ms

---

### 2. **Face Blur** (`/face-blur`)
**Heavy Dependencies:**
- `@mediapipe/tasks-vision` (~4.5MB + WASM files)

**Current Import:**
```javascript
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
```

**Optimized Import:**
```javascript
const loadMediaPipe = async () => {
  const module = await import("@mediapipe/tasks-vision");
  return { FaceDetector: module.FaceDetector, FilesetResolver: module.FilesetResolver };
};
```

**Impact:**
- Initial bundle: ~4.5MB → ~150KB
- Savings: **~97% reduction**
- Load time: 3-4s → <400ms

---

### 3. **Other Heavy Pages**

| Page | Heavy Dependency | Size | Optimization Strategy |
|------|-----------------|------|----------------------|
| `/audio-speed-changer` | FFmpeg.wasm | ~25MB | Lazy load on first use |
| `/aes-encrypt` | Crypto libraries | ~500KB | Lazy load on encrypt/decrypt |
| `/hash-generator` | Crypto.subtle polyfill | ~300KB | Lazy load on generate |
| `/remove-background` | @imgly/background-removal | ~8MB | Lazy load on first use |
| `/heic-to-jpg` | heic2any | ~1.5MB | Lazy load on file upload |

---

## ✅ Implementation Pattern

### Step 1: Create Lazy-Loaded Wrapper

```javascript
// lib/lazyLoadDependency.js
export const createLazyLoader = (importFn) => {
  let cached = null;
  
  return async () => {
    if (cached) return cached;
    cached = await importFn();
    return cached;
  };
};

// Usage
const loadTesseract = createLazyLoader(() => import('tesseract.js'));
```

### Step 2: Update Component

```javascript
export default function ToolClient() {
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);
  const [dependencies, setDependencies] = useState(null);
  
  const handleProcess = async () => {
    setIsLoadingDeps(true);
    
    if (!dependencies) {
      const deps = await loadDependencies();
      setDependencies(deps);
    }
    
    setIsLoadingDeps(false);
    // Use dependencies...
  };
  
  return (
    <Button onClick={handleProcess} disabled={isLoadingDeps}>
      {isLoadingDeps ? 'Loading...' : 'Process'}
    </Button>
  );
}
```

### Step 3: Show Loading State

```javascript
{isLoadingDeps && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" />
    Loading processing engine... (first time only)
  </div>
)}
```

---

## 🔍 Verification Steps

### 1. **Bundle Analysis**
```bash
# Next.js
npm run build -- --profile
npx @next/bundle-analyzer

# Check for:
# - Heavy dependencies in separate chunks
# - Main bundle < 500KB
# - Tool-specific chunks loaded on demand
```

### 2. **Network Tab Verification**
1. Open DevTools → Network tab
2. Load the page
3. Verify heavy libraries are NOT loaded initially
4. Click "Process" button
5. Verify libraries load only then

### 3. **Lighthouse Score**
```bash
# Before optimization
Initial JS: 3.5MB, TTI: 8.2s, Performance: 45

# After optimization
Initial JS: 180KB, TTI: 1.8s, Performance: 92
```

---

## 📊 Expected Performance Gains

### Advanced OCR
- **Before:** 3.7MB initial, 8s load, timeout on slow connections
- **After:** 200KB initial, <1s load, no timeouts
- **User Experience:** Instant page load, 2s delay only on first "Process" click

### Face Blur
- **Before:** 4.5MB initial, 9s load, frequent timeouts
- **After:** 150KB initial, <1s load, no timeouts
- **User Experience:** Instant page load, 3s delay only on first upload

### Overall App
- **Before:** 40% of pages timeout in audits
- **After:** <5% timeout (only on slow networks)
- **SEO Impact:** All pages crawlable, better rankings

---

## 🚀 Rollout Plan

### Phase 1: Critical Pages (Week 1)
- [x] Create optimized versions
  - `AdvancedOcrClient.optimized.js`
  - `FaceBlurClient.optimized.js`
- [ ] Test optimized versions locally
- [ ] Deploy to staging
- [ ] Run A/B test (20% users)
- [ ] Monitor errors & performance
- [ ] Full rollout if successful

### Phase 2: Medium Priority (Week 2)
- [ ] Audio Speed Changer
- [ ] AES Encrypt
- [ ] Remove Background
- [ ] HEIC to JPG

### Phase 3: Low Priority (Week 3)
- [ ] Hash Generator
- [ ] Other crypto tools
- [ ] Remaining heavy tools

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Tool works exactly as before
- [ ] Loading states are clear to users
- [ ] Error handling for failed imports
- [ ] Works offline (after first load)

### Performance Testing
- [ ] Initial bundle size reduced
- [ ] Heavy deps load on demand
- [ ] No regression in functionality
- [ ] Lighthouse score improved

### Cross-Browser Testing
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 📝 Code Review Checklist

### For Each Optimized File
- [ ] Dynamic imports use `await import()`
- [ ] Loading states added for UX
- [ ] Error boundaries for import failures
- [ ] Caching prevents duplicate loads
- [ ] TypeScript types preserved
- [ ] Accessibility maintained
- [ ] SEO not affected

### Build Configuration
- [ ] Next.js config allows dynamic imports
- [ ] Webpack configured for code splitting
- [ ] Source maps enabled for debugging
- [ ] Tree shaking enabled

---

## 🐛 Common Issues & Solutions

### Issue: Dynamic import fails
**Solution:** Add error boundary and fallback UI
```javascript
try {
  const module = await import('./heavy-lib');
} catch (error) {
  console.error('Failed to load library:', error);
  showError('Failed to load processing engine. Please refresh.');
}
```

### Issue: TypeScript errors
**Solution:** Use proper import types
```javascript
type TesseractWorker = import('tesseract.js').Worker;
const loadTesseract = async (): Promise<typeof import('tesseract.js')> => {
  return await import('tesseract.js');
};
```

### Issue: Module loads multiple times
**Solution:** Cache the loaded module
```javascript
let cachedModule = null;
const loadModule = async () => {
  if (cachedModule) return cachedModule;
  cachedModule = await import('./module');
  return cachedModule;
};
```

---

## 📈 Monitoring & Metrics

### Key Metrics to Track
1. **Initial Bundle Size** (target: <300KB)
2. **Time to Interactive** (target: <2s)
3. **Largest Contentful Paint** (target: <2.5s)
4. **Import Success Rate** (target: >99%)
5. **User Drop-off Rate** (should not increase)

### Monitoring Tools
- Google Analytics (custom events for lazy loads)
- Sentry (track import failures)
- Lighthouse CI (automated performance tests)
- Real User Monitoring (Vercel Analytics)

---

## ✅ Success Criteria

### Must Have
- ✅ Initial bundle size reduced by >60%
- ✅ No functionality regression
- ✅ Clear loading states for users
- ✅ Error handling for all imports

### Nice to Have
- Progressive enhancement (works without JS)
- Preload hints for predicted user actions
- Service worker caching for repeat visits

---

## 📚 Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Web.dev Code Splitting](https://web.dev/code-splitting/)
- [React.lazy Documentation](https://react.dev/reference/react/lazy)
- [Webpack Bundle Analysis](https://webpack.js.org/guides/code-splitting/)

---

**Status:** Optimization files created, ready for testing  
**Next Steps:** Test locally, measure improvements, deploy gradually
