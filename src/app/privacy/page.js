import PrivacyClient from './PrivacyClient';
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from '@/lib/seoEnhancements';
import { resolveSiteUrl } from '@/lib/siteUrl';

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "Privacy Policy - easy-pdf | Privacy-First PDF Tools",
  description: "Learn how easy-pdf protects your privacy with 100% client-side processing. No server uploads, no data collection, complete privacy and security guaranteed.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "browser-based PDF processing",
    "client-side encryption",
    "data privacy",
    "PDF security",
    "secure PDF tools",
    "no data collection"
  ],
  canonicalUrl: `${siteUrl}/privacy`,
  metadataBaseUrl: siteUrl,
  pageType: "article"
});

const structuredData = generateComprehensiveJsonLd('article', {
  title: "Privacy Policy",
  description: "Learn how easy-pdf protects your privacy with 100% client-side processing.",
  url: `${siteUrl}/privacy`,
});

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PrivacyClient />
    </>
  );
}
