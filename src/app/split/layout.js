import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Split PDF Pages Online – Easy PDF Tool",
  description:
    "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
  keywords: [
    "Split PDF",
    "PDF splitter",
    "Extract PDF pages",
    "Separate PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF splitter",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/split",
});

export default function SplitLayout({ children }) {
  return children;
}

