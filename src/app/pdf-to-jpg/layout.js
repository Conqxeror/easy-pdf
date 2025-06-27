import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "PDF to JPG Converter – Easy PDF Tool",
  description:
    "Convert PDF pages to JPG images instantly, 100% client-side. Fast, secure, privacy-first PDF to JPG converter. No uploads required.",
  keywords: [
    "PDF to JPG",
    "PDF to Image",
    "Convert PDF",
    "Extract PDF images",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to JPG",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-jpg",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function PdfToJpgLayout({ children }) {
  return children;
}

