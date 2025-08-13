import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Portfolio Creator - Create Professional PDF Portfolios",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
  keywords: [
  "portfolio creator",
  "PDF portfolio",
  "professional portfolio",
  "resume builder",
  "cv maker",
  "portfolio generator",
  "career portfolio",
  "professional cv"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/portfolio-creator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Portfolio Creator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Portfolio Creator", url: "https://easy-pdf-murex.vercel.app/portfolio-creator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Portfolio Creator",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
  url: "/portfolio-creator",
  features: [
  "Professional portfolio templates",
  "Multiple customizable sections",
  "Experience and education tracking",
  "Skills and projects showcase"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Portfolio Creator", url: "https://easy-pdf-murex.vercel.app/portfolio-creator" }
  ]
});

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
