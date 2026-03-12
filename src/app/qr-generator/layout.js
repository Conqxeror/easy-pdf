import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/qr-generator');
export const metadata = toolSeo?.metadata || {};


export default function Layout({ children }) {
  return children;
}
