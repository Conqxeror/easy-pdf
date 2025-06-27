import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Word to PDF Converter – Easy PDF Tool",
  description:
    "Convert Word documents to PDF instantly, 100% client-side. Fast, secure, privacy-first Word to PDF converter. No uploads required.",
  keywords: [
    "Word to PDF",
    "Convert Word",
    "DOCX to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload Word to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/word-to-pdf",
});

export default function WordToPdfLayout({ children }) {
  return children;
}
  