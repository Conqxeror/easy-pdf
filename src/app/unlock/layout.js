import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Unlock PDF (Remove Password) – Easy PDF Tool",
  description:
    "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
  keywords: [
    "Unlock PDF",
    "Remove PDF password",
    "Decrypt PDF",
    "PDF unlocker",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF unlock",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/unlock",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function UnlockLayout({ children }) {
  return children;
}

