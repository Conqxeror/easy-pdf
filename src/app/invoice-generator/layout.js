import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/invoice-generator');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Invoice Generator Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to generate invoices?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Invoice Generator tool is completely free to use. You can create as many invoices as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my invoices secure and private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All invoice generation happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I customize the invoice template?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can customize various aspects of the invoice including company details, client information, line items, and payment terms. You can also add your company logo for a professional appearance."
              }
            },
            {
              "@type": "Question",
              "name": "What currencies are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our tool supports multiple currencies including USD, EUR, GBP, INR, and many others. You can select your preferred currency when creating an invoice."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a limit to how many line items I can add?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, you can add as many line items as needed to your invoice. The tool will automatically calculate subtotals and totals."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
