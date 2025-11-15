// Lightweight helper to lazily load pdfjs and configure its worker at runtime.
// Goal: keep pdfjs out of the main vendor bundle by dynamically importing it
// only when a PDF is actually opened/processed.
export function getPdfWorkerUrl() {
  // compute worker URL from environment or runtime config.
  // Prefer Next's public env var or __NEXT_DATA__ assetPrefix when available.
  try {
    if (typeof window === 'undefined') {
      // In Node/SSR, resolve the native worker file if present (pdfjs-dist)
      try {
        return require.resolve('pdfjs-dist/build/pdf.worker.js');
      } catch {
        // Fallback to public asset if server can't resolve the package worker
        return '/pdf.worker.min.js';
      }
    }

    // In browser: resolve from assetPrefix or NEXT_PUBLIC_ASSET_PREFIX
    const assetPrefix = (window.__NEXT_DATA__ && window.__NEXT_DATA__.assetPrefix) || process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
    const prefix = (typeof assetPrefix === 'string' && assetPrefix.length > 0) ? assetPrefix.replace(/\/$/, '') : '';
    return `${prefix}/pdf.worker.min.js`;
  } catch {
    return '/pdf.worker.min.js';
  }
}

export async function loadPdfJs() {
  // Import the legacy build which exposes getDocument and GlobalWorkerOptions
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf');

  // Configure worker source for the browser runtime (existing file in public/)
  if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
    try {
      // compute a worker URL that respects a configured asset prefix
      pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerUrl();
    } catch {
      // Non-fatal: consumer will handle failures. Keep helper resilient.
      console.warn('Failed to set pdfjs workerSrc');
    }
  }

  return pdfjs;
}

export async function ensurePdfWorkerEntry() {
  // Some codepaths rely on the worker entry module default export to register
  // a bundled worker; attempt to import it lazily if needed by callers.
  if (typeof window === 'undefined') return null;
  try {
    const mod = await import('pdfjs-dist/build/pdf.worker.entry');
    return mod && mod.default ? mod.default : mod;
  } catch (err) {
    // Don't fail hard; callers should fallback to loadPdfJs() which sets workerSrc
    console.warn('Could not load pdf.worker.entry dynamically', err);
    return null;
  }
}

/**
 * Dynamically load pdf-lib to keep it out of the main bundle
 * Returns the entire pdf-lib module
 */
export async function loadPdfLib() {
  const pdfLib = await import('pdf-lib');
  return pdfLib;
}
