import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata from centralized helper
const toolSeo = getToolMetadata('/split');
export const metadata = toolSeo?.metadata || {};

export default function SplitPdfPage() {
  return null;
}