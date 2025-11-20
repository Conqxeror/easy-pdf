import { getToolMetadata } from "@/lib/toolSeoHelper";
import QRScannerClient from "./components/QRScannerClient";

export const metadata = getToolMetadata("/qr-scanner");

export default function QRScannerPage() {
  return <QRScannerClient />;
}
