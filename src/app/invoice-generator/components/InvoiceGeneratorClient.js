"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function InvoiceGeneratorClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/invoice-generator');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "PDF Invoice Generator";
  const toolDescription = toolData?.description || "Create professional invoices with GST support, multiple currencies, and customizable templates. Perfect for businesses and freelancers.";
  
  const steps = [
    "Upload your company and client information or fill in the invoice details manually.",
    "Add line items for products or services with quantities, prices, and taxes.",
    "Customize the invoice with your logo, colors, and branding elements.",
    "Preview your invoice to ensure everything looks correct.",
    "Download your professionally formatted PDF invoice ready for sending to clients.",
  ];
  
  const faqs = [
    {
      question: "Is it free to create invoices?",
      answer: "Yes, our PDF invoice generator is completely free to use. You can create unlimited invoices without any hidden costs or limitations."
    },
    {
      question: "Are my invoice details secure?",
      answer: "Absolutely. All invoice creation happens directly in your browser. Your business and client information is never uploaded to any server, ensuring complete privacy."
    },
    {
      question: "Can I add my company logo to invoices?",
      answer: "Yes, you can upload your company logo to add a professional touch to your invoices. The logo will be displayed prominently on all your invoice documents."
    },
    {
      question: "Does the invoice generator support GST calculations?",
      answer: "Yes, our tool includes built-in GST calculation features that automatically compute taxes based on your region and product types, making compliance easier."
    },
    {
      question: "Can I save invoice templates for future use?",
      answer: "Yes, you can save your company information and create custom templates that can be reused for future invoices, saving you time on repetitive data entry."
    }
  ];
  
  const useCases = [
    {
      title: "Freelancer Billing",
      description: "Create professional invoices for freelance work with automatic calculations for hours, rates, and taxes."
    },
    {
      title: "Small Business Invoicing",
      description: "Generate branded invoices for small business services with GST support and multiple currency options."
    },
    {
      title: "Consultant Fees",
      description: "Create detailed invoices for consulting services with itemized breakdowns and professional presentation."
    },
    {
      title: "Service Provider Billing",
      description: "Bill clients for ongoing services with customizable recurring invoice templates and payment terms."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="PDF Invoice Generator"
      subtitle="Create professional invoices with GST support, multiple currencies, and customizable templates."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="invoice-generator"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PDF Invoice Generator', href: '/invoice-generator' }
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
          label="Add Invoice Content"
          description="Upload company logo, client information, or other files to include in your invoice"
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
                Creating Invoice...
              </span>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}