import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Protect PDF with Password – Easy PDF Tool",
  description:
    "Add password protection to your PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF protection. No uploads required.",
  keywords: [
    "Protect PDF",
    "Password PDF",
    "Encrypt PDF",
    "Secure PDF",
    "PDF security",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF protection",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/protect",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function ProtectLayout({ children }) {
  return children;
}

