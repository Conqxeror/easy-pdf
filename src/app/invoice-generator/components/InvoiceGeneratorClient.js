"use client";

import { useMemo, useState } from "react";
import { Calculator, Download, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toolsData } from "@/lib/toolData";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];
const TEMPLATES = {
  classic: { name: "Classic", color: [0.1, 0.1, 0.1] },
  blue: { name: "Blue", color: [0.15, 0.39, 0.92] },
  green: { name: "Green", color: [0.09, 0.47, 0.27] },
};

const emptyLineItem = () => ({ description: "", quantity: "1", unitPrice: "0" });

const toAmount = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (currency, value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function InvoiceGeneratorClient() {
  const [invoiceData, setInvoiceData] = useState({
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "USD",
    taxRate: "0",
    notes: "",
    template: "classic",
    items: [emptyLineItem()],
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toolData = toolsData.find((tool) => tool.href === "/invoice-generator");

  const totals = useMemo(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => {
      return sum + toAmount(item.quantity) * toAmount(item.unitPrice);
    }, 0);
    const tax = subtotal * (toAmount(invoiceData.taxRate) / 100);
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [invoiceData.items, invoiceData.taxRate]);

  const updateField = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({ ...prev, items: [...prev.items, emptyLineItem()] }));
  };

  const removeItem = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, itemIndex) => itemIndex !== index) : prev.items,
    }));
  };

  const generateInvoice = async () => {
    if (!invoiceData.companyName.trim() || !invoiceData.clientName.trim()) {
      setError("Company name and client name are required.");
      return;
    }

    const validItems = invoiceData.items.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      setError("Add at least one line item with a description.");
      return;
    }

    setError("");
    setStatus("");
    setIsGenerating(true);

    try {
      const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const theme = TEMPLATES[invoiceData.template] || TEMPLATES.classic;

      let page = pdfDoc.addPage([595.28, 841.89]);
      let { width, height } = page.getSize();
      let cursorY = height - 56;

      const ensureSpace = (required = 32) => {
        if (cursorY > required) {
          return;
        }

        page = pdfDoc.addPage([595.28, 841.89]);
        ({ width, height } = page.getSize());
        cursorY = height - 56;
      };

      const drawText = (text, x, y, options = {}) => {
        page.drawText(String(text || ""), {
          x,
          y,
          size: options.size || 11,
          font: options.bold ? boldFont : font,
          color: options.color || rgb(0.1, 0.1, 0.1),
        });
      };

      page.drawRectangle({ x: 32, y: height - 76, width: width - 64, height: 44, color: rgb(...theme.color) });
      drawText("INVOICE", 42, height - 60, { size: 24, bold: true, color: rgb(1, 1, 1) });
      drawText(`# ${invoiceData.invoiceNumber}`, width - 160, height - 56, { size: 12, bold: true, color: rgb(1, 1, 1) });
      cursorY = height - 110;

      drawText("From", 40, cursorY, { size: 12, bold: true, color: rgb(...theme.color) });
      drawText("Bill To", 320, cursorY, { size: 12, bold: true, color: rgb(...theme.color) });
      cursorY -= 22;

      [
        invoiceData.companyName,
        invoiceData.companyEmail,
        invoiceData.companyAddress,
      ].filter(Boolean).forEach((line, index) => drawText(line, 40, cursorY - index * 16));

      [
        invoiceData.clientName,
        invoiceData.clientEmail,
        invoiceData.clientAddress,
      ].filter(Boolean).forEach((line, index) => drawText(line, 320, cursorY - index * 16));

      cursorY -= 72;
      drawText(`Issue Date: ${invoiceData.issueDate || "-"}`, 40, cursorY, { bold: true });
      drawText(`Due Date: ${invoiceData.dueDate || "-"}`, 220, cursorY, { bold: true });
      drawText(`Currency: ${invoiceData.currency}`, 400, cursorY, { bold: true });
      cursorY -= 28;

      page.drawRectangle({ x: 40, y: cursorY - 6, width: width - 80, height: 24, color: rgb(0.94, 0.95, 0.97) });
      drawText("Description", 48, cursorY, { bold: true });
      drawText("Qty", 340, cursorY, { bold: true });
      drawText("Unit Price", 390, cursorY, { bold: true });
      drawText("Amount", 490, cursorY, { bold: true });
      cursorY -= 28;

      validItems.forEach((item) => {
        ensureSpace(140);
        const amount = toAmount(item.quantity) * toAmount(item.unitPrice);
        drawText(item.description.slice(0, 42), 48, cursorY);
        drawText(String(item.quantity || "0"), 344, cursorY);
        drawText(formatCurrency(invoiceData.currency, toAmount(item.unitPrice)), 390, cursorY);
        drawText(formatCurrency(invoiceData.currency, amount), 480, cursorY);
        cursorY -= 22;
      });

      cursorY -= 8;
      page.drawLine({ start: { x: 320, y: cursorY }, end: { x: width - 40, y: cursorY }, thickness: 1, color: rgb(0.8, 0.82, 0.86) });
      cursorY -= 24;
      drawText("Subtotal", 390, cursorY, { bold: true });
      drawText(formatCurrency(invoiceData.currency, totals.subtotal), 480, cursorY);
      cursorY -= 18;
      drawText(`Tax (${toAmount(invoiceData.taxRate).toFixed(2)}%)`, 390, cursorY, { bold: true });
      drawText(formatCurrency(invoiceData.currency, totals.tax), 480, cursorY);
      cursorY -= 22;
      drawText("Total", 390, cursorY, { size: 13, bold: true, color: rgb(...theme.color) });
      drawText(formatCurrency(invoiceData.currency, totals.total), 470, cursorY, { size: 13, bold: true, color: rgb(...theme.color) });
      cursorY -= 44;

      if (invoiceData.notes.trim()) {
        ensureSpace(120);
        drawText("Notes", 40, cursorY, { size: 12, bold: true, color: rgb(...theme.color) });
        cursorY -= 20;
        invoiceData.notes
          .split("\n")
          .flatMap((line) => line.match(/.{1,78}/g) || [line])
          .forEach((line) => {
            ensureSpace(80);
            drawText(line, 40, cursorY);
            cursorY -= 16;
          });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = safeCreateObjectURL(blob);
      if (!url) {
        throw new Error("Unable to create a downloadable PDF in this browser.");
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceData.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      safeRevokeObjectURL(url);
      setStatus("Invoice generated and download started.");
    } catch (generationError) {
      setError(
        generationError instanceof Error && generationError.message
          ? generationError.message
          : "Failed to generate the invoice PDF."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const toolName = toolData?.title || "PDF Invoice Generator";
  const toolDescription =
    "Create a local PDF invoice with company details, client billing information, line items, tax calculations, multiple currencies, and a downloadable PDF output.";

  const steps = [
    "Enter your company and client billing details.",
    "Add one or more line items with quantities and unit prices.",
    "Choose the currency, tax rate, and a simple invoice theme.",
    "Generate and download the finished PDF invoice directly in your browser.",
  ];

  const faqs = [
    {
      question: "Is it free to create invoices?",
      answer: "Yes, this invoice generator is free to use.",
    },
    {
      question: "Are my invoice details secure?",
      answer: "Yes. Invoice generation happens locally in your browser and the invoice data is not uploaded by this tool.",
    },
    {
      question: "Does the invoice generator support GST or VAT style tax calculations?",
      answer: "Yes. You can enter a percentage tax rate and the generator will calculate tax and totals automatically.",
    },
    {
      question: "Can I add my company logo?",
      answer: "This browser version focuses on text-based invoice layouts. If you need a logo, you can add it after download in a PDF editor.",
    },
  ];

  const useCases = [
    {
      title: "Freelancer billing",
      description: "Create clean PDF invoices for project-based work with taxes and due dates.",
    },
    {
      title: "Small business invoicing",
      description: "Generate invoices for products or services with client details and itemized totals.",
    },
  ];

  return (
    <ToolPageLayout
      title="PDF Invoice Generator"
      subtitle="Create local PDF invoices with itemized charges, tax, due dates, and multiple currencies."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="invoice-generator"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF Invoice Generator", href: "/invoice-generator" },
      ]}
      features={toolData?.features || []}
      useCases={useCases}
    >
      <div className="space-y-6">
        {status && <Alert>{status}</Alert>}
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" value={invoiceData.companyName} onChange={(event) => updateField("companyName", event.target.value)} placeholder="Acme Studio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Company Email</Label>
                <Input id="company-email" value={invoiceData.companyEmail} onChange={(event) => updateField("companyEmail", event.target.value)} placeholder="billing@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Company Address</Label>
                <Textarea id="company-address" value={invoiceData.companyAddress} onChange={(event) => updateField("companyAddress", event.target.value)} placeholder="123 Market Street&#10;City, Country" rows={4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name</Label>
                <Input id="client-name" value={invoiceData.clientName} onChange={(event) => updateField("clientName", event.target.value)} placeholder="Client Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email</Label>
                <Input id="client-email" value={invoiceData.clientEmail} onChange={(event) => updateField("clientEmail", event.target.value)} placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">Client Address</Label>
                <Textarea id="client-address" value={invoiceData.clientAddress} onChange={(event) => updateField("clientAddress", event.target.value)} placeholder="Client billing address" rows={4} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input id="invoice-number" value={invoiceData.invoiceNumber} onChange={(event) => updateField("invoiceNumber", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input id="issue-date" type="date" value={invoiceData.issueDate} onChange={(event) => updateField("issueDate", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input id="due-date" type="date" value={invoiceData.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={invoiceData.currency} onChange={(event) => updateField("currency", event.target.value)}>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate %</Label>
              <Input id="tax-rate" type="number" min="0" step="0.01" value={invoiceData.taxRate} onChange={(event) => updateField("taxRate", event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoiceData.items.map((item, index) => (
              <div key={`item-${index}`} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[2fr,100px,140px,auto]">
                <div className="space-y-2">
                  <Label htmlFor={`item-description-${index}`}>Description</Label>
                  <Input id={`item-description-${index}`} value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="Design retainer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`item-quantity-${index}`}>Qty</Label>
                  <Input id={`item-quantity-${index}`} type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`item-price-${index}`}>Unit Price</Label>
                  <Input id={`item-price-${index}`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} />
                </div>
                <div className="flex items-end justify-end">
                  <Button type="button" variant="ghost" onClick={() => removeItem(index)} disabled={invoiceData.items.length === 1}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Notes and Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={invoiceData.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Payment due within 14 days. Thank you for your business." rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Theme</Label>
                <select id="template" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={invoiceData.template} onChange={(event) => updateField("template", event.target.value)}>
                  {Object.entries(TEMPLATES).map(([value, template]) => (
                    <option key={value} value={value}>{template.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" aria-hidden="true" />
                Invoice Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(invoiceData.currency, totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatCurrency(invoiceData.currency, totals.tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(invoiceData.currency, totals.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button onClick={generateInvoice} disabled={isGenerating} size="lg">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {isGenerating ? "Generating Invoice..." : "Generate Invoice PDF"}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}