import React, { useRef } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * FileDropzone - Reusable drag-and-drop file upload component
 * Props:
 *   accept: string (e.g. 'application/pdf,image/jpeg')
 *   multiple: boolean
 *   onFiles: function(files: File[])
 *   error: string
 *   setError: function
 *   label: string
 *   description?: string
 */
export default function FileDropzone({
  accept = "application/pdf",
  multiple = false,
  onFiles,
  error = "",
  setError,
  label = "Upload Files",
  description = "Drag & drop or click to select files.",
}) {
  const inputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((file) => accept.split(",").includes(file.type));
    if (valid.length !== files.length) {
      setError && setError("Invalid file type.");
      return;
    }
    setError && setError("");
    onFiles(valid);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const valid = files.filter((file) => accept.split(",").includes(file.type));
    if (valid.length !== files.length) {
      setError && setError("Invalid file type.");
      return;
    }
    setError && setError("");
    onFiles(valid);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <label className="mb-2 font-medium">{label}</label>
      <div
        className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        aria-label={label}
      >
        <span className="text-gray-500 mb-2">{description}</span>
        <Button type="button" variant="secondary" className="mt-2">
          Browse
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  );
}
