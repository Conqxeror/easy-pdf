import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToTextClient from "./components/PdfToTextClient";

export const metadata = getToolMetadata("/pdf-to-text").metadata;

export default function PdfToTextPage() {
  return <PdfToTextClient />;
}
