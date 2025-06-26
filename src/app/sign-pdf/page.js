import { Metadata } from 'next';

export const metadata = {
  title: "Sign PDF - Add Signature & Annotations to PDF Online Free",
  description: "Draw your signature or annotation and place it directly onto any page of your PDF document online. Securely sign and annotate PDFs in your browser.",
  keywords: [
    "sign PDF",
    "annotate PDF",
    "add signature to PDF",
    "draw on PDF",
    "free PDF signer",
    "online PDF annotation",
    "client-side PDF tools",
    "private PDF tools",
  ],
  alternates: {
    canonical: "/sign",
  },
};

// Route alias for /sign-pdf to /sign
export { default } from "../sign/page";
