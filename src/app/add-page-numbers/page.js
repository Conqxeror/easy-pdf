import { Metadata } from 'next';

export const metadata = {
  title: "Add Page Numbers to PDF - Header & Footer Online Free",
  description: "Easily add page numbers, headers, or footers to your PDF documents online. Customize position, format, and style securely in your browser.",
  keywords: [
    "add page numbers to PDF",
    "PDF header",
    "PDF footer",
    "number PDF pages",
    "customize page numbers",
    "free PDF page numbering",
    "online PDF editor",
    "client-side PDF tools",
    "private PDF tools",
  ],
  alternates: {
    canonical: "/page-numbers",
  },
};

// Route alias for /add-page-numbers to /page-numbers
export { default } from "../page-numbers/page";
