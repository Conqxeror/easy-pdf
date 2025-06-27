import { Metadata } from 'next';
import { Metadata } from 'next';

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
  ];

  return (
    <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
      <div className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-center text-white mb-6">Security & Privacy Policy</h1>
          <p className="text-lg text-center text-gray-400 mb-12">Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents.</p>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h4 className="text-xl font-semibold text-white">{faq.question}</h4>
                    <p className="text-gray-400 mt-2">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
