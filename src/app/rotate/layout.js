import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Rotate PDF Pages Online – Easy PDF Tool",
  description:
    "Rotate PDF pages instantly and securely, 100% client-side. Fast, privacy-first PDF rotation tool. No uploads required.",
  keywords: [
    "Rotate PDF",
    "PDF rotation",
    "Rotate pages",
    "PDF tools",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF rotate",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/rotate",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function RotateLayout({ children }) {
  return children;
}

