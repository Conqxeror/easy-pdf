import { getToolMetadata } from "@/lib/toolSeoHelper";
import LegalAnalyzerClient from "./components/LegalAnalyzerClient";

export const metadata = getToolMetadata("/legal-analyzer");

export default function LegalAnalyzerPage() {
  return <LegalAnalyzerClient />;
}
