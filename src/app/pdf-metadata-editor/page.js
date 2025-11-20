import React from 'react';
import PdfMetadataEditorClient from "./components/PdfMetadataEditorClient";

export const metadata = {
  title: 'PDF Metadata Editor | Easy PDF',
  description: 'Clean up authorship, keywords, and document dates without uploading your file.',
};

export default function PdfMetadataEditorPage() {
  return <PdfMetadataEditorClient />;
}
