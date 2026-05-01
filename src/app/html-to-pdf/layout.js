import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolSeo = getToolMetadata('/html-to-pdf');
export const metadata = toolSeo?.metadata || {};

export default function HtmlToPdfLayout({ children }) {
  return children;
}
