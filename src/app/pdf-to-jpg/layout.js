// Server component layout for /pdf-to-jpg route to provide SEO metadata
export const metadata = {
  title: "PDF to JPG Converter – Easy PDF Tool",
  description: "Convert PDF pages to JPG images instantly, 100% client-side. Fast, secure, privacy-first PDF to JPG converter. No uploads required.",
  keywords: [
    "PDF to JPG", "PDF to Image", "Convert PDF", "Extract PDF images", "Client-side PDF", "Privacy PDF tool", "No upload PDF to JPG", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/pdf-to-jpg"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "PDF to JPG Converter – Easy PDF Tool",
    description: "Convert PDF pages to JPG images instantly, 100% client-side. Fast, secure, privacy-first PDF to JPG converter. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/pdf-to-jpg",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDF to JPG Converter – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to JPG Converter – Easy PDF Tool",
    description: "Convert PDF pages to JPG images instantly, 100% client-side. Fast, secure, privacy-first PDF to JPG converter. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function PdfToJpgLayout({ children }) {
  return children;
}
