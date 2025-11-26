import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFAccessibilityCheckerClient from "./components/PDFAccessibilityCheckerClient";

export const metadata = getToolMetadata("/pdf-accessibility-checker").metadata;

export default function PDFAccessibilityCheckerPage() {
  return <PDFAccessibilityCheckerClient />;
}
