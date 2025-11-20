import { getToolMetadata } from "@/lib/toolSeoHelper";
import BarcodeGeneratorClient from "./components/BarcodeGeneratorClient";

export const metadata = getToolMetadata("/barcode-generator");

export default function BarcodeGeneratorPage() {
  return <BarcodeGeneratorClient />;
}
