import { getToolMetadata } from "@/lib/toolSeoHelper";
import ReportGeneratorClient from "./components/ReportGeneratorClient";

export const metadata = getToolMetadata("/report-generator").metadata;

export default function ReportGeneratorPage() {
  return <ReportGeneratorClient />;
}
