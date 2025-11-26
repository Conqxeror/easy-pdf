import { getToolMetadata } from "@/lib/toolSeoHelper";
import MarkdownPreviewerClient from "./components/MarkdownPreviewerClient";

export const metadata = getToolMetadata("/markdown-previewer").metadata;

export default function MarkdownPreviewerPage() {
  return <MarkdownPreviewerClient />;
}
