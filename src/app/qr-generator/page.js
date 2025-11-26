import { getToolMetadata } from "@/lib/toolSeoHelper";
import QRCodeGeneratorClient from "./components/QRCodeGeneratorClient";

export const metadata = getToolMetadata("/qr-generator").metadata;

export default function QRCodeGeneratorPage() {
  return <QRCodeGeneratorClient />;
}
