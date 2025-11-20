import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFAnnotationCollaborationClient from "./components/PDFAnnotationCollaborationClient";

export const metadata = getToolMetadata("/pdf-annotation-collaboration");

export default function PDFAnnotationCollaborationPage() {
  return <PDFAnnotationCollaborationClient />;
}
