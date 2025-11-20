import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToJpgClient from "./components/PdfToJpgClient";

export const metadata = getToolMetadata("/pdf-to-jpg");

export default function PdfToJpgPage() {
  return <PdfToJpgClient />;
}
