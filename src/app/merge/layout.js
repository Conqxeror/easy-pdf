import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Merge PDF Files Online – Easy PDF Tool",
  description:
    "Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone.",
  keywords: [
    "Merge PDF",
    "Combine PDF",
    "PDF merger",
    "Join PDF",
    "PDF tools",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF merger",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/merge",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function MergeLayout({ children }) {
  return children;
}


