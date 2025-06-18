// src/app/page.js
import Link from "next/link";
import {
  FileText,
  Merge,
  Split,
  Minimize2,
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Image,
  Text,
  ListOrdered,
  Eraser,
  PencilRuler,
  PlusCircle,
  Signature,
  FileBadge2,
} from "lucide-react"; // Importing icons for better visual representation

export const metadata = {
  title: "PDF Toolkit - Blazing-Fast, Client-Side PDF Tools for India",
  description:
    "A blazing-fast, privacy-first iLovePDF alternative built with Next.js, Tailwind & pdf-lib — 100% client-side, open-source, and India-optimized. Merge, Split, Compress, Convert JPG to PDF, PDF to JPG, and more, all in your browser.",
  keywords:
    "PDF tools, merge PDF, split PDF, compress PDF, JPG to PDF, PDF to JPG, rotate PDF, watermark PDF, protect PDF, unlock PDF, online PDF editor, free PDF tools, client-side PDF, privacy-first, India, Next.js, open-source",
  openGraph: {
    title: "PDF Toolkit - Blazing-Fast, Client-Side PDF Tools for India",
    description:
      "A blazing-fast, privacy-first iLovePDF alternative built with Next.js, Tailwind & pdf-lib — 100% client-side, open-source, and India-optimized.",
    url: "https://yourpdftoolkit.com", // Replace with your actual domain
    type: "website",
    images: [
      {
        url: "https://yourpdftoolkit.com/og-image.jpg", // Replace with a compelling OG image
        width: 1200,
        height: 630,
        alt: "PDF Toolkit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Toolkit - Blazing-Fast, Client-Side PDF Tools for India",
    description:
      "A blazing-fast, privacy-first iLovePDF alternative built with Next.js, Tailwind & pdf-lib — 100% client-side, open-source, and India-optimized.",
    image: "https://yourpdftoolkit.com/twitter-image.jpg", // Replace with a compelling Twitter image
  },
};

export default function Home() {
  const tools = [
    {
      href: "/merge",
      title: "Merge PDF",
      description: "Combine multiple PDF files into one.",
      icon: <Merge className="w-8 h-8 text-blue-500" />,
    },
    {
      href: "/split",
      title: "Split PDF",
      description: "Extract specific pages or ranges from a PDF.",
      icon: <Split className="w-8 h-8 text-green-500" />,
    },
    {
      href: "/compress",
      title: "Compress PDF",
      description: "Reduce the file size of your PDFs without losing quality.",
      icon: <Minimize2 className="w-8 h-8 text-purple-500" />,
    },
    {
      href: "/rotate",
      title: "Rotate PDF",
      description: "Rotate PDF pages to the desired orientation.",
      icon: <RotateCw className="w-8 h-8 text-yellow-500" />,
    },
    {
      href: "/watermark",
      title: "Watermark PDF",
      description: "Add text or image watermarks to your PDF files.",
      icon: <Stamp className="w-8 h-8 text-red-500" />,
    },
    {
      href: "/protect",
      title: "Protect PDF",
      description: "Add password protection to your PDFs.",
      icon: <Lock className="w-8 h-8 text-gray-500" />,
    },
    {
      href: "/unlock",
      title: "Unlock PDF",
      description: "Remove password from your PDF files.",
      icon: <Unlock className="w-8 h-8 text-orange-500" />,
    },
    {
      href: "/jpg-to-pdf",
      title: "JPG to PDF",
      description: "Convert JPG images to PDF files.",
      icon: <Image className="w-8 h-8 text-pink-500" />,
    },
    {
      href: "/pdf-to-jpg",
      title: "PDF to JPG",
      description: "Convert PDF pages to JPG images.",
      icon: <FileText className="w-8 h-8 text-teal-500" />,
    },
    {
      href: "/reorder",
      title: "Reorder PDF Pages",
      description: "Drag and drop to reorder or delete PDF pages.",
      icon: <ListOrdered className="w-8 h-8 text-cyan-500" />,
    },
    {
      href: "/delete-pages",
      title: "Delete PDF Pages",
      description: "Remove unwanted pages from your PDF.",
      icon: <Eraser className="w-8 h-8 text-indigo-500" />,
    },
    {
      href: "/add-text",
      title: "Add Text to PDF",
      description: "Add custom text or fill forms in your PDF.",
      icon: <Text className="w-8 h-8 text-lime-500" />,
    },
    {
      href: "/add-page-numbers",
      title: "Add Page Numbers",
      description: "Insert page numbers into your PDF documents.",
      icon: <PlusCircle className="w-8 h-8 text-amber-500" />,
    },
    {
      href: "/sign-pdf",
      title: "Sign PDF",
      description: "Digitally sign your PDF documents.",
      icon: <Signature className="w-8 h-8 text-rose-500" />,
    },
    {
      href: "/pdf-info",
      title: "PDF Info",
      description: "View and edit PDF metadata.",
      icon: <FileBadge2 className="w-8 h-8 text-sky-500" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center mb-16 max-w-4xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-down">
          Your Go-To <span className="text-blue-400">PDF Toolkit</span> for
          India
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 animate-fade-in-up">
          Blazing-fast, 100% client-side, and privacy-first. Effortlessly manage
          your PDFs directly in your browser.
        </p>
        <Link
          href="/merge" // Direct to a popular tool
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started Now
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

      {/* Tools Grid Section */}
      <section className="w-full max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-100 animate-fade-in-right">
          All the PDF Tools You Need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 border border-gray-700 hover:border-blue-500"
            >
              <div className="flex items-center justify-center mb-4">
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-50 group-hover:text-blue-400 mb-2 text-center">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-sm text-center">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
