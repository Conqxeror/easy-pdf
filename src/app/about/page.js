import Link from "next/link";
import ToolPageContent from "@/components/ui/ToolPageContent";
import { renderTextWithToolLinks } from "@/lib/utils";

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-200 font-inter py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center mb-12 leading-tight">
            About easy-pdf: Your Privacy-First Online PDF Toolkit
          </h1>

          {/* Section: Our Core Philosophy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Our Core Philosophy: Privacy-First, Always.
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              In an age where data privacy is paramount, easy-pdf stands apart.
              We are proud to be a{" "}
              <span className="font-semibold text-white">
                100% client-side PDF tool
              </span>
              . What does this mean for you?
            </p>
            <ul className="list-disc list-inside space-y-3 text-lg leading-relaxed pl-4">
              <li>
                <span className="font-semibold text-white">
                  No File Uploads to Servers
                </span>
                : Your sensitive PDF documents never leave your computer. All
                processing &mdash; from{" "}
                {renderTextWithToolLinks(
                  "PDF merging to compressing PDF files, splitting PDF documents, or rotating PDF pages"
                )}
                , to adding page numbers or watermarks &mdash; happens directly
                in your browser. This means ultimate privacy and security for
                your confidential information.
              </li>
              <li>
                <span className="font-semibold text-white">
                  No Data Collection
                </span>
                : We don&apos;t collect, store, or view your documents. Ever. Our
                business model is not built on data exploitation.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Offline Functionality
                </span>
                : Once the easy-pdf website is loaded, many of our tools can be
                used offline, making it convenient and reliable even without an
                internet connection.
              (This is a placeholder for the actual content)
              </li>
            </ul>
          </section>

          {/* Section: Our Mission */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Our Mission: Empowering Users with Secure & Accessible PDF Tools
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We believe that powerful tools should be accessible to everyone,
              without compromising privacy. Our mission is to provide a robust,
              user-friendly suite of PDF utilities that you can trust. We are
              committed to:
            </p>
            <ul className="list-disc list-inside space-y-3 text-lg leading-relaxed pl-4">
              <li>
                <span className="font-semibold text-white">
                  Simplicity
                </span>
                : Making complex PDF tasks easy and intuitive.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Performance
                </span>
                : Ensuring fast and efficient processing directly in your
                browser.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Transparency
                </span>
                : Being open about how our tools work and our commitment to your
                privacy.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Accessibility
                </span>
                : Providing free tools that are available to everyone, anywhere.
              </li>
            </ul>
          </section>

          {/* Section: Why Choose easy-pdf? */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Why Choose easy-pdf?
            </h2>
            <ul className="list-disc list-inside space-y-3 text-lg leading-relaxed pl-4">
              <li>
                <span className="font-semibold text-white">
                  Complete Privacy
                </span>
                : Your documents never touch our servers.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Speed & Efficiency
                </span>
                : Client-side processing means instant results.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Comprehensive Toolset
                </span>
                : From basic merges to advanced OCR, we&apos;ve got you covered.
              </li>
              <li>
                <span className="font-semibold text-white">
                  User-Friendly Interface
                </span>
                : Designed for ease of use, even for beginners.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Free to Use
                </span>
                : High-quality PDF tools without the cost.
              </li>
            </ul>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Start Using easy-pdf Today!
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              Experience the peace of mind that comes with secure, client-side
              PDF processing. No sign-ups, no subscriptions, just powerful
              tools at your fingertips.
            </p>
            <Link
              href="/merge"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Merge PDF
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </section>
        </div>
      </div>
      <ToolPageContent
        toolName="About easy-pdf"
        toolDescription="Learn more about easy-pdf, your privacy-first online PDF toolkit. We offer a suite of client-side PDF tools that ensure your documents never leave your device."
        steps={[
          "Explore our range of PDF tools from the homepage.",
          "Upload your PDF files directly in your browser.",
          "Process your documents with complete privacy and security.",
          "Download your processed PDFs instantly.",
        ]}
        faqs={[
          {
            question: "What does 'client-side' processing mean?",
            answer:
              "Client-side processing means all operations on your PDF files happen directly in your web browser. Your documents are never uploaded to our servers, ensuring maximum privacy and security.",
          },
          {
            question: "Is easy-pdf free to use?",
            answer:
              "Yes, easy-pdf offers a comprehensive suite of PDF tools that are completely free to use, with no hidden costs or subscriptions.",
          },
          {
            question: "Do you store my documents?",
            answer:
              "No, we do not store your documents. Your files are processed in real-time in your browser and are deleted from memory once the operation is complete or you close the tab.",
          },
          {
            question: "Can I use easy-pdf offline?",
            answer:
              "Once the easy-pdf website is loaded, many of our tools can be used offline, providing convenience and reliability even without an internet connection.",
          },
        ]}
      />
    </>
  );
}