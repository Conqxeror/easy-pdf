import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFFormCreatorClient from "./components/PDFFormCreatorClient";

export const metadata = getToolMetadata("/pdf-form-creator");

export default function PDFFormCreatorPage() {
  return <PDFFormCreatorClient />;
}
