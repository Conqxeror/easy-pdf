import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata = generateEnhancedMetadata({
  title: "About Us - easy-pdf | Privacy-First PDF Toolkit",
  description: "Learn about the mission and vision of easy-pdf, a privacy-first PDF toolkit for everyone. 100% client-side processing ensures your files never leave your device. Committed to security and transparency.",
  keywords: [
    "about easy-pdf", "pdf tools", "privacy-first", "document processing", 
    "client-side PDF processing", "secure PDF tools", "no upload PDF tools",
    "PDF toolkit mission", "PDF tools vision", "privacy-focused PDF tools",
    "secure document processing", "transparent PDF tools", "India PDF tools"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/about",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('about', {
  title: "About Us",
  description: "Learn more about our mission and our commitment to privacy.",
  url: "/about"
});

export default function AboutLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mt-16 sm:mt-20">
        <div className="flex flex-col gap-8">
          <Breadcrumb items={[{ name: "About Us", url: "/about" }]} />
          {children}
        </div>
      </div>
    </>
  );
}