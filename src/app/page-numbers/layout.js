// Server component layout for /page-numbers route to provide SEO metadata
export const metadata = {
  title: "Add Page Numbers to PDF – Easy PDF Tool",
  description: "Add page numbers, headers, and footers to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF numbering. No uploads required.",
  keywords: [
    "Add page numbers PDF", "PDF numbering", "Header footer PDF", "PDF editor", "Client-side PDF", "Privacy PDF tool", "No upload PDF numbering", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/page-numbers"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "Add Page Numbers to PDF – Easy PDF Tool",
    description: "Add page numbers, headers, and footers to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF numbering. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/page-numbers",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Add Page Numbers to PDF – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF – Easy PDF Tool",
    description: "Add page numbers, headers, and footers to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF numbering. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function PageNumbersLayout({ children }) {
  return children;
}
