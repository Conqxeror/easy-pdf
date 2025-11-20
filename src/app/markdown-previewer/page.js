import { getToolMetadata } from "@/lib/toolSeoHelper";
import MarkdownPreviewerClient from "./components/MarkdownPreviewerClient";

export const metadata = getToolMetadata("/markdown-previewer");

export default function MarkdownPreviewerPage() {
  return <MarkdownPreviewerClient />;
}
