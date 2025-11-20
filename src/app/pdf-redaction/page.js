import React from 'react';
import PDFRedactionClient from './components/PDFRedactionClient';

export const metadata = {
  title: 'PDF Redaction | Easy PDF',
  description: 'Permanently remove or mask sensitive information from PDF documents right in your browser.',
};

export default function PDFRedaction() {
  return <PDFRedactionClient />;
}
