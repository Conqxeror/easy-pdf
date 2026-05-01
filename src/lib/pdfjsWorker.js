// Lightweight helper to lazily load pdfjs and configure its worker at runtime.
// Goal: keep pdfjs out of the main vendor bundle by dynamically importing it
// only when a PDF is actually opened/processed.
export function getPdfWorkerUrl() {
  // compute worker URL from environment or runtime config.
  // Prefer Next's public env var or __NEXT_DATA__ assetPrefix when available.
  try {
    if (typeof window === 'undefined') {
      return '/pdf.worker.min.mjs';
    }

    // In browser: resolve from assetPrefix or NEXT_PUBLIC_ASSET_PREFIX
    const assetPrefix = (window.__NEXT_DATA__ && window.__NEXT_DATA__.assetPrefix) || process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
    const prefix = (typeof assetPrefix === 'string' && assetPrefix.length > 0) ? assetPrefix.replace(/\/$/, '') : '';
    return `${prefix}/pdf.worker.min.mjs`;
  } catch {
    return '/pdf.worker.min.mjs';
  }
}

export async function loadPdfJs() {
  // Import the legacy build which exposes getDocument and GlobalWorkerOptions
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

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
  return getPdfWorkerUrl();
}

/**
 * Dynamically load pdf-lib to keep it out of the main bundle
 * Returns the entire pdf-lib module
 */
export async function loadPdfLib() {
  const pdfLib = await import('pdf-lib');
  return pdfLib;
}
