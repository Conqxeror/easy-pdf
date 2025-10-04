"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function CertificateGeneratorClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/certificate-generator');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "Certificate Generator";
  const toolDescription = toolData?.description || "Create professional certificates for courses, training, achievements, and more with customizable templates. Our free online certificate generator allows you to design and export beautiful certificates with your branding, making recognition and awards more meaningful and professional.";
  
  const steps = [
    "Choose a certificate template that best suits your needs (academic, professional, achievement, participation, etc.).",
    "Add your organization or institution information including name, logo, and contact details.",
    "Enter recipient details such as name, course or achievement, date, and any additional information.",
    "Customize the certificate with colors, fonts, borders, and decorative elements to match your branding.",
    "Preview your certificate to ensure all details are correct and visually appealing.",
    "Download your professionally formatted PDF certificate ready for printing or digital distribution.",
  ];
  
  const faqs = [
    {
      question: "Is it free to create certificates?",
      answer: "Yes, our certificate generator is completely free to use. You can create unlimited certificates without any hidden costs or limitations."
    },
    {
      question: "Are my certificates secure?",
      answer: "Absolutely. All certificate creation happens directly in your browser. Your data is never uploaded to any server, ensuring complete privacy for your certificate information."
    },
    {
      question: "Can I add my organization's logo to certificates?",
      answer: "Yes, you can upload your organization's logo to add a professional touch to your certificates. The logo will be displayed prominently on all your certificate documents."
    },
    {
      question: "What certificate templates are available?",
      answer: "Our tool offers multiple certificate templates including academic, professional, achievement, participation, and completion certificates. You can customize colors, fonts, and layouts to match your branding."
    },
    {
      question: "Can I save certificate templates for future use?",
      answer: "Yes, you can save your organization information and create custom templates that can be reused for future certificates, saving you time on repetitive data entry."
    }
  ];
  
  const useCases = [
    {
      title: "Academic Institutions",
      description: "Create course completion certificates, diplomas, and academic achievement awards for students with professional formatting and institutional branding."
    },
    {
      title: "Corporate Training",
      description: "Generate employee training completion certificates, professional development awards, and skill certification documents with company branding."
    },
    {
      title: "Professional Organizations",
      description: "Design membership certificates, professional recognition awards, and continuing education credits with organization-specific styling and details."
    },
    {
      title: "Event Planning",
      description: "Create participation certificates, attendance proofs, and event completion awards for conferences, workshops, and community gatherings."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="Certificate Generator"
      subtitle="Create professional certificates for courses, training, achievements, and more with customizable templates."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="certificate-generator"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Certificate Generator', href: '/certificate-generator' }
      ]}
      features={toolData?.features || []}
      useCases={useCases}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf, image/*, text/plain"
          multiple={true}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Add Certificate Content"
          description="Upload your logo, background image, or text files to include in your certificate"
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
                Creating Certificate...
              </span>
            ) : (
              "Create Certificate"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}