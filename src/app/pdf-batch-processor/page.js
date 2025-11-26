import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfBatchProcessorClient from "./components/PdfBatchProcessorClient";

export const metadata = getToolMetadata("/pdf-batch-processor").metadata;

export default function PDFBatchProcessorPage() {
  return <PdfBatchProcessorClient />;
}
