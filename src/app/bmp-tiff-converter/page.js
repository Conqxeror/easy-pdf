import React from "react";
import BmpTiffConverterClient from "./components/BmpTiffConverterClient";

export const metadata = {
  title: "BMP/TIFF Converter | Easy PDF",
  description: "Convert BMP and TIFF images to PNG or JPG formats directly in your browser. Free, secure, and easy to use.",
};

export default function BmpTiffConverterPage() {
  return <BmpTiffConverterClient />;
}
