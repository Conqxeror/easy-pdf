import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfAnnotationCollaborationClient from "./components/PdfAnnotationCollaborationClient";

export const metadata = getToolMetadata("/pdf-annotation-collaboration");

export default function PDFAnnotationCollaborationPage() {
  return <PdfAnnotationCollaborationClient />;
}
