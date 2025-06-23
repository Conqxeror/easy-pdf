// Server component layout for /watermark route to provide SEO metadata
export const metadata = {
  title: "Add Watermark to PDF – Easy PDF Tool",
  description:
    "Add text or image watermark to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF watermarking. No uploads required.",
  keywords: [
    "Watermark PDF",
    "Add watermark",
    "PDF watermarking",
    "Text watermark",
    "Image watermark",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF watermark",
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
    canonical: "https://easy-pdf-murex.vercel.app/watermark",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Add Watermark to PDF – Easy PDF Tool",
    description:
      "Add text or image watermark to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF watermarking. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/watermark",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Add Watermark to PDF – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Watermark to PDF – Easy PDF Tool",
    description:
      "Add text or image watermark to your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF watermarking. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function WatermarkLayout({ children }) {
  return children;
}
