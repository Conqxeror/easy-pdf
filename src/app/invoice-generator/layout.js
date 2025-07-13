import { generateMetadata as generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata({
  title: "PDF Invoice Generator - Create Professional Invoices Online",
  description: "Generate professional PDF invoices with GST support, multiple currencies, and customizable templates. Perfect for businesses and freelancers.",
  keywords: ["pdf invoice generator", "create invoice", "invoice maker", "business invoice", "gst invoice", "professional invoice"],
  canonicalUrl: "/invoice-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

export default function InvoiceGeneratorLayout({ children }) {
  return children;
}