import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFBookmarkManagerClient from "./components/PDFBookmarkManagerClient";

export const metadata = getToolMetadata("/pdf-bookmark-manager");

export default function PDFBookmarkManagerPage() {
  return <PDFBookmarkManagerClient />;
}
