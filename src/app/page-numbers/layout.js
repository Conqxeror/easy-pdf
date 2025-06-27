import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Add Page Numbers to PDF – Easy PDF Tool",
  description:
    "Add page numbers, headers, and footers to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF numbering. No uploads required.",
  keywords: [
    "Add page numbers PDF",
    "PDF numbering",
    "Header footer PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF numbering",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/page-numbers",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function PageNumbersLayout({ children }) {
  return children;
}

