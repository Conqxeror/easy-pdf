import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/protect');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Protect PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to protect a PDF with a password?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Protect PDF tool is completely free to use. You can add password protection to as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when I protect them?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including encryption, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "What kind of password should I use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We recommend using a strong, unique password that combines uppercase and lowercase letters, numbers, and symbols to maximize security."
              }
            },
            {
              "@type": "Question",
              "name": "Can I remove the password later?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can use our 'Unlock PDF' tool to remove the password protection from your PDF, provided you know the correct password."
              }
            },
            {
              "@type": "Question",
              "name": "Does protecting a PDF affect its content or quality?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, adding password protection to your PDF does not alter its content or quality. It only encrypts the file, restricting access to unauthorized users."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
