import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMinifierClient from "./components/HtmlMinifierClient";

export const metadata = getToolMetadata("/html-minifier").metadata;

export default function HtmlMinifierPage() {
  return <HtmlMinifierClient />;
}
