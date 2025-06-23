// Server component layout for /reorder route to provide SEO metadata
export const metadata = {
  title: "Reorder PDF Pages Online – Easy PDF Tool",
  description: "Reorder pages in your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page organizer. No uploads required.",
  keywords: [
    "Reorder PDF pages", "PDF page order", "Organize PDF", "PDF editor", "Client-side PDF", "Privacy PDF tool", "No upload PDF reorder", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/reorder"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "Reorder PDF Pages Online – Easy PDF Tool",
    description: "Reorder pages in your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page organizer. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/reorder",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Reorder PDF Pages Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reorder PDF Pages Online – Easy PDF Tool",
    description: "Reorder pages in your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page organizer. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function ReorderLayout({ children }) {
  return children;
}
