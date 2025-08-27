import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import PDFRedactionClient from './components/PDFRedactionClient';

export const metadata = generateEnhancedMetadata({
  title: "PDF Redaction Tool - Securely Remove Sensitive Information",
  description: "Permanently redact sensitive information from PDF documents. Remove text, images, and metadata with our secure, client-side redaction tool. 100% privacy-first processing.",
  keywords: [
    "PDF redaction", "redact PDF", "remove sensitive information", "PDF security", 
    "document redaction", "privacy tool", "secure PDF", "redact text", "redact images",
    "metadata cleaning", "GDPR compliance", "HIPAA compliance"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-redaction",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Redaction Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Redaction", url: "https://easy-pdf-murex.vercel.app/pdf-redaction" }
  ]
});

export default function PDFRedaction() {
  return <PDFRedactionClient />;
}