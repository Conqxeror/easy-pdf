"use client";

import React, { useState, useCallback  } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, Settings, FileText, Calendar, User, BookOpen, Tag } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function PDFMetadataEditor() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: '',
    modificationDate: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalMetadata, setOriginalMetadata] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setFile(file);
      await extractMetadata(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const extractMetadata = async (file) => {
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const title = pdfDoc.getTitle() || '';
      const author = pdfDoc.getAuthor() || '';
      const subject = pdfDoc.getSubject() || '';
      const keywords = pdfDoc.getKeywords() || '';
      const creator = pdfDoc.getCreator() || '';
      const producer = pdfDoc.getProducer() || '';
      const creationDate = pdfDoc.getCreationDate()?.toISOString().split('T')[0] || '';
      const modificationDate = pdfDoc.getModificationDate()?.toISOString().split('T')[0] || '';

      const extractedMetadata = {
        title,
        author,
        subject,
        keywords,
        creator,
        producer,
        creationDate,
        modificationDate
      };

      setMetadata(extractedMetadata);
      setOriginalMetadata(extractedMetadata);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      alert('Error extracting metadata from PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveMetadata = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Update metadata
      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);
      
      if (metadata.creationDate) {
        pdfDoc.setCreationDate(new Date(metadata.creationDate));
      }
      if (metadata.modificationDate) {
        pdfDoc.setModificationDate(new Date(metadata.modificationDate));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_metadata_edited.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Error saving PDF with updated metadata');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetMetadata = () => {
    if (originalMetadata) {
      setMetadata(originalMetadata);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          PDF Metadata Editor
        </h1>
        <p className="text-muted-foreground">
          Edit PDF metadata including title, author, subject, keywords, and dates. All processing happens locally in your browser.
        </p>
      </div>

      {!file ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
            <CardDescription>
              Select a PDF file to view and edit its metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Drop the PDF file here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">Drag & drop a PDF file here, or click to select</p>
                  <p className="text-sm text-muted-foreground">Only PDF files are supported</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {file.name}
              </CardTitle>
              <CardDescription>
                Edit the metadata fields below and click &quot;Save Changes&quot; to download the updated PDF
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    placeholder="Document title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={metadata.subject}
                    onChange={(e) => handleMetadataChange('subject', e.target.value)}
                    placeholder="Document subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="keywords" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Keywords
                  </Label>
                  <Textarea
                    id="keywords"
                    value={metadata.keywords}
                    onChange={(e) => handleMetadataChange('keywords', e.target.value)}
                    placeholder="Comma-separated keywords"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Author Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={metadata.author}
                    onChange={(e) => handleMetadataChange('author', e.target.value)}
                    placeholder="Document author"
                  />
                </div>
                
                <div>
                  <Label htmlFor="creator" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Creator
                  </Label>
                  <Input
                    id="creator"
                    value={metadata.creator}
                    onChange={(e) => handleMetadataChange('creator', e.target.value)}
                    placeholder="Application that created the document"
                  />
                </div>
                
                <div>
                  <Label htmlFor="producer" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Producer
                  </Label>
                  <Input
                    id="producer"
                    value={metadata.producer}
                    onChange={(e) => handleMetadataChange('producer', e.target.value)}
                    placeholder="Application that produced the PDF"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creationDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Creation Date
                  </Label>
                  <Input
                    id="creationDate"
                    type="date"
                    value={metadata.creationDate}
                    onChange={(e) => handleMetadataChange('creationDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="modificationDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Modification Date
                  </Label>
                  <Input
                    id="modificationDate"
                    type="date"
                    value={metadata.modificationDate}
                    onChange={(e) => handleMetadataChange('modificationDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={resetMetadata}
              variant="outline"
              disabled={isProcessing}
            >
              Reset to Original
            </Button>
            <Button
              onClick={saveMetadata}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Save Changes'}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span>All processing happens locally in your browser. Your files never leave your device.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}