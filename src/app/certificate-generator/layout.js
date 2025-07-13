import { generateMetadata as generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata({
  title: "Certificate Generator - Create Professional Certificates PDF",
  description: "Generate professional certificates for courses, training, achievements with customizable templates and styling options.",
  keywords: ["certificate generator", "certificate maker", "course certificate", "training certificate", "achievement certificate"],
  canonicalUrl: "/certificate-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

export default function CertificateGeneratorLayout({ children }) {
  return children;
}