import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfTableExtractorClient from "./components/PdfTableExtractorClient";

export const metadata = getToolMetadata("/pdf-table-extractor").metadata;

export default function PDFTableExtractorPage() {
  return <PdfTableExtractorClient />;
}
