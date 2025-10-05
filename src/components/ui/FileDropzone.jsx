// src/components/ui/FileDropzone.jsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, UploadCloud, X, CheckCircle, AlertCircle } from "lucide-react";
import Loader from "./Loader";
import { Button } from "./button";
import { Card } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";

const FileDropzone = ({
  accept = ".pdf",
  multiple = false,
  onFiles,
  error: externalError = "",
  setError,
  label = "Upload Files",
  description = "Drag & drop or click to select files",
  maxSize = 10 * 1024 * 1024,
  isLoading = false,
}) => {
  const inputRef = useRef();
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [internalError, setInternalError] = useState("");

  // Helper function to map common extensions to MIME types
  const getMimeTypesFromExtensions = useCallback((acceptString) => {
    if (!acceptString) return new Set();
    const extensions = acceptString.split(",").map((ext) => ext.trim());
    const mimeMap = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    const mimeSet = new Set();
    extensions.forEach((ext) => {
      if (mimeMap[ext]) {
        mimeSet.add(mimeMap[ext]);
      } else if (ext.includes("/")) {
        mimeSet.add(ext);
      }
    });
    return mimeSet;
  }, []);

  const acceptedMimeTypesSet = getMimeTypesFromExtensions(accept);

  const processFiles = useCallback(
    (newFiles) => {
      const validFiles = [];
      const invalidFiles = [];
      let currentErrorMessages = [];

      newFiles.forEach((file) => {
        let isValid = true;
        let reason = "";

        // Check file type
        if (acceptedMimeTypesSet.size > 0) {
          let isMimeTypeAccepted = acceptedMimeTypesSet.has(file.type);

          // Fallback check: if direct MIME type doesn't match, try matching by extension
          if (!isMimeTypeAccepted && file.name) {
            const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
            const mappedMimeFromExtension = getMimeTypesFromExtensions(fileExtension).values().next().value;
            if (mappedMimeFromExtension && acceptedMimeTypesSet.has(mappedMimeFromExtension)) {
              isMimeTypeAccepted = true;
            }
          }

          if (!isMimeTypeAccepted) {
            isValid = false;
            reason = "Invalid file type";
          }
        }

        // Check file size if already valid by type
        if (isValid && file.size > maxSize) {
          isValid = false;
          reason = `File too large (max ${maxSize / 1024 / 1024}MB)`;
        }

        if (!isValid) {
          invalidFiles.push({ file, reason });
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        invalidFiles.forEach(({ file, reason }) => {
          currentErrorMessages.push(`${file.name}: ${reason}`);
        });
        const errorMessage = "Some files were rejected:\n" + currentErrorMessages.join("\n");
        setInternalError(errorMessage);
        if (setError) {
          setError(errorMessage);
        }
      } else {
        setInternalError("");
        if (setError) {
          setError("");
        }
      }

      const finalFiles = multiple
        ? [...files, ...validFiles]
        : validFiles.slice(0, 1);

      setFiles(finalFiles);
      if (onFiles) {
        onFiles(finalFiles);
      }
    },
    [
      maxSize,
      multiple,
      files,
      onFiles,
      setError,
      acceptedMimeTypesSet,
      getMimeTypesFromExtensions,
    ]
  );

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
    [processFiles]
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    if (onFiles) {
      onFiles(newFiles);
    }
    setInternalError("");
    if (setError) {
      setError("");
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  const inputAcceptAttribute = Array.from(acceptedMimeTypesSet).join(",");

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      <Card
        variant={isDragActive ? "elevated" : "glass"}
        className={cn(
          "relative border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden",
          isDragActive
            ? "border-gray-600 dark:border-gray-400 bg-gray-50/50 dark:bg-gray-950/30 scale-[1.02] shadow-xl shadow-gray-500/20 animate-pulse"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg",
          (internalError || externalError) && "border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-950/20"
        )}
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="File drop zone"
      >
        {/* Animated Background Gradient on Drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-gray-600/10 to-gray-600/10 animate-gradient" />
        )}

        <div className="relative p-8 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center animate-in fade-in-0 duration-300">
              <Loader className="mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing files...</span>
            </div>
          ) : (
            <>
              <div className={cn(
                "mb-4 p-4 transition-all duration-300",
                isDragActive 
                  ? "bg-gray-950 dark:bg-gray-950 shadow-lg scale-110" 
                  : "bg-gray-100 dark:bg-gray-950/30 group-hover:scale-105"
              )}>
                <UploadCloud
                  className={cn(
                    "w-8 h-8 transition-all duration-300",
                    isDragActive ? "text-white animate-bounce" : "text-gray-700 dark:text-gray-400"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isDragActive ? "Drop files here!" : description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {accept
                    .split(",")
                    .map((s) => s.replace(".", "").toUpperCase())
                    .join(", ")}{" "}
                  • Max {maxSize / 1024 / 1024}MB per file
                </p>
              </div>
              {!isDragActive && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse Files
                </Button>
              )}
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={inputAcceptAttribute}
            multiple={multiple}
            className="hidden"
            onChange={handleChange}
            aria-hidden="true"
          />
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </Badge>
            {files.length > 1 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total: {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>
          
          {files.map((file, index) => (
            <Card
              key={`${file.name}-${index}`}
              variant="glass"
              className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-gray-950 dark:bg-gray-950 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-gray-100 font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 animate-in fade-in-0 zoom-in-95 duration-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-medium hidden sm:inline">Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(internalError || externalError) && (
        <Card variant="glass" className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 dark:text-red-300 text-sm flex-1">
              {(internalError || externalError).split("\n").map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileDropzone;