import { getToolMetadata } from "@/lib/toolSeoHelper";
import InvoiceGeneratorClient from "./components/InvoiceGeneratorClient";

export const metadata = getToolMetadata("/invoice-generator").metadata;

export default function InvoiceGeneratorPage() {
  return <InvoiceGeneratorClient />;
}
