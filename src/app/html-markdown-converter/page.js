import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMarkdownConverterClient from "./components/HtmlMarkdownConverterClient";

export const metadata = getToolMetadata("/html-markdown-converter").metadata;

export default function HtmlMarkdownConverterPage() {
  return <HtmlMarkdownConverterClient />;
}
