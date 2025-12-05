// src/components/ui/FileDropzone.jsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, UploadCloud, X, CheckCircle, AlertCircle } from "lucide-react";
import Loader from "./Loader";
import { Button } from "./button";
import { Card } from "./card";
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
          // Accept exact mime types (video/webm) as well as wildcards like video/*
          let isMimeTypeAccepted = false;
          for (const mt of acceptedMimeTypesSet) {
            if (mt.endsWith('/*')) {
              const prefix = mt.split('/')[0] + '/';
              if (file.type && file.type.startsWith(prefix)) {
                isMimeTypeAccepted = true;
                break;
              }
            } else if (file.type === mt) {
              isMimeTypeAccepted = true;
              break;
            }
          }

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
      <label className="block text-sm font-medium text-foreground">{label}</label>

      <Card
        variant={isDragActive ? "elevated" : "glass"}
        className={cn(
          "relative border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden",
          isDragActive
            ? "border-secondary bg-primary/5 scale-[1.02] shadow-xl shadow-secondary/20 animate-pulse"
            : "border-border hover:border-secondary/50 hover:shadow-lg",
          (internalError || externalError) && "border-destructive bg-destructive/5"
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/5 animate-gradient" />
        )}

        <div className="relative p-8 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center animate-in fade-in-0 duration-300">
              <Loader className="mb-2" />
              <span className="text-sm text-muted-foreground">Processing files...</span>
            </div>
          ) : (
            <>
              <div className={cn(
                "mb-4 p-4 transition-all duration-300",
                isDragActive 
                  ? "bg-primary shadow-lg scale-110" 
                  : "bg-muted group-hover:scale-105"
              )}>
                <UploadCloud
                  className={cn(
                    "w-8 h-8 transition-all duration-300",
                    isDragActive ? "text-primary-foreground animate-bounce" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive ? "Drop files here!" : description}
                </p>
                <p className="text-sm text-muted-foreground">
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
              <span className="text-xs text-muted-foreground">
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
                  <div className="p-2 bg-primary shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-sm flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
        <Card variant="glass" className="border-destructive/50 bg-destructive/10 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-destructive text-sm flex-1">
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