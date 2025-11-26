import { getToolMetadata } from "@/lib/toolSeoHelper";
import QRScannerClient from "./components/QRScannerClient";

export const metadata = getToolMetadata("/qr-scanner").metadata;

export default function QRScannerPage() {
  return <QRScannerClient />;
}
