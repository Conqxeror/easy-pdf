import { getToolMetadata } from "@/lib/toolSeoHelper";
import MarkdownToHtmlClient from "./components/MarkdownToHtmlClient";

export const metadata = getToolMetadata("/markdown-to-html");

export default function MarkdownToHtmlPage() {
  return <MarkdownToHtmlClient />;
}
