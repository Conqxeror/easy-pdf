import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Compress PDF Online – Easy PDF Tool",
  description:
    "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor.",
  keywords: [
    "Compress PDF",
    "PDF compressor",
    "Reduce PDF size",
    "Shrink PDF",
    "Optimize PDF",
    "Free PDF compression",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF compressor",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/compress",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function CompressLayout({ children }) {
  return children;
}

