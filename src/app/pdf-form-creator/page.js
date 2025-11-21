import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfFormCreatorClient from "./components/PdfFormCreatorClient";

export const metadata = getToolMetadata("/pdf-form-creator");

export default function PDFFormCreatorPage() {
  return <PdfFormCreatorClient />;
}
