import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfVersionComparisonClient from "./components/PdfVersionComparisonClient";

export const metadata = getToolMetadata("/pdf-version-comparison");

export default function PdfVersionComparisonPage() {
  return <PdfVersionComparisonClient />;
}
