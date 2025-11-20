import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToXlsxClient from "./components/PdfToXlsxClient";

export const metadata = getToolMetadata("/pdf-to-xlsx");

export default function PdfToXlsxPage() {
  return <PdfToXlsxClient />;
}
