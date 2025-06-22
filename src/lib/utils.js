// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Extract text from PDF, DOCX, or image using tesseract.js and pdfjs-dist
export async function extractTextFromFile(base64, name) {
  const ext = name.split(".").pop().toLowerCase();
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  if (["jpg", "jpeg", "png"].includes(ext)) {
    // OCR for images
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(binary, "eng");
      return text;
    } catch (e) {
      throw new Error(`Image OCR failed: ${e.message}`);
    }
  } else if (ext === "pdf") {
    // Extract text from PDF
    try {
      // Set the workerSrc for pdfjs-dist. This is crucial for it to work.
      // You might need to adjust the path based on where you serve pdf.worker.js
      // If running on server, this might not be strictly necessary or might need a different setup.
      // For Next.js API routes, pdfjs-dist might be used in a Node.js context where worker setup is different.
      // For a purely server-side utility, direct PDF parsing often doesn't need a worker.
      // If this were client-side, it would be: pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const pdf = await pdfjsLib.getDocument({ data: binary }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      return text;
    } catch (e) {
      throw new Error(`PDF text extraction failed: ${e.message}`);
    }
  } else if (["doc", "docx"].includes(ext)) {
    // DOCX: Use mammoth
    try {
      const mammoth = await import("mammoth");
      // For server-side Node.js environment, mammoth typically expects a Node.js Buffer
      // Convert Uint8Array to Node.js Buffer
      const docxBuffer = Buffer.from(binary);
      const { value } = await mammoth.extractRawText({ buffer: docxBuffer }); // Pass as buffer option
      return value;
    } catch (e) {
      // Throw an error if DOCX extraction fails on the server
      throw new Error(
        `DOCX extraction failed: ${e.message}. Ensure mammoth is correctly installed and configured.`
      );
    }
  }
  throw new Error("Unsupported file type for text extraction.");
}
