import { Metadata } from 'next';
import ToolPageContent from "@/components/ui/ToolPageContent";

export const metadata = {
  title: "Security & Privacy Policy - easy-pdf",
  description: "Learn about easy-pdf's commitment to your privacy and data security. All processing is client-side, ensuring your files never leave your device.",
  keywords: [
    "PDF security",
    "privacy policy",
    "client-side processing",
    "data protection",
    "online PDF tools security",
  ],
};

export default function SecurityPage() {
  return (
    <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
      <ToolPageContent
        toolName="Security & Privacy Policy"
        toolDescription="Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents."
        steps={[]} // No steps for a policy page
        faqs={[
          {
            question: "How does easy-pdf ensure my files are secure?",
            answer:
              "easy-pdf operates entirely client-side. This means all PDF processing—merging, splitting, compressing, converting, etc.—happens directly in your web browser. Your files are never uploaded to our servers, ensuring they remain on your device and under your control.",
          },
          {
            question: "Do you store my documents?",
            answer:
              "No. We do not store, collect, or transmit your documents or any data from them. Once you close your browser tab or navigate away, your document data is gone.",
          },
          {
            question: "Is my data transmitted over the internet?",
            answer:
              "The only data transmitted is the application code itself. Your PDF files and their content remain on your local device throughout the entire process. We do not use any server-side processing for PDF manipulation.",
          },
          {
            question: "What about cookies and tracking?",
            answer:
              "We use minimal, essential cookies for the proper functioning of the website (e.g., for dark mode preferences). We do not use tracking cookies or collect personal identifiable information. Our analytics are privacy-focused and anonymized.",
          },
          {
            question: "Is easy-pdf open source?",
            answer:
              "Yes, easy-pdf is open source. You can review our codebase on GitHub to verify our privacy claims and understand exactly how the application works. This transparency ensures there are no hidden processes.",
          },
          {
            question: "What technologies are used to ensure client-side processing?",
            answer:
              "We leverage powerful JavaScript libraries like pdf-lib and pdfjs-dist, which enable robust PDF manipulation directly within the browser environment, eliminating the need for server interaction for core PDF functionalities.",
          },
        ]}
      />
    </main>
  );
}
