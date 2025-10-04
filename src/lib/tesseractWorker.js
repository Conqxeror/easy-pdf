// Lightweight helper to lazily load tesseract and manage worker lifecycle
let _cachedCreateWorker = null;

export async function createTesseractWorker(lang = 'eng', cores = 1, options = {}) {
  // Lazy-load tesseract.js only when needed (keeps it out of initial bundles)
  if (!_cachedCreateWorker) {
    const mod = await import('tesseract.js');
    // `createWorker` may be exported as default or named depending on package version
    _cachedCreateWorker = mod.createWorker || (mod.default && mod.default.createWorker) || null;
    if (!_cachedCreateWorker) {
      throw new Error('createWorker not found on tesseract.js import');
    }
  }

  // Create a worker instance via the library-provided factory
  const worker = await _cachedCreateWorker(lang, cores, options);
  return worker;
}

export async function terminateWorker(worker) {
  try {
    if (worker && typeof worker.terminate === 'function') {
      await worker.terminate();
    }
  } catch (e) {
    // swallow termination errors — best-effort cleanup
    console.warn('Failed to terminate worker:', e);
  }
}
