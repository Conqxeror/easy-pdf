// Worker that performs heavy PDF operations using pdf-lib.
// Receives messages of shape: { id, action, buffer, fileName, filesBuffers (array), options }

importScripts && importScripts(); // eslint-disable-line no-undef

// Use ESM import for pdf-lib in worker context
self.addEventListener('message', async (ev) => {
	const { id, action, buffer, filesBuffers, options, fileName } = ev.data || {};
	try {
		const mod = await import('pdf-lib');
		const { PDFDocument, StandardFonts, rgb } = mod;

		async function compressPdfBuffer(buffer) {
			const pdfDoc = await PDFDocument.load(buffer);
			const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
			return { buffer: pdfBytes, originalSize: buffer?.byteLength || 0, compressedSize: pdfBytes?.byteLength || pdfBytes.length };
		}

		async function mergePdfBuffers(buffers) {
			const merged = await PDFDocument.create();
			for (const b of buffers) {
				const pdf = await PDFDocument.load(b);
				const pages = await merged.copyPages(pdf, pdf.getPageIndices());
				pages.forEach((p) => merged.addPage(p));
			}
			const saved = await merged.save();
			return { buffer: saved, totalPages: merged.getPageCount() };
		}

		async function addWatermark(buffer, opts = {}) {
			const { text = 'WATERMARK', opacity = 0.5, fontSize = 50 } = opts;
			const pdfDoc = await PDFDocument.load(buffer);
			const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
			const pages = pdfDoc.getPages();
			for (const page of pages) {
				const { width, height } = page.getSize();
				page.drawText(text, {
					x: width / 2 - (text.length * fontSize) / 4,
					y: height / 2,
					size: fontSize,
					font,
					color: rgb(0.5, 0.5, 0.5),
					opacity
				});
			}
			const saved = await pdfDoc.save();
			return { buffer: saved };
		}

		async function rotatePdf(buffer, opts = {}) {
			const { rotation = 90, pageNumbers = [] } = opts;
			const pdfDoc = await PDFDocument.load(buffer);
			const pages = pdfDoc.getPages();
			if (!pageNumbers || pageNumbers.length === 0) {
				pages.forEach(page => page.setRotation({ angle: rotation }));
			} else {
				pageNumbers.forEach(i => {
					if (i > 0 && i <= pages.length) {
						pages[i - 1].setRotation({ angle: rotation });
					}
				});
			}
			const saved = await pdfDoc.save();
			return { buffer: saved };
		}

		async function extractPages(buffer, opts = {}) {
			const { pageNumbers = [] } = opts;
			const pdf = await PDFDocument.load(buffer);
			const newPdf = await PDFDocument.create();
			for (const num of pageNumbers) {
				if (num > 0 && num <= pdf.getPageCount()) {
					const [copied] = await newPdf.copyPages(pdf, [num - 1]);
					newPdf.addPage(copied);
				}
			}
			const saved = await newPdf.save();
			return { buffer: saved };
		}

		let resultBuffer = null;
		switch (action) {
			case 'compress':
				resultBuffer = await compressPdfBuffer(buffer);
				break;
			case 'merge':
				resultBuffer = await mergePdfBuffers(filesBuffers || [buffer]);
				break;
			case 'watermark':
				resultBuffer = await addWatermark(buffer, options);
				break;
			case 'rotate':
				resultBuffer = await rotatePdf(buffer, options);
				break;
			case 'extract_pages':
				resultBuffer = await extractPages(buffer, options);
				break;
			default:
				throw new Error('Unknown worker action: ' + action);
		}

		// Transfer the resulting ArrayBuffer where possible
		const res = { fileName };
		if (resultBuffer?.buffer) {
			res.buffer = resultBuffer.buffer;
			if (resultBuffer.originalSize) res.originalSize = resultBuffer.originalSize;
			if (resultBuffer.compressedSize) res.compressedSize = resultBuffer.compressedSize;
			if (resultBuffer.totalPages) res.totalPages = resultBuffer.totalPages;
			self.postMessage({ id, result: res }, [res.buffer]);
		} else if (resultBuffer) {
			// Should be an ArrayBuffer
			res.buffer = resultBuffer;
			self.postMessage({ id, result: res }, [res.buffer]);
		} else {
			self.postMessage({ id, result: res });
		}
	} catch (err) {
		self.postMessage({ id, error: err?.message || String(err) });
	}
});
