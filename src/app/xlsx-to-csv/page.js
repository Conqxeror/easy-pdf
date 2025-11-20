import { getToolMetadata } from "@/lib/toolSeoHelper";
import XlsxToCsvClient from "./components/XlsxToCsvClient";

export const metadata = getToolMetadata("/xlsx-to-csv");

export default function XlsxToCsvPage() {
  return <XlsxToCsvClient />;
}
