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
  const faqs = [
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
  ];

  return (
    <main className="container max-w-4xl py-8 mx-auto">
      <ToolPageContent
        toolName="Security & Privacy Policy"
        toolDescription="Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents with 100% client-side processing, ensuring your files never leave your device."
        currentTool="security"
        steps={[
          "All PDF processing happens directly in your browser - no server uploads required.",
          "Your files remain on your device throughout the entire process.",
          "No data collection, storage, or transmission of your documents.",
          "Open source codebase available for transparency and verification.",
        ]}
        faqs={faqs}
      />
    </main>
  );
}