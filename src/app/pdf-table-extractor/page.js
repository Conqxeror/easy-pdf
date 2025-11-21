import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfTableExtractorClient from "./components/PdfTableExtractorClient";

export const metadata = getToolMetadata("/pdf-table-extractor");

export default function PDFTableExtractorPage() {
  return <PdfTableExtractorClient />;
}
