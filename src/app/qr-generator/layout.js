import { generateMetadata as generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata({
  title: "QR Code Generator - Create QR Codes for PDF Online",
  description: "Generate QR codes for URLs, WiFi, contact cards, and more. Export as PNG or PDF with customizable size and quality.",
  keywords: ["qr code generator", "qr code maker", "wifi qr code", "vcard qr code", "url qr code", "qr code pdf"],
  canonicalUrl: "/qr-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

export default function QRGeneratorLayout({ children }) {
  return children;
}