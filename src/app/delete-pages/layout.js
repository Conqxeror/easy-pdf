// Server component layout for /delete-pages route to provide SEO metadata
export const metadata = {
  title: "Delete PDF Pages Online – Easy PDF Tool",
  description:
    "Delete pages from your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
  keywords: [
    "Delete PDF pages",
    "Remove PDF pages",
    "PDF editor",
    "PDF page remover",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF delete",
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
    canonical: "https://easy-pdf-murex.vercel.app/delete-pages",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Delete PDF Pages Online – Easy PDF Tool",
    description:
      "Delete pages from your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/delete-pages",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Delete PDF Pages Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delete PDF Pages Online – Easy PDF Tool",
    description:
      "Delete pages from your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function DeletePagesLayout({ children }) {
  return children;
}