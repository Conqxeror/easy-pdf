const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function createSamplePdf(path, text) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([600, 400]);
	const { width, height } = page.getSize();
	const fontSize = 24;
	page.drawText(text || 'Sample PDF', {
		x: 50,
		y: height - 4 * fontSize,
		size: fontSize,
	});
	const pdfBytes = await pdfDoc.save();
	fs.writeFileSync(path, pdfBytes);
}

(async () => {
	try {
		fs.mkdirSync('tests/fixtures', { recursive: true });
		await createSamplePdf('tests/fixtures/sample1.pdf', 'E2E Sample 1');
		await createSamplePdf('tests/fixtures/sample2.pdf', 'E2E Sample 2');
		console.log('E2E fixtures created');
	} catch (err) {
		console.error('Failed to create e2e fixtures', err);
		process.exit(1);
	}
})();
