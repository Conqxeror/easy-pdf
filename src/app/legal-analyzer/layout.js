// Server component layout for /legal-analyzer route to provide SEO metadata
export const metadata = {
  title: "Legal Analyzer for PDF – Easy PDF Tool",
  description:
    "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
  keywords: [
    "Legal analyzer PDF",
    "Analyze PDF clauses",
    "PDF legal tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload legal analyzer",
    "Wali Mohammad Kadri",
  ],
  authors: [{ name: "Wali Mohammad Kadri" }],
  applicationName: "easy-pdf",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark",
  creator: "Wali Mohammad Kadri",
  publisher: "Wali Mohammad Kadri",
  category: "DocumentEditor",
  robots: "index,follow",
  alternates: {
    canonical: "https://easy-pdf-murex.vercel.app/legal-analyzer",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Legal Analyzer for PDF – Easy PDF Tool",
    description:
      "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/legal-analyzer",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Legal Analyzer for PDF – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Analyzer for PDF – Easy PDF Tool",
    description:
      "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function LegalAnalyzerLayout({ children }) {
  return children;
}
