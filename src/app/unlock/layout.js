// Server component layout for /unlock route to provide SEO metadata
export const metadata = {
  title: "Unlock PDF (Remove Password) – Easy PDF Tool",
  description: "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
  keywords: [
    "Unlock PDF", "Remove PDF password", "Decrypt PDF", "PDF unlocker", "Client-side PDF", "Privacy PDF tool", "No upload PDF unlock", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/unlock"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "Unlock PDF (Remove Password) – Easy PDF Tool",
    description: "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/unlock",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Unlock PDF (Remove Password) – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock PDF (Remove Password) – Easy PDF Tool",
    description: "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function UnlockLayout({ children }) {
  return children;
}
