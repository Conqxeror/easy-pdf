import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Portfolio Creator - Create Professional PDF Portfolios",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
  keywords: ["portfolio creator", "pdf portfolio", "professional portfolio", "resume builder", "cv maker"],
  canonicalUrl: "/portfolio-creator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Portfolio Creator",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
  url: "/portfolio-creator",
  features: [
    "Professional portfolio templates",
    "Multiple customizable sections",
    "Experience and education tracking",
    "Skills and projects showcase",
    "Custom color schemes",
    "High-quality PDF output"
  ]
});

export default function PortfolioCreatorLayout({ children }) {
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