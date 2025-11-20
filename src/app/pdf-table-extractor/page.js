import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFTableExtractorClient from "./components/PDFTableExtractorClient";

export const metadata = getToolMetadata("/pdf-table-extractor");

export default function PDFTableExtractorPage() {
  return <PDFTableExtractorClient />;
}
