import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToPptClient from "./components/PdfToPptClient";

export const metadata = getToolMetadata("/pdf-to-ppt");

export default function PdfToPptPage() {
  return <PdfToPptClient />;
}
