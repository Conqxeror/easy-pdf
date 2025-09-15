"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function QrGeneratorClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  return (
    <ToolPageLayout>
      <div className="space-y-6">
        <FileDropzone
          accept="text/plain"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Enter QR Code Content"
          description="Type or paste the content for your QR code (URL, text, WiFi credentials, etc.)"
          maxSize={10 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => {}}
            disabled={isProcessing || !file}
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating QR Code...
              </span>
            ) : (
              "Generate QR Code"
            )}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}