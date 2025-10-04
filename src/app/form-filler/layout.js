import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/form-filler');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Form Filler Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to fill out PDF forms online?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our PDF Form Filler tool is completely free to use. You can add text to as many PDF forms as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when filling forms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including adding text to forms, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I add multiple text fields to a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently, our tool allows you to add one text field at a time. To add multiple fields, you would need to repeat the process for each text entry."
              }
            },
            {
              "@type": "Question",
              "name": "Can I add signatures or images with this tool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This tool is primarily designed for adding text. For adding signatures, please use our dedicated 'Sign PDF' tool. For adding images, you might consider converting your image to PDF first and then merging it."
              }
            },
            {
              "@type": "Question",
              "name": "Does this tool work with interactive PDF forms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our tool adds text as a new layer on top of the PDF. While it works on all PDFs, it does not interact with pre-existing interactive form fields (AcroForm fields) within the PDF. It's best for adding text to non-fillable PDFs or adding additional text to existing forms."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
