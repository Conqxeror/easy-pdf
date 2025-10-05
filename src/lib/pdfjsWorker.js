// Lightweight helper to lazily load pdfjs and configure its worker at runtime.
// Goal: keep pdfjs out of the main vendor bundle by dynamically importing it
// only when a PDF is actually opened/processed.
export async function loadPdfJs() {
  // Import the legacy build which exposes getDocument and GlobalWorkerOptions
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf');

  // Configure worker source for the browser runtime (existing file in public/)
  if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    } catch (err) {
      // Non-fatal: consumer will handle failures. Keep helper resilient.
      console.warn('Failed to set pdfjs workerSrc', err);
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
