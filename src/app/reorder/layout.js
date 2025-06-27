import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Reorder PDF Pages Online – Easy PDF Tool",
  description:
    "Reorder pages in your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page organizer. No uploads required.",
  keywords: [
    "Reorder PDF pages",
    "PDF page order",
    "Organize PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF reorder",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/reorder",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function ReorderLayout({ children }) {
  return children;
}

