const ensurePdfLib = async () => {
	if (typeof window === "undefined") {
		const mod = await import("pdf-lib");
		return mod;
	}
	const mod = await import("pdf-lib");
	return mod;
};

const cleanString = (value) => {
	if (value === null || value === undefined) return "";
	return String(value).trim();
};

export const defaultMetadataState = {
	title: "",
	author: "",
	subject: "",
	keywords: "",
	creator: "",
	producer: "",
	creationDate: "",
	modificationDate: ""
};

export async function readPdfMetadata(fileOrBuffer) {
	let inputBuffer = null;
	if (fileOrBuffer instanceof ArrayBuffer) {
		inputBuffer = fileOrBuffer;
	} else if (fileOrBuffer?.buffer instanceof ArrayBuffer && fileOrBuffer.BYTES_PER_ELEMENT) {
		inputBuffer = fileOrBuffer.buffer;
	} else if (fileOrBuffer?.arrayBuffer) {
		inputBuffer = await fileOrBuffer.arrayBuffer();
	} else {
		throw new Error("Unsupported input for PDF metadata reader.");
	}
	const { PDFDocument } = await ensurePdfLib();
	const pdfDoc = await PDFDocument.load(inputBuffer);

	const creationDate = pdfDoc.getCreationDate?.();
	const modificationDate = pdfDoc.getModificationDate?.();
	const keywords = pdfDoc.getKeywords?.();

	return {
		title: cleanString(pdfDoc.getTitle?.()),
		author: cleanString(pdfDoc.getAuthor?.()),
		subject: cleanString(pdfDoc.getSubject?.()),
		keywords: Array.isArray(keywords) ? keywords.join(", ") : cleanString(keywords),
		creator: cleanString(pdfDoc.getCreator?.()),
		producer: cleanString(pdfDoc.getProducer?.()),
		creationDate: creationDate instanceof Date ? creationDate.toISOString() : "",
		modificationDate: modificationDate instanceof Date ? modificationDate.toISOString() : ""
	};
}

export async function updatePdfMetadata(file, updates = {}) {
	if (!file) throw new Error("Select a PDF before editing metadata.");
	const { PDFDocument } = await ensurePdfLib();
	const buffer = await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(buffer);

	const applyString = (setter, value) => {
		if (!setter) return;
		const cleaned = cleanString(value);
		if (cleaned) {
			setter.call(pdfDoc, cleaned);
		} else {
			setter.call(pdfDoc, "");
		}
	};

	if (Object.prototype.hasOwnProperty.call(updates, "title")) {
		applyString(pdfDoc.setTitle, updates.title);
	}
	if (Object.prototype.hasOwnProperty.call(updates, "author")) {
		applyString(pdfDoc.setAuthor, updates.author);
	}
	if (Object.prototype.hasOwnProperty.call(updates, "subject")) {
		applyString(pdfDoc.setSubject, updates.subject);
	}

	if (pdfDoc.setKeywords && Object.prototype.hasOwnProperty.call(updates, "keywords")) {
		const keywords = cleanString(updates.keywords)
			.split(",")
			.map((keyword) => keyword.trim())
			.filter(Boolean);
		pdfDoc.setKeywords(keywords.length ? keywords : []);
	}

	if (Object.prototype.hasOwnProperty.call(updates, "creator")) {
		applyString(pdfDoc.setCreator, updates.creator);
	}
	if (Object.prototype.hasOwnProperty.call(updates, "producer")) {
		applyString(pdfDoc.setProducer, updates.producer);
	}

	if (pdfDoc.setCreationDate && updates.creationDate) {
		const created = new Date(updates.creationDate);
		if (!Number.isNaN(created.getTime())) {
			pdfDoc.setCreationDate(created);
		}
	}

	if (pdfDoc.setModificationDate) {
		const modified = updates.modificationDate ? new Date(updates.modificationDate) : new Date();
		if (!Number.isNaN(modified.getTime())) {
			pdfDoc.setModificationDate(modified);
		}
	}

	const pdfBytes = await pdfDoc.save();
	const blob = new Blob([pdfBytes], { type: "application/pdf" });
	const metadata = await readPdfMetadata(pdfBytes);
	return { blob, metadata };
}
