"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Bookmark, FileText, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getPdfLib } from '@/lib/pdfLibLoader';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { safeCreateObjectURL, safeRevokeObjectURL } from '@/lib/enhancedUX';

export default function PDFBookmarkManagerClient() {
  const [file, setFile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [newBookmark, setNewBookmark] = useState({ title: '', page: 1, level: 0 });
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setFile(file);
      setError('');
      await extractBookmarks(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const extractBookmarks = async (file) => {
    try {
      setIsProcessing(true);
      setError('');
      const { PDFDocument } = await getPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      await PDFDocument.load(arrayBuffer);

      setBookmarks([]);
      setStatusMessage('PDF loaded. Create a bookmark outline from scratch and export it as JSON alongside an unchanged PDF copy.');
    } catch (error) {
      setError(error?.message || 'Error opening the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addBookmark = () => {
    if (!newBookmark.title.trim()) return;

    const bookmark = {
      id: Date.now(),
      title: newBookmark.title,
      page: parseInt(newBookmark.page),
      level: newBookmark.level,
      expanded: false
    };

    setBookmarks([...bookmarks, bookmark]);
    setNewBookmark({ title: '', page: 1, level: 0 });
    setStatusMessage(`Bookmark “${bookmark.title}” added to the outline.`);
  };

  const editBookmark = (id, updatedBookmark) => {
    setBookmarks(bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark
    ));
    setEditingBookmark(null);
  };

  const deleteBookmark = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    setStatusMessage('Bookmark removed from the outline.');
  };

  const moveBookmark = (id, direction) => {
    const index = bookmarks.findIndex(bookmark => bookmark.id === id);
    if (index === -1) return;

    const newBookmarks = [...bookmarks];
    if (direction === 'up' && index > 0) {
      [newBookmarks[index], newBookmarks[index - 1]] = [newBookmarks[index - 1], newBookmarks[index]];
    } else if (direction === 'down' && index < newBookmarks.length - 1) {
      [newBookmarks[index], newBookmarks[index + 1]] = [newBookmarks[index + 1], newBookmarks[index]];
    }

    setBookmarks(newBookmarks);
  };

  const saveBookmarks = async () => {
    if (!file || bookmarks.length === 0) return;

    try {
      setIsProcessing(true);
      setError('');
      const { PDFDocument } = await getPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      let url = null;
      try {
        url = safeCreateObjectURL(blob);
        const safeBase = file && file.name ? file.name.replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
        const filename = `${safeBase}_bookmark-outline-source.pdf`;

        const link = document.createElement('a');
        link.href = url || '';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch {
        setError('Unable to export the PDF copy.');
      } finally {
        setTimeout(() => {
          safeRevokeObjectURL(url);
        }, 500);
      }

      exportBookmarkList();
      setStatusMessage('Exported the bookmark outline JSON and an unchanged copy of the source PDF.');
    } catch (error) {
      setError(error?.message || 'Error exporting the bookmark package.');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportBookmarkList = () => {
    const bookmarkData = {
      filename: file.name,
      bookmarks: bookmarks.map(({ id: _id, ...bookmark }) => bookmark),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(bookmarkData, null, 2)], { type: 'application/json' });
    let url = null;
    try {
      url = safeCreateObjectURL(blob);
      const safeBase = file && file.name ? file.name.replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      const filename = `${safeBase}_bookmarks.json`;

      const link = document.createElement('a');
      link.href = url || '';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => { safeRevokeObjectURL(url); }, 500);
    }
  };

  const BookmarkItem = ({ bookmark }) => (
    <div className={`border p-3 ${bookmark.level > 0 ? 'ml-6 border-l-4 border-l-primary' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Bookmark className="h-4 w-4 text-primary-foreground preserve-color" aria-hidden="true" />
          {editingBookmark === bookmark.id ? (
            <div className="flex gap-2 flex-1">
              <Input
                value={bookmark.title}
                onChange={(e) => editBookmark(bookmark.id, { title: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                value={bookmark.page}
                onChange={(e) => editBookmark(bookmark.id, { page: parseInt(e.target.value) })}
                className="w-20"
                min="1"
              />
              <Button size="sm" onClick={() => setEditingBookmark(null)}>
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium">{bookmark.title}</span>
              <span className="text-sm text-muted-foreground">Page {bookmark.page}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => moveBookmark(bookmark.id, 'up')}
            title="Move up"
          >
            ↑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => moveBookmark(bookmark.id, 'down')}
            title="Move down"
          >
            ↓
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingBookmark(bookmark.id)}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteBookmark(bookmark.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="PDF Bookmark Manager"
      subtitle="Plan and export a bookmark outline for long PDFs entirely in your browser"
      toolName="PDF Bookmark Manager"
      toolDescription="Create a bookmark outline with titles, levels, and page numbers, then export it as JSON together with an unchanged source PDF copy for downstream workflows."
      currentTool="pdf-bookmark-manager"
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select it.",
        "Add new bookmarks by entering a title, page number, and hierarchy level (0 for main bookmarks, higher numbers for sub-bookmarks).",
        "Edit existing bookmarks by clicking the edit button, or reorganize them using the up/down arrows.",
        "Export the bookmark outline as JSON, and optionally download an unchanged copy of the source PDF for handoff or archival."
      ]}
      faqs={[
        {
          question: "What are PDF bookmarks and why are they useful?",
          answer: "PDF bookmarks are clickable navigation links that help users quickly jump to specific sections or pages in a document. They create a table of contents that appears in the PDF viewer's bookmark panel, making it easier to navigate through long documents."
        },
        {
          question: "Can I create hierarchical bookmarks?",
          answer: "Yes, you can create hierarchical bookmark structures using the level field. Level 0 creates main bookmarks, while higher levels (1, 2, 3, etc.) create sub-bookmarks that are indented under their parent bookmarks."
        },
        {
          question: "How do I edit existing bookmarks?",
          answer: "Click the edit button next to any bookmark to modify its title, page number, or hierarchy level. You can also delete bookmarks using the trash icon, or reorganize them using the up and down arrows."
        },
        {
          question: "Can I import existing bookmarks?",
          answer: "Not in this browser-side version. The current PDF library can create and export outline plans, but it does not parse existing embedded bookmark trees from uploaded PDFs."
        },
        {
          question: "Are my PDF files secure when using this tool?",
          answer: "Absolutely! All processing happens locally in your browser. Your PDF files never leave your device, ensuring complete privacy and security for your sensitive documents."
        }
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {statusMessage && !error && (
          <Alert>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {!file ? (
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>
                Select a PDF file to manage its bookmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
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
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  {file.name}
                </CardTitle>
                <CardDescription>
                  Manage bookmarks for this PDF document
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Add New Bookmark
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bookmarkTitle">Bookmark Title</Label>
                    <Input
                      id="bookmarkTitle"
                      value={newBookmark.title}
                      onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                      placeholder="Enter bookmark title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookmarkPage">Page Number</Label>
                      <Input
                        id="bookmarkPage"
                        type="number"
                        value={newBookmark.page}
                        onChange={(e) => setNewBookmark({ ...newBookmark, page: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bookmarkLevel">Level</Label>
                      <Input
                        id="bookmarkLevel"
                        type="number"
                        value={newBookmark.level}
                        onChange={(e) => setNewBookmark({ ...newBookmark, level: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>

                  <Button onClick={addBookmark} className="w-full" disabled={!newBookmark.title.trim()}>
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add Bookmark
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5" aria-hidden="true" />
                    Bookmark List ({bookmarks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                      <p>No bookmarks added yet</p>
                      <p className="text-sm">Add your first bookmark to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {bookmarks.map((bookmark) => (
                        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {bookmarks.length > 0 && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={exportBookmarkList}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Export Bookmark List
                </Button>
                <Button
                  onClick={saveBookmarks}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</span>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" aria-hidden="true" />Export Outline + PDF Copy</>
                  )}
                </Button>
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span>All processing happens locally in your browser. Your files never leave your device.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
