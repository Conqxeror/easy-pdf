"use client";

import React, { useState, useEffect } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Download, Trash2, Move } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import ToolActions from "@/components/ui/ToolActions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { safeCreateObjectURL, safeRevokeObjectURL } from '@/lib/enhancedUX';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [pageSize, setPageSize] = useState("fit"); // 'fit', 'a4', 'letter'
  const [orientation, setOrientation] = useState("portrait"); // 'portrait', 'landscape'
  const [margin, setMargin] = useState("small"); // 'none', 'small', 'large'
  const [progress, setProgress] = useState(0);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      try {
        if (pdfUrl && typeof URL !== 'undefined' && !String(pdfUrl).startsWith('data:')) {
          try { if (pdfUrl && typeof URL !== 'undefined' && !String(pdfUrl).startsWith('data:')) URL.revokeObjectURL(pdfUrl); } catch { }
        }
        // Also cleanup file preview URLs
        files.forEach(file => {
          if (file.preview && typeof URL !== 'undefined' && !String(file.preview).startsWith('data:')) {
            try { URL.revokeObjectURL(file.preview); } catch { }
          }
        });
      } catch {
        // ignore
      }
    };
  }, [pdfUrl, files]);

  const handleFiles = (newFiles) => {
    setError("");
    setPdfUrl(null);
    setProgress(0);

    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== newFiles.length) {
      setError("Some files were skipped. Please upload only image files (JPG, PNG, etc).");
    }

    const filesWithPreview = validFiles.map(file => Object.assign(file, {
      preview: safeCreateObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removedFile = newFiles[indexToRemove];
      if (removedFile.preview) {
        try { safeRevokeObjectURL(removedFile.preview); } catch { }
      }
      newFiles.splice(indexToRemove, 1);
      return newFiles;
    });
    setPdfUrl(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
    setPdfUrl(null);
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Initializing PDF document...");
    setProgress(10);
    setError("");

    try {
      const { PDFDocument, PageSizes } = await loadPdfLib();
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingMessage(`Processing image ${i + 1} of ${files.length}...`);

        const imageBytes = await file.arrayBuffer();
        let image;

        try {
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            // Try to embed as PNG for other formats if supported, or skip
            // For simplicity in this demo, we'll assume PNG fallback works or throw
            image = await pdfDoc.embedPng(imageBytes);
          }
        } catch (e) {
          console.warn(`Could not embed image ${file.name}, trying fallback...`, e);
          continue; // Skip problematic images
        }

        const { width, height } = image;
        let pageWidth, pageHeight;

        if (pageSize === 'a4') {
          [pageWidth, pageHeight] = PageSizes.A4;
        } else if (pageSize === 'letter') {
          [pageWidth, pageHeight] = PageSizes.Letter;
        } else {
          // Fit to image
          pageWidth = width;
          pageHeight = height;
        }

        if (orientation === 'landscape' && pageSize !== 'fit') {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate dimensions and position
        let drawWidth = width;
        let drawHeight = height;
        let x = 0;
        let y = 0;

        if (pageSize !== 'fit') {
          const marginSize = margin === 'none' ? 0 : margin === 'small' ? 20 : 50;
          const availableWidth = pageWidth - (marginSize * 2);
          const availableHeight = pageHeight - (marginSize * 2);

          const scale = Math.min(
            availableWidth / width,
            availableHeight / height
          );

          drawWidth = width * scale;
          drawHeight = height * scale;

          x = (pageWidth - drawWidth) / 2;
          y = (pageHeight - drawHeight) / 2;
        }

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(10 + Math.round(((i + 1) / files.length) * 80));
      }

      setProcessingMessage("Saving PDF...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = safeCreateObjectURL(blob);

      setPdfUrl((prev) => {
        try { safeRevokeObjectURL(prev); } catch { /* ignore */ }
        return url;
      });

      setProgress(100);
      setProcessingMessage("Conversion complete!");

    } catch {
      setError("Failed to create PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  };

  const toolName = "JPG to PDF Converter";
  const toolDescription = "Convert your images to a single PDF document. Support for JPG, PNG, and other image formats. Reorder images, adjust page size and orientation, and download your high-quality PDF instantly.";
  const steps = [
    "Upload your images by dragging them into the dropzone or clicking to select files.",
    "Arrange your images in the desired order by dragging and dropping them in the list.",
    "Customize your PDF settings: choose page size (A4, Letter, or Fit to Image), orientation, and margins.",
    "Click 'Convert to PDF' to generate your document.",
    "Download your newly created PDF file."
  ];
  const faqs = [
    {
      question: "What image formats are supported?",
      answer: "We support JPG, JPEG, and PNG formats. Most standard image files will work seamlessly."
    },
    {
      question: "Can I reorder images after uploading?",
      answer: "Yes! Simply drag and drop the image cards in the list to change their order in the final PDF."
    },
    {
      question: "Is there a limit to how many images I can convert?",
      answer: "You can convert multiple images at once. For best performance, we recommend keeping the total file size under 100MB."
    },
    {
      question: "Does it reduce image quality?",
      answer: "The tool embeds your images directly into the PDF. Quality is preserved, though very large images may be scaled to fit your chosen page size."
    }
  ];

  return (
    <ToolPageLayout
      title="JPG to PDF Converter"
      subtitle="Convert images to PDF in seconds. No file limits, no watermarks."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="jpg-to-pdf"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'JPG to PDF', href: '/jpg-to-pdf' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          multiple={true}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload Images"
          description="Drag & drop or click to select images (JPG, PNG)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="bg-background border border-border p-4">
              <h3 className="text-lg font-medium text-foreground mb-4">PDF Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Page Size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="fit">Fit to Image</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Orientation</Label>
                  <Select value={orientation} onValueChange={setOrientation} disabled={pageSize === 'fit'}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Margins</Label>
                  <Select value={margin} onValueChange={setMargin} disabled={pageSize === 'fit'}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Images ({files.length})</Label>
                <span className="text-xs text-foreground">Drag to reorder</span>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="images-list" direction="vertical">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 max-h-[400px] overflow-y-auto pr-2"
                    >
                      {files.map((file, index) => (
                        <Draggable key={file.id} draggableId={file.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center p-3 bg-background border border-border group hover:border-border transition-colors"
                            >
                              <div className="mr-3 cursor-grab text-foreground group-hover:text-foreground">
                                <Move className="w-4 h-4" />
                              </div>
                              <div className="w-12 h-12 bg-background border border-border mr-3 overflow-hidden flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                                className="text-foreground hover:text-red-400 hover:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-3 p-4 bg-background border border-border">
            <Progress
              value={progress}
              className="h-2.5 bg-background [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:bg-background/70"
            />
            <p className="text-sm text-center text-foreground">
              {processingMessage || `Converting... ${progress}%`}
            </p>
          </div>
        )}

        {error && <Alert variant="destructive">{error}</Alert>}

        <ToolActions
          primary={{
            label: isProcessing ? 'Converting...' : 'Convert to PDF',
            onClick: convertToPdf,
            disabled: files.length === 0 || isProcessing,
          }}
          download={pdfUrl ? { href: pdfUrl, label: 'Download PDF' } : null}
          isProcessing={isProcessing}
        />

        {pdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-background shadow-lg border border-border">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <Download className="w-6 h-6 mr-2" />
                Conversion Complete
              </h3>
              <p className="text-foreground">Your images have been successfully converted to PDF.</p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg" className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-foreground shadow-lg hover:shadow-xl">
                <a
                  href={pdfUrl}
                  download="converted_images.pdf"
                  className="text-center"
                >
                  <span className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </span>
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
