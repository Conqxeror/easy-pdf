import { getToolMetadata } from "@/lib/toolSeoHelper";
import MedicalAnalyzerClient from "./components/MedicalAnalyzerClient";

export const metadata = getToolMetadata("/medical-analyzer").metadata;

export default function MedicalAnalyzerPage() {
  return <MedicalAnalyzerClient />;
}
