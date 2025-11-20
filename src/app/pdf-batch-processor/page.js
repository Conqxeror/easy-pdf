import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFBatchProcessorClient from "./components/PDFBatchProcessorClient";

export const metadata = getToolMetadata("/pdf-batch-processor");

export default function PDFBatchProcessorPage() {
  return <PDFBatchProcessorClient />;
}
