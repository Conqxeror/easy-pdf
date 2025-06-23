// Server component layout for /split route to provide SEO metadata
export const metadata = {
  title: "Split PDF Pages Online – Easy PDF Tool",
  description:
    "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
  keywords: [
    "Split PDF",
    "PDF splitter",
    "Extract PDF pages",
    "Separate PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF splitter",
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
    canonical: "https://easy-pdf-murex.vercel.app/split",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Split PDF Pages Online – Easy PDF Tool",
    description:
      "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/split",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Split PDF Pages Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Pages Online – Easy PDF Tool",
    description:
      "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function SplitLayout({ children }) {
  return children;
}
