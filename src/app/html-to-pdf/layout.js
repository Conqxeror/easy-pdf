// Server component layout for /html-to-pdf route to provide SEO metadata
export const metadata = {
  title: "HTML to PDF Converter – Easy PDF Tool",
  description:
    "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
  keywords: [
    "HTML to PDF",
    "Convert HTML",
    "Webpage to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload HTML to PDF",
    "Wali Mohammad Kadri",
  ],
  authors: [{ name: "Wali Mohammad Kadri" }],
  applicationName: "easy-pdf",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  
  creator: "Wali Mohammad Kadri",
  publisher: "Wali Mohammad Kadri",
  category: "DocumentEditor",
  robots: "index,follow",
  alternates: {
    canonical: "https://easy-pdf-murex.vercel.app/html-to-pdf",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "HTML to PDF Converter – Easy PDF Tool",
    description:
      "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/html-to-pdf",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HTML to PDF Converter – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML to PDF Converter – Easy PDF Tool",
    description:
      "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function HtmlToPdfLayout({ children }) {
  return children;
}