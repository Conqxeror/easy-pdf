import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Portfolio Creator - Create Professional PDF Portfolios | easy-pdf",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects. Free online portfolio maker with no uploads.",
  keywords: [
    "portfolio creator",
    "PDF portfolio",
    "professional portfolio",
    "resume builder",
    "cv maker",
    "portfolio generator",
    "career portfolio",
    "professional cv",
    "free portfolio creator",
    "online portfolio maker",
    "PDF portfolio creator",
    "custom portfolio design",
    "portfolio printing tool",
    "professional portfolio generator",
    "portfolio design tool",
    "batch portfolio creation",
    "portfolio customization",
    "secure portfolio creator",
    "privacy-first portfolio tool",
    "creative portfolio maker"
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
