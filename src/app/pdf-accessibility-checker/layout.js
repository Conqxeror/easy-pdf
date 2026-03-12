import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-accessibility-checker');
export const metadata = toolSeo?.metadata || {};


export default function PDFAccessibilityCheckerLayout({ children }) {
  return children;
}
