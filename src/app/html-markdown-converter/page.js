import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMarkdownConverterClient from "./components/HtmlMarkdownConverterClient";

export const metadata = getToolMetadata("/html-markdown-converter");

export default function HtmlMarkdownConverterPage() {
  return <HtmlMarkdownConverterClient />;
}
