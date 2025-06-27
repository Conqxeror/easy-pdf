import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Organize PDF Pages Online – Easy PDF Tool",
  description:
    "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
  keywords: [
    "Organize PDF",
    "PDF organizer",
    "Reorder PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF organize",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/organize",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function OrganizeLayout({ children }) {
  return children;
}

