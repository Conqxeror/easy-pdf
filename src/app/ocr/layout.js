import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "OCR PDF (Extract Text) – Easy PDF Tool",
  description:
    "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
  keywords: [
    "OCR PDF",
    "Extract text PDF",
    "PDF OCR",
    "Text recognition PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF OCR",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/ocr",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function OcrLayout({ children }) {
  return children;
}

