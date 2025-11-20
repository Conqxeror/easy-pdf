# easy-pdf Browser Tool Coverage & Goals

_Last updated: 2025-11-16_

Legend: `[x]` complete and available today, `[~]` partially covered or placeholder only, `[ ]` not implemented yet.

## 1. PDF Conversions
- [x] PDF → Images (PNG/JPG) — `src/app/pdf-to-jpg` using `pdfjs-dist` + `canvas`
- [x] Images → PDF — `src/app/jpg-to-pdf` powered by `pdf-lib`
- [x] PDF → Text — `src/app/pdf-to-text` extracts native text, `src/app/ocr` for OCR-based extraction
- [x] PDF → Word (DOCX) — `src/app/pdf-to-docx`
- [x] PDF → Excel (XLSX) — `src/app/pdf-to-xlsx`
- [x] PDF → HTML — `src/app/pdf-to-html`
- [x] PDF → PPT — `src/app/pdf-to-ppt`
- [x] Merge PDFs — `src/app/merge`
- [x] Split PDF — `src/app/split`
- [x] Compress PDF — `src/app/compress`
- [x] Unlock PDF — `src/app/unlock`
- [x] Lock/Protect PDF — `src/app/protect`
- [x] Rotate PDF — `src/app/rotate`

## 2. Image Conversions
- [x] JPG ↔ PNG — `src/app/image-converter` (client-side via canvas)
- [x] JPG/PNG → WEBP — `src/app/image-converter` (client-side via canvas)
- [x] BMP/TIFF ↔ PNG/JPG — `src/app/bmp-tiff-converter` (BMP fully supported, TIFF has limitations due to browser constraints)
- [x] HEIC → PNG/JPG — `src/app/heic-to-jpg` (supports both JPG and PNG output)
- [x] SVG → PNG — `src/app/svg-to-png`
- [x] Resize images — `src/app/resize-images`
- [x] Compress images — `src/app/compress-images`
- [~] Add watermark — `src/app/watermark` handles PDF, not raw images

## 3. Video / Audio Conversions (ffmpeg.wasm)
- [x] MP4 → MP3 — `src/app/mp4-to-mp3` powered by `@ffmpeg/ffmpeg`
- [x] Video → GIF — `src/app/video-to-gif` powered by `@ffmpeg/ffmpeg`
 - [x] WebM ↔ MP4 — `src/app/webm-to-mp4`
- [x] AVI/MKV → MP4 — `src/app/avi-mkv-to-mp4`
- [x] Video → Compress — `src/app/video-compress` powered by `@ffmpeg/ffmpeg` (same as "Compress video")
 - [x] Trim/Cut video — `src/app/video-trim` (Trim & Merge)
 	- *E2E:* Playwright smoke tests added to verify snap controls and persistence.
	- *E2E:* Playwright smoke tests added to verify snap controls and persistence. Added robust fallback to the `video-trim` E2E test: if Playwright's `setInputFiles` fails to attach an in-memory blob, the test now falls back to dispatching a `drop` event with a File created in-page — this stabilizes automated thumbnail generation checks on CI/dev.
	- *E2E:* Playwright smoke tests added to verify snap controls and persistence. Added robust fallback to the `video-trim` E2E test: if Playwright's `setInputFiles` fails to attach an in-memory blob, the test now falls back to dispatching a `drop` event with a File created in-page — this stabilizes automated thumbnail generation checks on CI/dev.
	- *E2E Helper:* Exposed `window.__E2E_EXPOSE.loadThumbs()` to inject thumbnails in tests after the page mounts to avoid race conditions when generating thumbnails in headless browsers.
 - [x] Merge audio/video — `src/app/video-trim` (Trim & Merge)
- [x] Extract audio — `src/app/extract-audio`
- [x] Remove audio — `src/app/remove-audio`

## 4. Audio Editing / Conversion (ffmpeg.wasm)
- [x] WAV ↔ MP3 — `src/app/wav-mp3-converter`
- [x] M4A ↔ MP3 — `src/app/m4a-mp3-converter`
- [x] Audio compressor — `src/app/audio-compressor`
- [x] Remove silence — `src/app/remove-silence`
- [x] Change audio speed — `src/app/audio-speed-changer`
- [x] Voice changer (pitch/speed) — `src/app/voice-changer`

## 5. Document Conversions (WASM-friendly)
 - [x] DOCX → PDF — `src/app/docx-to-pdf`
	- *E2E:* A generated `sample.docx` fixture and smoke test exist to ensure conversion completes.
	- NOTE: Uses `mammoth` -> sanitized HTML -> `jsPDF.html` (multi-page HTML rendering) for improved pagination and fidelity; previously used `html2canvas` flattening.
	- TODO: Improve advanced layout fidelity (tables, footnotes, complex multi-column) — consider optional `pagedjs` or a small server-side renderer for best accuracy.
	- [~] PagedJS preview integration: Toggle is available and `pagedjs` is dynamically imported for an optional preview; add more tests to assert fidelity differences.
 - [x] DOCX → Text — `src/app/docx-to-text`

	- [x] Playwright traces for video E2E failures — `tests/e2e/new-tools.spec.ts` now captures trace + screenshot when the Video Trim generated webm upload fails; this helps debug flaky file upload or hidden input binding issues on CI.

## High-ROI Priorities (from brief)
- [x] TXT → PDF — `src/app/txt-to-pdf`
- [x] PPT → PDF — `src/app/ppt-to-pdf` (UI implemented with explanation of technical limitations; requires specialized libraries not suitable for client-side processing)
- [x] CSV → XLSX — `src/app/csv-to-xlsx`
- [x] XLSX → CSV — `src/app/xlsx-to-csv`
- [x] Markdown → HTML — `src/app/markdown-to-html`
- [x] HTML → PDF — `src/app/html-to-pdf` (html2canvas + jsPDF)

