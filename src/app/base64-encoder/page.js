import React from "react";
import Base64EncoderClient from "./components/Base64EncoderClient";

export const metadata = {
  title: "Base64 Encoder / Decoder | Easy PDF",
  description: "Convert text or small files to Base64 (and back) entirely inside your browser. Perfect for inline payloads, data URLs, and quick debugging.",
};

export default function Base64EncoderPage() {
  return <Base64EncoderClient />;
}
