import { getToolMetadata } from "@/lib/toolSeoHelper";
import DocxToPdfClient from "./components/DocxToPdfClient";

export const metadata = getToolMetadata("/docx-to-pdf");

export default function DocxToPdfPage() {
  return <DocxToPdfClient />;
}
