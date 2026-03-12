import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import Breadcrumb from "@/components/ui/Breadcrumb";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app'
const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

export const metadata = generateEnhancedMetadata({
  title: "About Us - easy-pdf | Privacy-First PDF Toolkit",
  description: "Learn about the mission and vision of easy-pdf, a privacy-first PDF toolkit for everyone. 100% client-side processing ensures your files never leave your device. Committed to security and transparency.",
  keywords: [
    "about easy-pdf", "pdf tools", "privacy-first", "document processing",
    "client-side PDF processing", "secure PDF tools", "no upload PDF tools",
    "PDF toolkit mission", "PDF tools vision", "privacy-focused PDF tools",
    "secure document processing", "transparent PDF tools", "India PDF tools"
  ],
  canonicalUrl: `${siteUrl}/about`,
  metadataBaseUrl: siteUrl
});

export default function AboutLayout({ children }) {
  return (
    <>
      <div className="mt-16 sm:mt-20">
        <div className="flex flex-col gap-8">
          <div className="container-standard mb-6">
            <Breadcrumb items={[{ name: "About Us", url: "/about" }]} />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}