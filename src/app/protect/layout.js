// Server component layout for /protect route to provide SEO metadata
export const metadata = {
  title: "Protect PDF with Password – Easy PDF Tool",
  description: "Add password protection to your PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF protection. No uploads required.",
  keywords: [
    "Protect PDF", "Password PDF", "Encrypt PDF", "Secure PDF", "PDF security", "Client-side PDF", "Privacy PDF tool", "No upload PDF protection", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/protect"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "Protect PDF with Password – Easy PDF Tool",
    description: "Add password protection to your PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF protection. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/protect",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Protect PDF with Password – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Protect PDF with Password – Easy PDF Tool",
    description: "Add password protection to your PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF protection. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function ProtectLayout({ children }) {
  return children;
}
