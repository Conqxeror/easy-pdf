"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PortfolioCreatorClient() {
  const [file] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  const handleFiles = (files) => {
    console.log(files);
  };

  return (
    <div>
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf, image/*, text/plain"
          multiple={true}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Add Portfolio Content"
          description="Upload documents, images, or text files to include in your portfolio"
          maxSize={50 * 1024 * 1024}
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
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Creating Portfolio...
              </span>
            ) : (
              "Create Portfolio"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}