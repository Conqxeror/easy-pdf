"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, FileText, Calculator } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function InvoiceGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'INR',
    
    // Company details
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    companyGST: '',
    
    // Client details
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    clientGST: '',
    
    // Invoice items
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    
    // Totals
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    total: 0,
    
    // Additional
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.'
  });

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const newItems = invoiceData.items.filter((_, i) => i !== index);
      setInvoiceData(prev => ({ ...prev, items: newItems }));
      calculateTotals(newItems);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setInvoiceData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const calculateTotals = (items = invoiceData.items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * invoiceData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  const updateInvoiceData = (field, value) => {
    setInvoiceData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate if tax rate changes
      if (field === 'taxRate') {
        const taxAmount = (updated.subtotal * value) / 100;
        updated.taxAmount = taxAmount;
        updated.total = updated.subtotal + taxAmount;
      }
      
      return updated;
    });
  };

  const generateInvoicePDF = async () => {
    if (!invoiceData.companyName || !invoiceData.clientName) {
      alert('Please fill in company and client names');
      return;
    }

    setIsGenerating(true);
    trackEvent('invoice_generation_started');

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      let yPosition = height - 50;

      // Header
      page.drawText('INVOICE', {
        x: 50,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8)
      });

      page.drawText(`Invoice #: ${invoiceData.invoiceNumber}`, {
        x: width - 200,
        y: yPosition,
        size: 12,
        font: boldFont
      });

      yPosition -= 20;
      page.drawText(`Date: ${invoiceData.date}`, {
        x: width - 200,
        y: yPosition,
        size: 10,
        font
      });

      yPosition -= 15;
      page.drawText(`Due Date: ${invoiceData.dueDate}`, {
        x: width - 200,
        y: yPosition,
        size: 10,
        font
      });

      yPosition -= 40;

      // Company details
      page.drawText('FROM:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont
      });

      yPosition -= 20;
      const companyLines = [
        invoiceData.companyName,
        invoiceData.companyAddress,
        invoiceData.companyEmail,
        invoiceData.companyPhone,
        invoiceData.companyGST ? `GST: ${invoiceData.companyGST}` : ''
      ].filter(Boolean);

      companyLines.forEach(line => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font
        });
        yPosition -= 15;
      });

      // Client details
      let clientYPosition = height - 130;
      page.drawText('TO:', {
        x: 300,
        y: clientYPosition,
        size: 12,
        font: boldFont
      });

      clientYPosition -= 20;
      const clientLines = [
        invoiceData.clientName,
        invoiceData.clientAddress,
        invoiceData.clientEmail,
        invoiceData.clientPhone,
        invoiceData.clientGST ? `GST: ${invoiceData.clientGST}` : ''
      ].filter(Boolean);

      clientLines.forEach(line => {
        page.drawText(line, {
          x: 300,
          y: clientYPosition,
          size: 10,
          font
        });
        clientYPosition -= 15;
      });

      yPosition = Math.min(yPosition, clientYPosition) - 30;

      // Table header
      // Table starts at current Y position
      page.drawRectangle({
        x: 50,
        y: yPosition - 20,
        width: width - 100,
        height: 20,
        color: rgb(0.9, 0.9, 0.9)
      });

      page.drawText('Description', { x: 60, y: yPosition - 15, size: 10, font: boldFont });
      page.drawText('Qty', { x: 350, y: yPosition - 15, size: 10, font: boldFont });
      page.drawText('Rate', { x: 400, y: yPosition - 15, size: 10, font: boldFont });
      page.drawText('Amount', { x: 480, y: yPosition - 15, size: 10, font: boldFont });

      yPosition -= 30;

      // Table items
      invoiceData.items.forEach((item, index) => {
        if (yPosition < 150) {
          // Add new page if needed
          pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }

        page.drawText(item.description || `Item ${index + 1}`, {
          x: 60,
          y: yPosition,
          size: 9,
          font
        });

        page.drawText(item.quantity.toString(), {
          x: 350,
          y: yPosition,
          size: 9,
          font
        });

        page.drawText(`${invoiceData.currency} ${item.rate.toFixed(2)}`, {
          x: 400,
          y: yPosition,
          size: 9,
          font
        });

        page.drawText(`${invoiceData.currency} ${item.amount.toFixed(2)}`, {
          x: 480,
          y: yPosition,
          size: 9,
          font
        });

        yPosition -= 20;
      });

      yPosition -= 20;

      // Totals
      const totalsX = 400;
      page.drawText(`Subtotal: ${invoiceData.currency} ${invoiceData.subtotal.toFixed(2)}`, {
        x: totalsX,
        y: yPosition,
        size: 10,
        font
      });

      yPosition -= 15;
      page.drawText(`Tax (${invoiceData.taxRate}%): ${invoiceData.currency} ${invoiceData.taxAmount.toFixed(2)}`, {
        x: totalsX,
        y: yPosition,
        size: 10,
        font
      });

      yPosition -= 20;
      page.drawText(`Total: ${invoiceData.currency} ${invoiceData.total.toFixed(2)}`, {
        x: totalsX,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8)
      });

      // Notes and terms
      if (invoiceData.notes) {
        yPosition -= 40;
        page.drawText('Notes:', {
          x: 50,
          y: yPosition,
          size: 10,
          font: boldFont
        });
        yPosition -= 15;
        page.drawText(invoiceData.notes, {
          x: 50,
          y: yPosition,
          size: 9,
          font
        });
      }

      if (invoiceData.terms) {
        yPosition -= 30;
        page.drawText('Terms & Conditions:', {
          x: 50,
          y: yPosition,
          size: 10,
          font: boldFont
        });
        yPosition -= 15;
        page.drawText(invoiceData.terms, {
          x: 50,
          y: yPosition,
          size: 9,
          font
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;
      link.click();

      URL.revokeObjectURL(url);

      trackEvent('invoice_generated_successfully', {
        items_count: invoiceData.items.length,
        total_amount: invoiceData.total,
        currency: invoiceData.currency
      });

    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
      trackEvent('invoice_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const toolConfig = {
    title: "PDF Invoice Generator",
    description: "Create professional invoices with GST support, multiple currencies, and customizable templates.",
    icon: <Calculator className="w-8 h-8 text-green-500" />,
    features: [
      "Professional invoice templates",
      "GST and tax calculations", 
      "Multiple currency support",
      "Client and company management",
      "Automatic calculations",
      "PDF download"
    ],
    relatedTools: ["/form-filler", "/sign", "/watermark"]
  };

  return (
    <ToolPageContent
  toolName="Invoice Generator"
  toolDescription="Create professional PDF invoices with customizable fields, tax/GST calculations, multiple currencies, and ready-to-download output."
  currentTool="invoice-generator"
  steps={[
    "Fill in your company and client details.",
    "Add line items with quantities and rates.",
    "Select tax/GST rate and currency as needed.",
    "Add optional notes or terms.",
    "Click 'Generate Invoice PDF' to download your invoice."
  ]}
  faqs={[
    { question: "Is the invoice generator free?", answer: "Yes, you can generate unlimited invoices for free with no hidden charges." },
    { question: "Is my invoice data stored?", answer: "No, all data is processed client-side and never stored or uploaded." },
    { question: "Can I customize the template?", answer: "Yes, you can adjust fields, tax rate, currency, and notes before generating the PDF." },
    { question: "Does it support GST and other taxes?", answer: "Yes, GST and custom tax rates are supported and automatically calculated." },
    { question: "Can I generate invoices for international clients?", answer: "Absolutely, select from multiple currencies (INR, USD, EUR, GBP) for your invoices." }
  ]}
  toolConfig={toolConfig}
>
      <div className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => updateInvoiceData('invoiceNumber', e.target.value)}
                placeholder="INV-001"
              />
            </div>
            <div>
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={invoiceData.date}
                onChange={(e) => updateInvoiceData('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => updateInvoiceData('dueDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={invoiceData.currency} onValueChange={(value) => updateInvoiceData('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Your Company Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={invoiceData.companyName}
                onChange={(e) => updateInvoiceData('companyName', e.target.value)}
                placeholder="Your Company Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={invoiceData.companyEmail}
                onChange={(e) => updateInvoiceData('companyEmail', e.target.value)}
                placeholder="company@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                value={invoiceData.companyAddress}
                onChange={(e) => updateInvoiceData('companyAddress', e.target.value)}
                placeholder="Company address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={invoiceData.companyPhone}
                onChange={(e) => updateInvoiceData('companyPhone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="companyGST">GST Number</Label>
              <Input
                id="companyGST"
                value={invoiceData.companyGST}
                onChange={(e) => updateInvoiceData('companyGST', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={invoiceData.clientName}
                onChange={(e) => updateInvoiceData('clientName', e.target.value)}
                placeholder="Client Company Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={invoiceData.clientEmail}
                onChange={(e) => updateInvoiceData('clientEmail', e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={invoiceData.clientAddress}
                onChange={(e) => updateInvoiceData('clientAddress', e.target.value)}
                placeholder="Client address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={invoiceData.clientPhone}
                onChange={(e) => updateInvoiceData('clientPhone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="clientGST">GST Number</Label>
              <Input
                id="clientGST"
                value={invoiceData.clientGST}
                onChange={(e) => updateInvoiceData('clientGST', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Invoice Items
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Rate ({invoiceData.currency})</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Amount</Label>
                      <Input
                        value={`${invoiceData.currency} ${item.amount.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    {invoiceData.items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals and Tax */}
        <Card>
          <CardHeader>
            <CardTitle>Totals & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceData.taxRate}
                  onChange={(e) => updateInvoiceData('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{invoiceData.currency} {invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoiceData.taxRate}%):</span>
                  <span>{invoiceData.currency} {invoiceData.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{invoiceData.currency} {invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => updateInvoiceData('notes', e.target.value)}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={invoiceData.terms}
                onChange={(e) => updateInvoiceData('terms', e.target.value)}
                placeholder="Payment terms and conditions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateInvoicePDF}
            disabled={isGenerating || !invoiceData.companyName || !invoiceData.clientName}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Invoice...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Invoice PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolPageContent>
  );
}