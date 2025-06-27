import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Sign PDF Online – Easy PDF Tool",
  description:
    "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
  keywords: [
    "Sign PDF",
    "Annotate PDF",
    "PDF signature",
    "PDF signing tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF sign",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sign",
});

export default function SignLayout({ children }) {
  return children;
}

