import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfDigitalSignatureClient from "./components/PdfDigitalSignatureClient";

export const metadata = getToolMetadata("/pdf-digital-signature").metadata;

export default function PDFDigitalSignaturePage() {
  return <PdfDigitalSignatureClient />;
}
