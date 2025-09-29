// PDF utilities with dynamic imports for better bundle splitting
import React, { useEffect, useState } from 'react';
import { safeCreateObjectURL } from './enhancedUX';

// Hook to dynamically load PDFLib
export const usePDFLib = () => {
  const [PDFLib, setPDFLib] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPDFLib = async () => {
      try {
        const pdfLibModule = await import('pdf-lib');
        if (isMounted) {
          setPDFLib({ PDFDocument: pdfLibModule.PDFDocument });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadPDFLib();

    return () => {
      isMounted = false;
    };
  }, []);

  return { PDFLib, loading, error };
};

// Hook to dynamically load PDF.js
export const usePDFJS = () => {
  const [pdfjs, setPdfjs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPDFJS = async () => {
      try {
        const pdfjsModule = await import('pdfjs-dist');
        if (isMounted) {
          // Set worker source
          pdfjsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
          setPdfjs(pdfjsModule);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadPDFJS();

    return () => {
      isMounted = false;
    };
  }, []);

  return { pdfjs, loading, error };
};

// Utility function to merge PDFs using dynamic imports
export const mergePDFs = async (files, setProgress) => {
  const { PDFDocument } = await import('pdf-lib');
  
  const mergedPdf = await PDFDocument.create();
  const totalFiles = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    setProgress(Math.round(((i + 1) / totalFiles) * 90));
  }
  
  setProgress(95);
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  let url = null;
  try { url = safeCreateObjectURL(blob); } catch (err) { console.error('Failed to create object URL for merged PDF:', err); url = null; }
  setProgress(100);

  // Return an object URL when available. Caller should revoke when appropriate.
  return url;
};