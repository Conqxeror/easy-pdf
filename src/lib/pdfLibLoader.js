// Lightweight central loader for pdf-lib to keep it out of the initial bundle.
let _pdfLib = null;
export async function getPdfLib() {
  if (_pdfLib) return _pdfLib;
  const mod = await import('pdf-lib');
  _pdfLib = {
    PDFDocument: mod.PDFDocument || mod.default?.PDFDocument,
    rgb: mod.rgb || (mod.default && mod.default.rgb),
    degrees: mod.degrees || (mod.default && mod.default.degrees),
    StandardFonts: mod.StandardFonts || (mod.default && mod.default.StandardFonts)
  };
  return _pdfLib;
}

export default getPdfLib;