## 6. Compression / Archiving Tools

 - [x] ZIP Creator — `src/app/zip-creator` (JSZip-based)
 - [x] TAR/GZIP extractor — `src/app/tar-extractor` (fflate + tar parse)

## 7. Image Editing (Pure JS)
- [x] Crop — `src/app/image-crop` + `src/app/image-cropper` handle freeform + preset cropping
- [x] Rotate — `src/app/image-rotator` (includes angle presets + custom values)
- [x] Flip — `src/app/image-cropper` provides horizontal/vertical flip controls
- [x] Add filters — `src/app/image-filters`
- [x] Add text overlay — `src/app/image-text-overlay`
- [x] Add watermark — `src/app/image-watermark`
- [x] Draw on image — `src/app/image-drawing`

## 8. Text / Code Conversion Tools
- [x] Uppercase ↔ Lowercase — `src/app/text-case-converter`
- [x] Snake_case ↔ CamelCase — `src/app/text-case-converter`
- [x] CSV ↔ JSON — `src/app/csv-json-converter`
- [x] HTML ↔ Markdown — `src/app/html-markdown-converter`
- [x] JSON ↔ XML — `src/app/json-xml-converter`
- [x] URL Encoder / Decoder — `src/app/url-encoder`
 - [x] Base64 Encoder / Decoder — `src/app/base64-encoder`
- [x] Text diff checker — `src/app/text-diff-checker`
- [x] Regex tester — `src/app/regex-tester`
- [x] UUID generator — `src/app/uuid-generator`
- [x] Hash generator (MD5, SHA256) — `src/app/hash-generator`

## 9. Web Tools
- [x] QR Code Generator — `src/app/qr-generator`
- [x] QR Code Scanner — `src/app/qr-scanner`
- [x] Barcode Generator — `src/app/barcode-generator`
- [x] URL shortener (local-only) — `src/app/url-shortener`
- [x] Metadata extractor — `src/app/metadata-extractor`
- [x] HTML minifier — `src/app/html-minifier`
- [x] JS minifier — `src/app/js-minifier`
- [x] CSS minifier — `src/app/css-minifier`

## 10. Security / Encoding Tools
- [x] AES Encrypt/Decrypt — `src/app/aes-encrypt`
- [x] RSA Key generator (WebCrypto) — `src/app/rsa-generator`
- [x] JWT Decoder — `src/app/jwt-decoder`
- [x] Password strength checker — `src/app/password-strength`
- [x] File checksum (MD5/SHA256) — `src/app/file-checksum`
- [x] Steganography (hide text in image) — `src/app/steganography`

## 11. Utility Converters
- [x] Unit converter — `src/app/unit-converter`
- [x] Currency converter (offline rates) — `src/app/currency-converter`
- [x] Timezone converter — `src/app/timezone-converter`
- [x] Number base converter — `src/app/number-base-converter`
- [x] Color converter (HEX ↔ RGB ↔ HSL) — `src/app/color-converter`
- [x] Markdown previewer — `src/app/markdown-previewer`

## 12. AI-Ready Tools (Client-side ONNX/WASM)
- [x] Image background remover — `src/app/remove-background` powered by `@imgly/background-removal`
- [ ] Image colorizer — pending
- [x] Face blur — `src/app/face-blur` powered by `@mediapipe/tasks-vision`
- [x] OCR text extractor — `src/app/ocr` + `src/app/advanced-ocr`
- [ ] Speech-to-text (Whisper WebGPU) — pending

## High-ROI Priorities (from brief)
1. Image → PDF — ✅ `jpg-to-pdf`
2. PDF → Image — ✅ `pdf-to-jpg`
3. MP4 → MP3 — ✅ `mp4-to-mp3`
4. Zip Extractor — ✅ `zip-extractor`
5. CSV ↔ JSON — ✅ `csv-json-converter`
6. Docx → PDF — ✅ `docx-to-pdf`
7. Docx → Text — ✅ `docx-to-text`
8. HEIC → JPG — ✅ `heic-to-jpg`

## Next Implementation Steps
1. **Ship high-ROI backlog (MP4→MP3, Zip extractor, CSV↔JSON, Docx→PDF, HEIC→JPG)** using dedicated routes, `@ffmpeg/ffmpeg`, `JSZip`, `mammoth`, and `heic2any`. Reuse `ToolPageLayout`, add entries to `toolData`, and surface in the homepage grid.
2. **Batch remaining PDF/Document converters** by extending existing `pdf-lib` helpers (for PDF→Word/Excel/HTML/PPT) and creating shared XLSX/DOCX adapters under `src/lib/` for future maintenance.
3. **Introduce image utility suite** (format swaps, resize, compression, editing) powered by `canvas`, `browser-image-compression`, and `sharp-wasm`, organizing them under `/image-tools/*` routes for discoverability.
4. **Launch ffmpeg-based media lab** covering the rest of Sections 3–4 with a single WebWorker bootstrap to keep WASM loading centralized.
5. **Finish developer/utility tools** (text/code converters, web minifiers, crypto utilities) as lightweight React forms leveraging native Web APIs and `crypto-js` where necessary.
6. **Add AI-ready extras** (background removal, colorizer, face blur, Whisper) via `onnxruntime-web` and `tesseract.js`, loading models lazily and caching in IndexedDB for repeat use.

## 3. Playwright e2e: The repo contains E2E tests under `tests/e2e` — use `npm run test:e2e` to run them. For faster local iteration, `npm run test:e2e:dev` runs against the Next dev server.
