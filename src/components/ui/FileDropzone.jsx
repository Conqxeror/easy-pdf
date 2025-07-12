// src/components/ui/FileDropzone.jsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, UploadCloud, X } from "lucide-react";
import Loader from "./Loader";
import { Button } from "./button";

const FileDropzone = ({
  accept = ".pdf", // e.g., ".pdf,.doc,.docx,.jpg,.jpeg,.png"
  multiple = false,
  onFiles,
  error: externalError = "", // Renamed prop to avoid conflict with internal state
  setError, // Prop for setting error on parent
  label = "Upload Files",
  description = "Drag & drop or click to select files",
  maxSize = 10 * 1024 * 1024, // 10MB default
  isLoading = false,
}) => {
  const inputRef = useRef();
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [internalError, setInternalError] = useState(""); // Internal state for error messages

  // Helper function to map common extensions to MIME types
  const getMimeTypesFromExtensions = useCallback((acceptString) => {
    if (!acceptString) return new Set();
    const extensions = acceptString.split(",").map((ext) => ext.trim());
    const mimeMap = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      // Add other common types if needed
    };
    const mimeSet = new Set();
    extensions.forEach((ext) => {
      if (mimeMap[ext]) {
        mimeSet.add(mimeMap[ext]);
      } else if (ext.includes("/")) {
        // If it's already a MIME type (e.g., "image/*")
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
          // This is useful for files with generic MIME types (e.g., 'application/octet-stream')
          if (!isMimeTypeAccepted && file.name) {
            const fileExtension = `.${file.name
              .split(".")
              .pop()
              .toLowerCase()}`;
            const mappedMimeFromExtension = getMimeTypesFromExtensions(
              fileExtension
            )
              .values()
              .next().value;
            if (
              mappedMimeFromExtension &&
              acceptedMimeTypesSet.has(mappedMimeFromExtension)
            ) {
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
        const errorMessage = `Some files were rejected:\n${currentErrorMessages.join(
          "\n"
        )}`;
        setInternalError(errorMessage);
        if (setError) {
          // Also pass up to parent if prop exists
          setError(errorMessage);
        }
      } else {
        setInternalError(""); // Clear internal error
        if (setError) {
          // Clear parent error
          setError("");
        }
      }

      const finalFiles = multiple
        ? [...files, ...validFiles] // Add new valid files to existing ones if multiple
        : validFiles.slice(0, 1); // Take only the first valid file if single

      setFiles(finalFiles);
      if (onFiles) {
        // Only call onFiles if it's provided
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
        // Reset input value to allow selecting same file again
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
    setInternalError(""); // Clear any previous error specific to removed file
    if (setError) {
      setError("");
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  // Convert the accept prop (e.g., ".pdf,.doc") into MIME types for the input element
  const inputAcceptAttribute = Array.from(acceptedMimeTypesSet).join(",");

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-900/20"
            : "border-gray-600 hover:border-gray-500 bg-gray-800",
          (internalError || externalError) && "border-red-500"
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
                Accepted:{" "}
                {accept
                  .split(",")
                  .map((s) => s.replace(".", "").toUpperCase())
                  .join(", ")}{" "}
                (max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={(e) => e.stopPropagation()} // Prevent re-triggering openFileDialog when clicking the button
            >
              Browse Files
            </Button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={inputAcceptAttribute} // Use the derived MIME types for browser filtering
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

      {(internalError || externalError) && (
        <div className="mt-2 p-3 bg-red-900/20 border border-red-500 rounded-md">
          <div className="text-red-400 text-sm">
            {(internalError || externalError).split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
