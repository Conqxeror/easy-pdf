import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMinifierClient from "./components/HtmlMinifierClient";

export const metadata = getToolMetadata("/html-minifier");

export default function HtmlMinifierPage() {
  return <HtmlMinifierClient />;
}
