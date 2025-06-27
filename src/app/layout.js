import ClientLayout from "./ClientLayout";
import { generateMetadata } from "@/lib/metadata";



export const metadata = generateMetadata({
  title: "easy-pdf - Free Online PDF Tools",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  keywords: "PDF, Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Free PDF Tools, India",
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "easy-pdf",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  url: "https://easy-pdf-murex.vercel.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      import { SpeedInsights } from "@vercel/speed-insights/next";

      <body>
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}