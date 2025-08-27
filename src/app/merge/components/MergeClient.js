"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Download, Move, Trash2 } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StandardToolLayout from "@/components/ui/StandardToolLayout";

// Dynamically import heavy PDF libraries only when needed
import { usePDFLib, usePDFJS } from "@/lib/pdfUtils";

export default function MergeClient() {
  const [files, setFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const mergedPdfPreviewCanvasRef = useRef(null);
  const [mergedPdfDocProxy, setMergedPdfDocProxy] = useState(null);
  const renderTaskRef = useRef(null);

  // Load PDF libraries dynamically
  const { PDFLib, loading: pdfLibLoading, error: pdfLibError } = usePDFLib();
  const { pdfjs, loading: pdfjsLoading, error: pdfjsError } = usePDFJS();

  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
      if (mergedPdfDocProxy) {
        mergedPdfDocProxy.destroy();
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [mergedPdfUrl, mergedPdfDocProxy]);

  const renderMergedPdfPreview = useCallback(async () => {
    const canvas = mergedPdfPreviewCanvasRef.current;
    if (!canvas || !mergedPdfDocProxy || !pdfjs) {
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
      }
      return;
    }

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const page = await mergedPdfDocProxy.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const desiredWidth = 800;
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      context.clearRect(0, 0, canvas.width, canvas.height);
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (e) {
      if (e.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF preview:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [mergedPdfDocProxy, pdfjs]);

  useEffect(() => {
    renderMergedPdfPreview();
  }, [renderMergedPdfPreview]);

  const handleFiles = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError("");
    setMergedPdfUrl(null);
    if (mergedPdfDocProxy) {
      mergedPdfDocProxy.destroy();
      setMergedPdfDocProxy(null);
    }
    setProgress(0);
  };

  const removeFile = useCallback(
    (indexToRemove) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
      setMergedPdfUrl(null);
      if (mergedPdfDocProxy) {
        mergedPdfDocProxy.destroy();
        setMergedPdfDocProxy(null);
      }
      setProgress(0);
    },
    [mergedPdfDocProxy]
  );

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragItemIndex = dragItem.current;
    const dragOverItemIndex = dragOverItem.current;
    if (dragItemIndex !== null && dragOverItemIndex !== null) {
      setFiles((prevFiles) => {
        const draggedItem = prevFiles[dragItemIndex];
        const newFiles = [...prevFiles];
        newFiles.splice(dragItemIndex, 1);
        newFiles.splice(dragOverItemIndex, 0, draggedItem);
        return newFiles;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragLeave = () => {};

  const mergePDFs = async () => {
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    
    if (!PDFLib) {
      setError("PDF library not loaded. Please try again.");
      return;
    }
    
    setIsMerging(true);
    setError("");
    setProgress(0);
    
    try {
      const url = await import('@/lib/pdfUtils').then(utils => 
        utils.mergePDFs(files, setProgress)
      );
      
      setMergedPdfUrl(url);
      
      if (pdfjs) {
        try {
          const pdfDoc = await pdfjs.getDocument(url).promise;
          setMergedPdfDocProxy(pdfDoc);
        } catch (previewError) {
          console.error("Error loading merged PDF for preview:", previewError);
        }
      }
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setError("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  const toolName = "Merge PDFs";
  const toolDescription = "Effortlessly combine multiple PDF files into a single, organized document with our easy-to-use PDF merger. Whether you're assembling a report, archiving documents, or preparing a presentation, our tool simplifies the process. Drag and drop your files, reorder them as needed, and merge them in seconds—all for free and right in your browser.";
  const steps = [
    "Upload your PDF files by dragging them into the dropzone or by clicking to select them from your device.",
    "Once uploaded, you can see a list of your files. Drag and drop the files to arrange them in the desired order for the final document.",
    "Click the 'Merge PDFs' button. Our tool will instantly combine all the uploaded files into a single PDF.",
    "A preview of the merged PDF will appear. You can then download the final, merged PDF to your device.",
  ];
  const faqs = [
    {
      question: "Is it free to merge PDF files?",
      answer: "Yes, our PDF merger is completely free to use. You can combine as many PDF files as you want without any hidden fees or limits."
    },
    {
      question: "Are my files secure when merging PDFs?",
      answer: "Absolutely. All processing, including merging, happens in your browser. Your files are never uploaded or stored on any server."
    },
    {
      question: "Can I reorder files before merging?",
      answer: "Yes, you can drag and drop your uploaded files to arrange them in any order you prefer before merging."
    },
    {
      question: "Is there a limit on the number or size of files?",
      answer: "You can upload multiple files, up to 50MB each. For best performance, keep the total number of files reasonable."
    },
    {
      question: "Will merging affect the quality of my PDFs?",
      answer: "No, merging simply combines your files. The original quality and content of each PDF is preserved in the final document."
    }
  ];

  return (
    <StandardToolLayout
      title="Merge PDFs"
      subtitle="Combine multiple PDF files into one seamless document. Drag and drop to arrange their order."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="merge"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Merge PDFs', href: '/merge' }
      ]}
    >
      <div className="space-y-6">
        {(pdfLibLoading || pdfjsLoading) ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-xl border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300">Loading PDF processing tools...</p>
          </div>
        ) : (
          <FileDropzone
            accept="application/pdf"
            multiple
            onFiles={handleFiles}
            error={error}
            setError={setError}
            label="Choose PDF Files"
            description="Drag & drop or click to select PDF files. You can select multiple."
            maxSize={50 * 1024 * 1024}
            isLoading={isMerging}
          />
        )}
        
        {(pdfLibError || pdfjsError) && (
          <Alert variant="destructive" className="mt-4">
            Error loading PDF processing tools. Please refresh the page.
          </Alert>
        )}
        
        {files.length > 0 && (
          <div className="mt-4 p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl text-gray-100 flex items-center">
                <Move className="w-5 h-5 mr-2 text-blue-400" />
                Files to Merge (Drag to Reorder)
              </h2>
              <span className="text-sm text-gray-400">{files.length} files</span>
            </div>
            
            <ul
              className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2"
              aria-label="List of PDF files to merge"
            >
              {files.map((file, index) => (
                <li
                  key={file.name + file.lastModified}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  className={`file-item flex items-center justify-between p-4 rounded-lg border-2 border-gray-600 bg-gray-700/50 text-gray-100 cursor-grab transition-all duration-200 ${
                    dragItem.current === index ? "opacity-75 shadow-lg ring-2 ring-blue-500" : ""
                  } ${
                    dragOverItem.current === index &&
                    dragItem.current !== index
                      ? "scale-[1.02] border-blue-500 bg-blue-500/10"
                      : ""
                  }`}
                  aria-grabbed={dragItem.current === index ? "true" : "false"}
                  aria-roledescription="Draggable file item"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="font-medium line-clamp-1">{file.name}</span>
                      <span className="text-xs text-gray-400 block">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="ml-2 px-2 py-0.5"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isMerging && (
          <div className="space-y-3">
            <Progress
              value={progress}
              className="h-2.5 bg-gray-700 [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-blue-500 rounded-full"
            />
            <p className="text-sm text-center text-gray-400">
              Merging PDFs... {progress}%
            </p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={mergePDFs}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            variant="default"
            size="lg"
            disabled={isMerging || files.length === 0}
            aria-label="Merge selected PDF files"
          >
            {isMerging ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Merging...
              </span>
            ) : (
              "Merge PDFs"
            )}
          </Button>
        </div>
        
        {mergedPdfUrl && !isMerging && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center">
                <Download className="w-6 h-6 mr-2 text-green-400" />
                Merged PDF Ready
              </h3>
              
              <div className="w-full flex justify-center items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative p-4">
                <canvas
                  ref={mergedPdfPreviewCanvasRef}
                  className="max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                  aria-label="Merged PDF preview"
                ></canvas>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                asChild
                variant="success"
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
              >
                <a
                  href={mergedPdfUrl}
                  download="merged.pdf"
                  className="text-center flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Merged PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </StandardToolLayout>
  );
}
