# Quick Reference - Performance Optimization

## 🎯 Current Status (October 3, 2025)

### ✅ Completed
- [x] Production baselines captured (8 pages)
- [x] Bundle analysis completed  
- [x] Tesseract.js deferred (8 KB chunk)
- [x] PDF.js deferred (1.96 MB chunk)
- [x] CI/CD pipeline configured
- [x] All documentation complete

### 📊 Key Metrics (Baseline)
| Metric | Average | Target | Gap |
|--------|---------|--------|-----|
| Performance | 54.9 | 75+ | -20.1 |
| LCP | 9.22s | <2.5s | +6.72s |
| TBT | 842ms | <200ms | +642ms |
| FCP | 1.16s | <1.8s | ✅ |

### 🎯 Priority 1 - Next Actions

**Apply PDF.js worker pattern to remaining pages** (2-4 hours)

Pages needing update:
```
src/app/medical-analyzer/page.js
src/app/legal-analyzer/page.js
src/app/delete-pages/page.js
src/app/rotate/page.js
src/app/split/page.js
src/app/watermark/page.js
src/app/merge/page.js
src/app/compress/page.js
src/app/protect/page.js
src/app/unlock/page.js
src/app/organize/page.js
src/app/reorder/page.js
src/app/pdf-to-jpg/page.js
```

**Pattern to apply:**

```javascript
// ❌ OLD (static import)
import { getDocument } from 'pdfjs-dist';

// ✅ NEW (dynamic worker import)
import { loadPdfJs, ensurePdfWorkerEntry } from '@/lib/pdfjsWorker';

// In async function:
await ensurePdfWorkerEntry();
const pdfjsLib = await loadPdfJs();
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
```

### 🔧 Common Commands

```powershell
# Build production
npm run build

# Analyze bundles (interactive)
npm run analyze

# Start production server
npx next start -p 4001

# Run Lighthouse (headful)
$env:LH_HEADFUL='1'
node scripts/run-lighthouse.js http://127.0.0.1:4001/PAGE docs/logs/lh_PAGE.json

# Extract metrics
node scripts/extract-lighthouse-metrics.js docs/logs/lh_*.json

# Check chunk sizes
Get-ChildItem .next\static\chunks -File | Sort-Object Length -Desc | Select Name,@{N='Size';E={"{0:N2} MB" -f ($_.Length/1MB)}}

# Lint
npm run lint:strict

# Type check
npm run type-check
```

### 📦 Chunk Size Reference

| Chunk | Size | Status | Action Needed |
|-------|------|--------|---------------|
| pdf-libs | 1.96 MB | ✅ Split | Apply to more pages |
| vendors | 1.94 MB | ⚠️ Large | Split by usage |
| polyfills | 113 KB | ⚠️ Review | Reduce/condition |
| ui-libs | 107 KB | ✅ OK | Monitor |
| tesseract | 8 KB | ✅ Split | Done |

### 🎬 Quick Start Next Session

1. **Find pages using static PDF imports:**
   ```powershell
   grep -r "from 'pdfjs-dist'" src/app/
   grep -r "from 'pdf-lib'" src/app/
   ```

2. **Apply worker pattern (use pdf-table-extractor as template):**
   ```powershell
   code src/app/pdf-table-extractor/page.js
   # Copy pattern to target page
   ```

3. **Validate changes:**
   ```powershell
   npm run build
   npm run lint:strict
   ```

4. **Measure impact:**
   ```powershell
   npx next start -p 4001
   $env:LH_HEADFUL='1'
   node scripts/run-lighthouse.js http://127.0.0.1:4001/TARGET docs/logs/lh_TARGET_after.json
   node scripts/extract-lighthouse-metrics.js docs/logs/lh_TARGET_*.json
   ```

### 📚 Key Documents

- **Roadmap:** `docs/roadmap.md`
- **Audit Report:** `docs/audit-report.md`
- **Session Summary:** `docs/session-summary.md`
- **Baseline Metrics:** `docs/logs/lighthouse-baseline-summary.txt`

### 🚦 Performance Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Perf Score | ≥90 | 50-89 | <50 |
| FCP | <1.8s | 1.8-3s | >3s |
| LCP | <2.5s | 2.5-4s | >4s |
| TBT | <200ms | 200-600ms | >600ms |
| CLS | <0.1 | 0.1-0.25 | >0.25 |

### 🔍 Debugging Tips

**Lighthouse shows interstitial error?**
- Use `next start` not `http-server`
- Set `$env:LH_HEADFUL='1'`
- Ensure server is fully ready (test with curl first)

**Build fails?**
- Check lint: `npm run lint:strict`
- Check types: `npm run type-check`
- Check for circular dependencies

**Bundle analysis not showing changes?**
- Clear `.next`: `Remove-Item -Recurse -Force .next`
- Rebuild: `npm run build`
- Re-analyze: `npm run analyze`

---

**Last Updated:** October 3, 2025  
**Next Review:** After applying PDF.js pattern to remaining pages
