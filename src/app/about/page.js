import Link from "next/link"; // Re-import Link from next/link
import MetaHead from "@/components/ui/MetaHead"; // Import MetaHead for SEO

// Define the mapping of tool names to their respective hrefs
const toolsMap = {
  "Merge PDF": "/merge",
  "Split PDF": "/split",
  "Compress PDF": "/compress",
  "JPG to PDF": "/jpg-to-pdf",
  "PDF to JPG": "/pdf-to-jpg",
  "Rotate PDF": "/rotate",
  "Watermark PDF": "/watermark",
  "Protect PDF": "/protect",
  "Unlock PDF": "/unlock",
  "Delete PDF Pages": "/delete-pages",
  "Reorder PDF Pages": "/reorder",
  "Organize PDF": "/organize",
  "Add Page Numbers": "/page-numbers",
  "HTML to PDF": "/html-to-pdf",
  OCR: "/ocr",
  "Sign/Annotate PDF": "/sign",
  "PDF Form Filler": "/form-filler",
  "Word to PDF": "/word-to-pdf",
  "PDF to Word": "/pdf-to-word",
};

// Helper function to render text with dynamic links for tool names
const renderTextWithToolLinks = (text) => {
  const parts = [];
  let lastIndex = 0;

  // Iterate over each tool in the map
  Object.entries(toolsMap).forEach(([toolName, href]) => {
    let currentIndex = 0;
    // Use a regular expression to find all occurrences of the tool name
    const regex = new RegExp(`\\b${toolName}\\b`, "gi"); // \b for word boundary, gi for global and case-insensitive
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startIndex = match.index;
      const endIndex = regex.lastIndex;

      // Add the text before the current match
      if (startIndex > lastIndex) {
        parts.push(text.substring(lastIndex, startIndex));
      }

      // Add the Link component for the tool name
      parts.push(
        <Link
          key={`${toolName}-${startIndex}`}
          href={href}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
        >
          {toolName}
        </Link>
      );
      lastIndex = endIndex;
    }
  });

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no tools were found, return the original text wrapped in a span
  if (parts.length === 0) {
    return <span>{text}</span>;
  }

  return parts;
};

export default function AboutPage() {
  return (
    <>
      <MetaHead
        title="About easy-pdf | 100% Client-Side PDF Tools"
        description="Learn about easy-pdf, a privacy-first, client-side PDF toolkit for India and the world. Discover our mission, features, and how we help you merge, split, compress, convert, and edit PDFs securely in your browser."
        url="/about"
        keywords="about easy-pdf, PDF tools, privacy-first PDF, client-side PDF, merge PDF, split PDF, compress PDF, convert PDF, India PDF tools"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About easy-pdf",
          description:
            "Learn about easy-pdf, a privacy-first, client-side PDF toolkit for India and the world. Discover our mission, features, and how we help you merge, split, compress, convert, and edit PDFs securely in your browser.",
          url: "https://easy-pdf-murex.vercel.app/about",
        }}
      />
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
                )}{" "}
                &mdash; happens right in your web browser.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Complete Data Security
                </span>
                : We don&apos;t store, collect, or even see your files. This
                radical approach ensures your personal and professional data
                remains entirely confidential.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Trust and Transparency
                </span>
                : Our commitment to privacy is absolute, making easy-pdf a
                secure choice for individuals and businesses alike.
              </li>
            </ul>
          </section>

          {/* Section: Blazing-Fast Performance */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Blazing-Fast Performance: Get It Done Instantly.
            </h2>
            <p className="text-lg leading-relaxed">
              We understand that your time is valuable. easy-pdf is engineered
              for unparalleled speed, delivering instant results for your PDF
              tasks. Whether you&apos;re{" "}
              {renderTextWithToolLinks(
                "converting JPG to PDF, unlocking PDF files, or organizing PDF pages"
              )}
              , our optimized algorithms ensure a seamless and quick experience.
              Experience the difference of a truly efficient{" "}
              <span className="font-semibold text-white">
                online PDF editor
              </span>{" "}
              that doesn&apos;t compromise on performance.
            </p>
          </section>

          {/* Section: Comprehensive Suite of PDF Tools */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Comprehensive Suite of PDF Tools
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              easy-pdf is your all-in-one{" "}
              <span className="font-semibold text-white">
                online PDF toolkit
              </span>
              . Our growing collection of features empowers you to handle any
              PDF challenge with ease:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-lg pl-4">
              {Object.entries(toolsMap).map(([toolName, href]) => (
                <div key={toolName} className="flex items-center">
                  <span className="text-blue-400 mr-2">&#8226;</span>{" "}
                  {/* Custom bullet point */}
                  <Link
                    href={href}
                    className="text-gray-200 hover:text-blue-400 hover:underline transition-colors"
                  >
                    {toolName}
                  </Link>
                  {toolName.includes("Coming Soon") && (
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Open-Source & Community-Driven */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Open-Source & Community-Driven
            </h2>
            <p className="text-lg leading-relaxed">
              We believe in transparency and the power of collaboration.
              easy-pdf is an{" "}
              <span className="font-semibold text-white">
                open-source project
              </span>
              , meaning our code is publicly available for review, contribution,
              and improvement. This commitment to open-source ensures continuous
              innovation and builds trust within our user community. We welcome
              developers and enthusiasts to explore our GitHub repository and
              contribute to making easy-pdf even better.
            </p>
          </section>

          {/* Section: Made for India, Loved Globally */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Made for India, Loved Globally
            </h2>
            <p className="text-lg leading-relaxed">
              Developed with a deep understanding of the unique needs of users
              in India, easy-pdf is built to be accessible, efficient, and
              reliable for everyone. While our roots are in India, our vision is
              global. We strive to offer a universal{" "}
              <span className="font-semibold text-white">
                online PDF solution
              </span>{" "}
              that caters to diverse users around the world, providing a
              seamless experience regardless of location.
            </p>
          </section>

          {/* Section: Why Choose easy-pdf? */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">
              Why Choose easy-pdf?
            </h2>
            <ul className="list-disc list-inside space-y-3 text-lg leading-relaxed pl-4">
              <li>
                <span className="font-semibold text-white">
                  Ultimate Privacy
                </span>
                : Your files stay local, always.
              </li>
              <li>
                <span className="font-semibold text-white">Lightning Fast</span>
                : Get your PDF tasks done in seconds.
              </li>
              <li>
                <span className="font-semibold text-white">Feature-Rich</span>:
                A comprehensive suite for every PDF need.
              </li>
              <li>
                <span className="font-semibold text-white">User-Friendly</span>:
                Intuitive design for effortless navigation.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Free & Open-Source
                </span>
                : Quality tools accessible to everyone.
              </li>
              <li>
                <span className="font-semibold text-white">SEO-Optimized</span>:
                Designed to be easily discoverable.
              </li>
            </ul>
          </section>

          {/* Call to Action */}
          <section className="w-full max-w-4xl mt-16 mb-8 text-center">
            <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 p-8 rounded-xl border border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-6">
                Start Your Secure PDF Journey Today!
              </h2>
              <p className="text-xl leading-relaxed mb-8 text-gray-300">
                Ready to experience hassle-free PDF management? Explore our
                tools and transform the way you handle documents. Your privacy,
                our priority.
              </p>
              <Link // Changed back to Link from next/link for internal navigation
                href="/" // Link to your homepage or directly to the tools section
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try easy-pdf Now!
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
