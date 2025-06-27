import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "PDF to Word Converter – Easy PDF Tool",
  description:
    "Convert PDF documents to Word instantly, 100% client-side. Fast, secure, privacy-first PDF to Word converter. No uploads required.",
  keywords: [
    "PDF to Word",
    "Convert PDF",
    "PDF to DOCX",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to Word",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-word",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function PdfToWordLayout({ children }) {
  return children;
}
  