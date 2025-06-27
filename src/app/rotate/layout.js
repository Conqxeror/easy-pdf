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
});

export default function RotateLayout({ children }) {
  return children;
}

