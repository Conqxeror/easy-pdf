import React from "react";
import CertificateGeneratorClient from "./components/CertificateGeneratorClient";

export const metadata = {
  title: "Certificate Generator | Easy PDF",
  description: "Create professional certificates instantly. Choose from multiple templates, customize colors, and download high-quality PDF certificates for free.",
};

export default function CertificateGeneratorPage() {
  return <CertificateGeneratorClient />;
}
