// Server component layout for /compress route to provide SEO metadata
export const metadata = {
  title: "Compress PDF Online – Easy PDF Tool",
  description:
    "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor.",
  keywords: [
    "Compress PDF",
    "PDF compressor",
    "Reduce PDF size",
    "Shrink PDF",
    "Optimize PDF",
    "Free PDF compression",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF compressor",
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
    canonical: "https://easy-pdf-murex.vercel.app/compress",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Compress PDF Online – Easy PDF Tool",
    description:
      "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor.",
    url: "https://easy-pdf-murex.vercel.app/compress",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Compress PDF Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online – Easy PDF Tool",
    description:
      "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function CompressLayout({ children }) {
  return children;
}
