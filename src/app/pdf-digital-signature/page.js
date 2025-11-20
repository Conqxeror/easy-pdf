import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFDigitalSignatureClient from "./components/PDFDigitalSignatureClient";

export const metadata = getToolMetadata("/pdf-digital-signature");

export default function PDFDigitalSignaturePage() {
  return <PDFDigitalSignatureClient />;
}
