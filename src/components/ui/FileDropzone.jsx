import React, { useRef, useState, useCallback } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileDropzone({
  accept = "application/pdf",
  multiple = false,
  onFiles,
  error = "",
  setError,
  label = "Upload Files",
  description = "Drag & drop or click to select files",
  maxSize = 10 * 1024 * 1024, // 10MB default
  isLoading = false,
}) {
  const inputRef = useRef();
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
      }
    },
    [accept, maxSize, multiple]
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(Array.from(e.target.files));
        // Reset input value to allow selecting same file again
        e.target.value = "";
      }
    },
    [accept, maxSize, multiple]
  );

  const processFiles = (newFiles) => {
    const validFiles = [];
    const invalidFiles = [];

    newFiles.forEach((file) => {
      // Check file type
      if (accept && !accept.split(",").includes(file.type)) {
        invalidFiles.push({ file, reason: "Invalid file type" });
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        invalidFiles.push({ file, reason: "File too large" });
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(
        ({ file, reason }) => `${file.name}: ${reason}`
      );
      setError(`Some files were rejected:\n${errorMessages.join("\n")}`);
    } else {
      setError("");
    }

    const finalFiles = multiple
      ? [...files, ...validFiles]
      : validFiles.slice(0, 1);
    setFiles(finalFiles);
    onFiles(finalFiles);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFiles(newFiles);
    setError("");
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-900/20"
            : "border-gray-600 hover:border-gray-500 bg-gray-800/50",
          error && "border-red-500"
        )}
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="File drop zone"
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader className="mb-2" />
            <span className="text-sm text-gray-400">Processing files...</span>
          </div>
        ) : (
          <>
            <UploadCloud
              className={cn(
                "w-10 h-10 mb-3 transition-colors",
                isDragActive ? "text-blue-400" : "text-gray-400"
              )}
            />
            <div className="text-center">
              <p className="text-sm text-gray-300">{description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {accept} (max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              Browse Files
            </Button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
          aria-hidden="true"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-300 line-clamp-1">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          {error.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </Alert>
      )}
    </div>
  );
}
