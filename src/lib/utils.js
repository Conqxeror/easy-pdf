// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import Link from "next/link";

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
      // Dynamic import for server-side compatibility
      const Tesseract = await import("tesseract.js");
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
      // Dynamic import for server-side compatibility
      const pdfjsLib = await import("pdfjs-dist");
      
      // Configure worker for server environment
      if (typeof window === 'undefined') {
        try {
          const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.js');
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
        } catch {
          // Fallback to CDN worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
      }
      
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

// Helper function to render text with dynamic links for tool names
export const renderTextWithToolLinks = (text) => {
  // For server-side rendering, just return the text without links
  if (typeof window === 'undefined') {
    return text;
  }
  
  try {
    // Use dynamic import instead of require for consistency
    const { toolsData } = require('./toolData');
    const parts = [];
    let lastIndex = 0;

    // Create a map from toolsData for easy lookup
    const toolsMap = toolsData.reduce((acc, tool) => {
      acc[tool.title] = tool.href;
      return acc;
    }, {});

    // Iterate over each tool in the map
    Object.entries(toolsMap).forEach(([toolName, href]) => {
      // Use a regular expression to find all occurrences of the tool name
      const regex = new RegExp(`\\b${toolName}\\b`, "gi");
      let match;

      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = regex.lastIndex;

        // Add the text before the current match
        if (startIndex > lastIndex) {
          parts.push(text.substring(lastIndex, startIndex));
        }

        // Add the Link component for the tool name
        parts.push(
          React.createElement(Link, {
            key: `${toolName}-${startIndex}`,
            href: href,
            className: "text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
          }, toolName)
        );
        lastIndex = endIndex;
      }
    });

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // If no tools were found, return the original text wrapped in a span
    if (parts.length === 0) {
      return React.createElement('span', {}, text);
    }

    return parts;
  } catch {
    // Fallback to plain text if there's an error
    return text;
  }
};

/**
 * Formats file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}