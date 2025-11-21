import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfBookmarkManagerClient from "./components/PdfBookmarkManagerClient";

export const metadata = getToolMetadata("/pdf-bookmark-manager");

export default function PDFBookmarkManagerPage() {
  return <PdfBookmarkManagerClient />;
}
