"use client";

import React, { useState, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ACCEPT = ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.ppt,application/vnd.ms-powerpoint";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB guard

export default function PptToPdfClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFile(null);
      return;
    }

    const selected = incomingFiles[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. PowerPoint to PDF conversion typically requires server-side processing for reliable results.");
      return;
    }

    // Check if file is a valid PowerPoint file by extension
    const fileExt = selected.name.toLowerCase().split('.').pop();
    if (fileExt !== 'ppt' && fileExt !== 'pptx') {
      setError("Please upload a valid PowerPoint file (.ppt or .pptx)");
      return;
    }

    setFile(selected);
  }, []);

  // For PowerPoint to PDF conversion, we need to explain the technical limitations
  // as there are no mature client-side libraries for parsing PowerPoint files
  const convertPptToPdf = () => {
    setError("PowerPoint to PDF conversion requires specialized libraries not suitable for client-side processing. This conversion typically requires server-side processing with tools like LibreOffice or Microsoft Office libraries. For reliable conversion, please use desktop applications like Microsoft PowerPoint, LibreOffice Impress, or Google Slides export feature.");
  };

  const toolName = "PowerPoint to PDF Converter";
  const toolDescription = "Convert PowerPoint presentations to PDF documents. Note: This conversion requires specialized libraries not currently available for client-side processing.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={[
        "Upload PPT or PPTX file",
        "Attempt conversion to PDF format",
        "Use alternative methods if needed"
      ]}
      faqs={[
        {
          question: "Can I really convert PPT to PDF in my browser?",
          answer: "Full PowerPoint to PDF conversion requires complex parsing of the PPT/PPTX binary format, which needs specialized libraries. The conversion typically requires server-side processing with tools like LibreOffice or Microsoft Office libraries."
        },
        {
          question: "What are the alternatives?",
          answer: "For reliable PowerPoint to PDF conversion, use desktop applications like Microsoft PowerPoint, LibreOffice Impress, or Google Slides. You can also use the 'Print' function and select 'Save as PDF' printer."
        },
        {
          question: "Are there any client-side solutions?",
          answer: "Limited options exist but they require specialized WASM implementations or client-side Office libraries that are not commonly available. Server-side solutions remain the most reliable option."
        }
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PPT to PDF', href: '/ppt-to-pdf' }
      ]}
      currentTool="ppt-to-pdf"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PowerPoint file"
          description="PPT or PPTX files (max 100MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={convertPptToPdf} disabled={!file}>
            Convert to PDF (Not Available)
          </Button>
          <Button variant="ghost" onClick={() => { setFile(null); setError(""); }}>
            Clear
          </Button>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Technical Limitations</CardTitle>
            <CardDescription className="text-blue-700">
              Converting PowerPoint files to PDF in the browser has significant technical constraints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-700">
            <p>
              PowerPoint files (.ppt/.pptx) use complex binary formats that require sophisticated parsing libraries
              to interpret properly. Unlike PDFs or images, there are no mature client-side JavaScript libraries
              that can reliably convert PowerPoint files to PDF format in the browser.
            </p>
            <p>
              The conversion process involves:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Parsing the complex PowerPoint file format</li>
              <li>Rendering each slide with accurate layouts and formatting</li>
              <li>Converting visual elements like shapes, charts and animations</li>
              <li>Generating a properly structured PDF document</li>
            </ul>
            <p>
              For reliable results, we recommend using server-side services or desktop applications
              like Microsoft PowerPoint or LibreOffice.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
