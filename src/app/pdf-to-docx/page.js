import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToDocxClient from "./components/PdfToDocxClient";

export const metadata = getToolMetadata("/pdf-to-docx").metadata;

export default function PdfToDocxPage() {
  return <PdfToDocxClient />;
}
