import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app'
const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

export const metadata = generateEnhancedMetadata({
  title: 'All PDF Tools - easy-pdf | Complete PDF Toolkit',
  description: 'Complete suite of PDF tools organized by category. Merge, split, compress, convert, secure, and edit PDFs with our privacy-first tools. 100% client-side processing with no file uploads.',
  keywords: [
    "PDF tools", "PDF toolkit", "PDF editor", "PDF merger", "PDF splitter", "PDF compressor",
    "PDF converter", "PDF protector", "PDF editor online", "Free PDF tools", "Privacy-first PDF",
    "Client-side PDF processing", "No upload PDF tools", "Secure PDF tools", "Browser-based PDF tools",
    "Online PDF editor", "PDF processing tools", "Document management tools"
  ],
  canonicalUrl: `${siteUrl}/tools`,
  metadataBaseUrl: siteUrl,
});

export default function ToolsLayout({ children }) {
  return <>{children}</>;
}