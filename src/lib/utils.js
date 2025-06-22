// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist"; // Ensure this is correctly imported for Node.js environment
// NOTE: pdfjs-dist requires specific configuration for Node.js/server environments if using
// features that would normally rely on workers in a browser. For basic text extraction from
// a Buffer, direct import as shown is typically sufficient without GlobalWorkerOptions.workerSrc
// which is primarily for browser environments.

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts text from a base64 encoded file (PDF, DOCX, or image).
 * This function is intended for use in a server-side (Node.js) environment.
 * @param {string} base64 - Base64 encoded file content.
 * @param {string} name - Original file name, used to determine file type.
 * @returns {Promise<string>} The extracted text content.
 * @throws {Error} If the file type is unsupported or text extraction fails.
 */
export async function extractTextFromFile(base64, name) {
  if (!base64 || !name) {
    throw new Error("File data or name is missing for text extraction.");
  }

  const ext = name.split(".").pop().toLowerCase();
  // Decode base64 to Uint8Array for processing
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  if (["jpg", "jpeg", "png"].includes(ext)) {
    // OCR for images using Tesseract.js (ensure Tesseract is configured for Node.js if necessary)
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(binary, "eng");
      if (!text) {
        throw new Error("No text found in image.");
      }
      return text;
    } catch (e) {
      throw new Error(`Image OCR failed for ${name}: ${e.message}`);
    }
  } else if (ext === "pdf") {
    // Extract text from PDF using pdfjs-dist
    try {
      // For Node.js, `pdfjsLib.getDocument({ data: binary })` can work directly with Uint8Array.
      const pdf = await pdfjsLib.getDocument({ data: binary }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      if (!text.trim()) {
        throw new Error("No readable text found in PDF.");
      }
      return text;
    } catch (e) {
      throw new Error(`PDF text extraction failed for ${name}: ${e.message}`);
    }
  } else if (["doc", "docx"].includes(ext)) {
    // DOCX: Use mammoth.js
    try {
      // Dynamic import for mammoth as it's not always needed and can be large
      const mammoth = await import("mammoth");
      // Convert Uint8Array to Node.js Buffer
      const docxBuffer = Buffer.from(binary);
      const { value } = await mammoth.extractRawText({ buffer: docxBuffer });
      if (!value.trim()) {
        throw new Error("No readable text found in DOCX file.");
      }
      return value;
    } catch (e) {
      throw new Error(
        `DOCX extraction failed for ${name}: ${e.message}. Ensure mammoth is correctly installed and configured for Node.js.`
      );
    }
  } else {
    throw new Error(`Unsupported file type: .${ext} for text extraction.`);
  }
}
