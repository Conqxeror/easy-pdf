// Server component layout for /ocr route to provide SEO metadata
export const metadata = {
  title: "OCR PDF (Extract Text) – Easy PDF Tool",
  description: "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
  keywords: [
    "OCR PDF", "Extract text PDF", "PDF OCR", "Text recognition PDF", "Client-side PDF", "Privacy PDF tool", "No upload PDF OCR", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/ocr"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "OCR PDF (Extract Text) – Easy PDF Tool",
    description: "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/ocr",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OCR PDF (Extract Text) – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCR PDF (Extract Text) – Easy PDF Tool",
    description: "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function OcrLayout({ children }) {
  return children;
}
