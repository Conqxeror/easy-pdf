//src\components\ui\BatchProcessingPanel.jsx

"use client";

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Play, 
  // Pause, // Unused 
  // Square, // Unused 
  Download, 
  // Settings, // Unused
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { advancedPdfProcessor } from '@/lib/advancedPdfProcessing';
import { useUserPreferences } from '@/lib/userPreferences';
import { sanitizeFileName, safeCreateObjectURL, safeRevokeObjectURL } from '@/lib/enhancedUX';
// Premium functionality removed - all features now free

const BatchProcessingPanel = ({ className = '' }) => {
  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('compress');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [options, setOptions] = useState({});
  const { preferences } = useUserPreferences();

  // Premium checks removed - all features are now free
  const capabilities = { maxBatchSize: 200, maxFileSize: 500 }; // Unlimited for all users

  const operations = [
    { value: 'compress', label: 'Compress PDFs', premium: false },
    { value: 'watermark', label: 'Add Watermarks', premium: false },
    { value: 'extract_pages', label: 'Extract Pages', premium: false },
    { value: 'rotate', label: 'Rotate Pages', premium: false },
    { value: 'add_metadata', label: 'Add Metadata', premium: false },
    { value: 'merge', label: 'Merge PDFs', premium: false }
  ];

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    const validFiles = uploadedFiles.filter(file => 
      file.type === 'application/pdf' && 
      file.size <= capabilities.maxFileSize
    );

    if (validFiles.length + files.length > capabilities.maxBatchSize) {
      alert(`Maximum ${capabilities.maxBatchSize} files allowed`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending',
      result: null
    }))]);
  }, [files.length, capabilities]);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startProcessing = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const fileList = files.map(f => f.file);
      const processingOptions = {
        ...options,
        onProgress: (completed, total) => {
          setProgress((completed / total) * 100);
        }
      };

      const batchResults = await advancedPdfProcessor.batchProcess(
        fileList, 
        operation, 
        processingOptions
      );

      setResults(batchResults);
      
      // Update file statuses
      setFiles(prev => prev.map((file, index) => ({
        ...file,
        status: batchResults[index]?.error ? 'error' : 'completed',
        result: batchResults[index]
      })));

    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResults = () => {
    results.forEach((result, index) => {
      if (result.data) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = safeCreateObjectURL(blob);
        const a = document.createElement('a');
        const suggested = files[index]?.file.name || `file_${index + 1}.pdf`;
        const safeName = sanitizeFileName(suggested) + '.pdf';
        if (url) {
          try {
            a.href = url;
            a.download = `processed_${safeName}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } finally {
            setTimeout(() => { try { safeRevokeObjectURL(url); } catch {} }, 500);
          }
        } else {
          // fallback: data URL
          const reader = new FileReader();
          reader.onload = () => {
            try {
              a.href = reader.result;
              a.download = `processed_${safeName}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (err) { /* ignore */ }
          };
          reader.readAsDataURL(blob);
        }
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'processing': return <Zap className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const selectedOperation = operations.find(op => op.value === operation);
  const canProcess = files.length > 0 && !processing;

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-200">Batch Processing</h2>
          </div>
          <div className="text-sm text-gray-400">
            {files.length}/{capabilities.maxBatchSize} files
          </div>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Operation
                </label>
                <Select value={operation} onValueChange={setOperation}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {operations.map(op => (
                      <SelectItem 
                        key={op.value} 
                        value={op.value}
                        className="text-gray-200"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{op.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operation-specific options */}
              {operation === 'watermark' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={options.text || ''}
                    onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                    placeholder="Enter watermark text"
                  />
                </div>
              )}

              {operation === 'extract_pages' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Page Numbers (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={options.pageNumbers?.join(',') || ''}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      pageNumbers: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                    placeholder="e.g., 1,3,5-7"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="batch-file-input"
                />
                <Button
                  onClick={() => document.getElementById('batch-file-input').click()}
                  variant="outline"
                  className="flex-1"
                  disabled={files.length >= capabilities.maxBatchSize}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add PDF Files
                </Button>
                <Button
                  onClick={startProcessing}
                  disabled={!canProcess}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Processing
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No files added yet</p>
                <p className="text-xs">Add PDF files to start batch processing</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getStatusIcon(fileItem.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(fileItem.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Processing...</span>
                  <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    Processed {results.filter(r => !r.error).length}/{results.length} files
                  </span>
                  <Button
                    onClick={downloadResults}
                    size="sm"
                    disabled={results.filter(r => r.data).length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        {result.error ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-sm text-gray-200">
                          {files[index]?.file.name || `File ${index + 1}`}
                        </span>
                      </div>
                      {result.error ? (
                        <span className="text-xs text-red-400">{result.error}</span>
                      ) : (
                        <span className="text-xs text-green-400">Success</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default BatchProcessingPanel;