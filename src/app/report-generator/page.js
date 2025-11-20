import { getToolMetadata } from "@/lib/toolSeoHelper";
import ReportGeneratorClient from "./components/ReportGeneratorClient";

export const metadata = getToolMetadata("/report-generator");

export default function ReportGeneratorPage() {
  return <ReportGeneratorClient />;
}
