import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToHtmlClient from "./components/PdfToHtmlClient";

export const metadata = getToolMetadata("/pdf-to-html");

export default function PdfToHtmlPage() {
  return <PdfToHtmlClient />;
}
