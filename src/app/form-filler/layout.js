// Server component layout for /form-filler route to provide SEO metadata
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "PDF Form Filler Online – Easy PDF Tool",
  description:
    "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
  keywords: [
    "PDF form filler",
    "Fill PDF forms",
    "Add text PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF form",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/form-filler",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function FormFillerLayout({ children }) {
  return children;
}