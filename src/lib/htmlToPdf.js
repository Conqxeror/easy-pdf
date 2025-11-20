let html2canvasPromise = null;
let jsPdfPromise = null;

const PAGE_SIZES = {
	"a4": "a4",
	"letter": "letter",
	"legal": "legal"
};

const sanitizeMargin = (margin) => {
	const numeric = Number.isFinite(margin) ? margin : 24;
	return Math.min(Math.max(numeric, 0), 144);
};

const loadHtml2Canvas = async () => {
	if (!html2canvasPromise) {
		html2canvasPromise = import("html2canvas");
	}
	const html2canvasModule = await html2canvasPromise;
	return html2canvasModule.default || html2canvasModule;
};

const loadJsPdf = async () => {
	if (!jsPdfPromise) {
		jsPdfPromise = import("jspdf");
	}
	const jsPdfModule = await jsPdfPromise;
	return jsPdfModule.jsPDF || jsPdfModule.default || jsPdfModule;
};

/**
 * Convert an HTML string into a PDF Blob entirely in the browser.
 * @param {object} params
 * @param {string} params.html - Sanitized HTML markup that will be rendered.
 * @param {string} [params.pageSize="a4"] - Standard page size supported by jsPDF.
 * @param {"portrait"|"landscape"} [params.orientation="portrait"] - Page orientation.
 * @param {number} [params.margin=24] - Margin in points applied to every side.
 * @param {number} [params.scale=1.5] - Rendering scale applied to html2canvas for sharper output.
 * @returns {Promise<{ blob: Blob, stats: { width: number, height: number, pageSize: string } }>}
 */
export async function convertHtmlToPdf({
	html = "",
	pageSize = "a4",
	orientation = "portrait",
	margin = 24,
	scale = 1.5
} = {}) {
	if (typeof window === "undefined") {
		throw new Error("HTML to PDF conversion only runs in the browser.");
	}

	const sanitizedHtml = typeof html === "string" ? html : "";
	if (!sanitizedHtml.trim()) {
		throw new Error("Please provide HTML content to convert.");
	}

	const [html2canvas, jsPDF] = await Promise.all([loadHtml2Canvas(), loadJsPdf()]);

	const hiddenHost = document.createElement("div");
	hiddenHost.style.position = "fixed";
	hiddenHost.style.left = "-9999px";
	hiddenHost.style.top = "0";
	hiddenHost.style.width = "794px";
	hiddenHost.style.padding = "0";
	hiddenHost.style.margin = "0";
	hiddenHost.style.background = "white";
	hiddenHost.innerHTML = sanitizedHtml;
	document.body.appendChild(hiddenHost);

	try {
		const canvas = await html2canvas(hiddenHost, {
			backgroundColor: "#ffffff",
			letterRendering: true,
			useCORS: true,
			scale: scale >= 1 ? scale : 1.25
		});

		const pdf = new jsPDF({
			orientation: orientation === "landscape" ? "landscape" : "portrait",
			unit: "pt",
			format: PAGE_SIZES[pageSize?.toLowerCase?.()] || PAGE_SIZES.a4
		});

		const imgData = canvas.toDataURL("image/png");
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const maxWidth = pageWidth - sanitizeMargin(margin) * 2;
		const maxHeight = pageHeight - sanitizeMargin(margin) * 2;
		const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
		const renderWidth = canvas.width * ratio;
		const renderHeight = canvas.height * ratio;

		pdf.addImage(
			imgData,
			"PNG",
			(pageWidth - renderWidth) / 2,
			(pageHeight - renderHeight) / 2,
			renderWidth,
			renderHeight,
			undefined,
			"FAST"
		);

		const blob = pdf.output("blob");
		return {
			blob,
			stats: {
				width: canvas.width,
				height: canvas.height,
				pageSize: pdf.internal.pageSize.getWidth() + "x" + pdf.internal.pageSize.getHeight()
			}
		};
	} finally {
		document.body.removeChild(hiddenHost);
	}
}
