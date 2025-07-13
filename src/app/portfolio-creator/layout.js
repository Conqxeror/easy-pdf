import { generateMetadata as generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata({
  title: "Portfolio Creator - Create Professional PDF Portfolios",
  description: "Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.",
  keywords: ["portfolio creator", "pdf portfolio", "professional portfolio", "resume builder", "cv maker"],
  canonicalUrl: "/portfolio-creator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

export default function PortfolioCreatorLayout({ children }) {
  return children;
}