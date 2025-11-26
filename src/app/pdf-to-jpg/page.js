import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToJpgClient from "./components/PdfToJpgClient";

export const metadata = getToolMetadata("/pdf-to-jpg").metadata;

export default function PdfToJpgPage() {
  return <PdfToJpgClient />;
}
