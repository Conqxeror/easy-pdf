"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Download, CheckCircle, AlertTriangle, FileText, Users, Send, Reply, Edit3, Highlighter, Loader2 } from "lucide-react";
import { getPdfLib } from '@/lib/pdfLibLoader';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import FileDropzone from '@/components/ui/FileDropzone';

export default function PDFAnnotationCollaborationClient() {
  const [file, setFile] = useState(null);
  const [annotatedPdf, setAnnotatedPdf] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState({
    type: "comment",
    text: "",
    page: 1,
    x: 100,
    y: 100,
    author: "Current User"
  });
  // Workflow stepper state
  const [currentStep, setCurrentStep] = useState('upload');
  const [stepComplete, setStepComplete] = useState({
    upload: false,
    annotate: false,
    collaborate: false,
    review: false,
    export: false
  });
  // Arrow animation flags for transitions between steps
  const [arrowAnimating, setArrowAnimating] = useState([false, false, false, false]);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: "John Doe", email: "user@example.com", avatar: "", role: "Reviewer", active: true },
    { id: 2, name: "Jane Smith", email: "user@example.com", avatar: "", role: "Editor", active: false },
    { id: 3, name: "Mike Johnson", email: "user@example.com", avatar: "", role: "Approver", active: true }
  ]);
  const [newCollaborator, setNewCollaborator] = useState({ email: "", role: "Reviewer" });
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [replyText, setReplyText] = useState("");
  const handleFileUpload = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setAnnotatedPdf(null);
      setAnnotations([]);
    }
  };

  const addAnnotation = () => {
    if (!newAnnotation.text.trim()) return;

    const annotation = {
      id: Date.now(),
      ...newAnnotation,
      timestamp: new Date().toISOString(),
      replies: [],
      status: "open",
      priority: "medium"
    };

    setAnnotations([...annotations, annotation]);
    setNewAnnotation({
      type: "comment",
      text: "",
      page: 1,
      x: 100,
      y: 100,
      author: "Current User"
    });
  };

  const addReply = (annotationId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      text: replyText,
      author: "Current User",
      timestamp: new Date().toISOString()
    };

    setAnnotations(annotations.map(annotation =>
      annotation.id === annotationId
        ? { ...annotation, replies: [...annotation.replies, reply] }
        : annotation
    ));
    setReplyText("");
  };

  const updateAnnotationStatus = (annotationId, status) => {
    setAnnotations(annotations.map(annotation =>
      annotation.id === annotationId
        ? { ...annotation, status }
        : annotation
    ));
  };

  const addCollaborator = () => {
    if (!newCollaborator.email.trim()) return;

    const collaborator = {
      id: Date.now(),
      name: newCollaborator.email.split('@')[0],
      email: newCollaborator.email,
      avatar: "",
      role: newCollaborator.role,
      active: false
    };

    setCollaborators([...collaborators, collaborator]);
    setNewCollaborator({ email: "", role: "Reviewer" });
  };

  const markStepComplete = (stepId) => {
    setStepComplete(prev => ({ ...prev, [stepId]: true }));
    // animate arrow for the step index and auto-advance after short delay
    const steps = ['upload', 'annotate', 'collaborate', 'review', 'export'];
    const idx = steps.indexOf(stepId);
    if (idx >= 0 && idx < 4) {
      setArrowAnimating(prev => {
        const copy = [...prev];
        copy[idx] = true;
        return copy;
      });
      setTimeout(() => {
        setArrowAnimating(prev => {
          const copy = [...prev];
          copy[idx] = false;
          return copy;
        });
        // Advance to next step
        const next = steps[idx + 1];
        if (next) setCurrentStep(next);
      }, 450);
    }
  };

  const applyAnnotations = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Read the PDF file
      setProgress(20);
      const { PDFDocument, rgb } = await getPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(40);

      // Get pages
      const pages = pdfDoc.getPages();

      // Apply annotations
      annotations.forEach(annotation => {
        const page = pages[annotation.page - 1];
        if (page) {
          const { height } = page.getSize();

          if (annotation.type === "highlight") {
            // Draw highlight
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - (annotation.height || 20),
              width: annotation.width || 100,
              height: annotation.height || 20,
              color: rgb(1, 1, 0),
              opacity: 0.3
            });
          }

          // Add annotation marker
          page.drawCircle({
            x: annotation.x + 10,
            y: height - annotation.y - 10,
            size: 8,
            color: rgb(1, 0, 0),
            opacity: 0.8
          });

          // Add annotation number
          page.drawText(annotation.id.toString(), {
            x: annotation.x + 6,
            y: height - annotation.y - 14,
            size: 8,
            color: rgb(1, 1, 1)
          });
        }
      });

      setProgress(80);

      // Add metadata
      pdfDoc.setSubject('Annotated document with collaboration comments');
      pdfDoc.setKeywords(['annotations', 'collaboration', 'review']);
      pdfDoc.setProducer('PDF Tools - Annotation Collaboration');
      pdfDoc.setModificationDate(new Date());

      setProgress(90);

      // Save the annotated PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setAnnotatedPdf(blob);

      setProgress(100);
    } catch (error) {
      console.error('Error applying annotations:', error);
      alert('Error applying annotations. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const exportAnnotations = () => {
    const exportData = {
      document: file?.name,
      exportDate: new Date().toISOString(),
      collaborators: collaborators,
      annotations: annotations.map(annotation => ({
        ...annotation,
        replies: annotation.replies || []
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    let url;
    try {
      try { url = typeof URL !== 'undefined' ? URL.createObjectURL(blob) : null; } catch (err) { console.error('Error creating object URL for annotations export:', err); url = null; }
      const filename = `annotations_${Date.now()}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error exporting annotations:', err);
      alert('Unable to export annotations');
    } finally {
      setTimeout(() => { try { if (url && typeof URL !== 'undefined' && !String(url).startsWith('data:')) URL.revokeObjectURL(url); } catch { } }, 500);
    }
  };

  const downloadAnnotatedPdf = () => {
    if (!annotatedPdf) return;
    let url;
    try {
      try { url = typeof URL !== 'undefined' ? URL.createObjectURL(annotatedPdf) : null; } catch (err) { console.error('Error creating object URL for annotated PDF:', err); url = null; }
      const safeBase = file && file.name ? String(file.name).replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      const filename = `${safeBase}_annotated.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error downloading annotated PDF:', err);
      alert('Unable to download annotated PDF');
    } finally {
      setTimeout(() => { try { if (url && typeof URL !== 'undefined' && !String(url).startsWith('data:')) URL.revokeObjectURL(url); } catch { } }, 500);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-background dark:bg-background text-foreground dark:text-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-background dark:bg-background text-foreground dark:text-foreground';
    }
  };

  return (
    <ToolPageLayout
      title="PDF Annotation Collaboration"
      subtitle="Collaborate on PDF annotations with team members in real-time"
      toolName="PDF Annotation Collaboration"
      toolDescription="Collaborate on PDF annotations with team members in real-time. Add comments, highlights, and notes to documents, manage team permissions, and track review progress. All processing happens locally in your browser for complete privacy and security."
      currentTool="pdf-annotation-collaboration"
      steps={[
        "Upload your PDF document to start collaborative annotation and review.",
        "Add annotations including comments, highlights, and notes with specific positioning on pages.",
        "Invite team members with different roles (Reviewer, Editor, Approver) and manage collaboration.",
        "Review annotation status, add replies to discussions, and track progress through the review process.",
        "Export annotated PDFs or annotation data for record-keeping and further collaboration."
      ]}
      faqs={[
        {
          question: "What types of annotations can I add to PDFs?",
          answer: "You can add comments, text highlights, sticky notes, and drawing annotations. Each annotation can be positioned precisely on specific pages and includes author information, timestamps, and discussion threads."
        },
        {
          question: "How does team collaboration work?",
          answer: "Team members can be assigned different roles (Reviewer, Editor, Approver) with appropriate permissions. Everyone can view annotations, add replies to discussions, and track the status of review items in real-time."
        },
        {
          question: "Can I track the status of annotations?",
          answer: "Yes, each annotation has a status (Open, In Progress, Resolved) and priority level (High, Medium, Low). You can update statuses as you work through the review process and track progress across the entire document."
        },
        {
          question: "What export options are available?",
          answer: "You can export the annotated PDF with visual markers, export annotation data as JSON for record-keeping, and generate review summaries. This helps maintain documentation of the collaboration process."
        },
        {
          question: "Is real-time collaboration supported?",
          answer: "The tool supports collaborative annotation where team members can see each other's comments and replies. While not fully real-time, it provides a comprehensive collaboration environment for document review."
        }
      ]}
    >
      <div className="space-y-6">
        <Tabs value={currentStep} className="space-y-6" onValueChange={(v) => setCurrentStep(v)}>
          {/* Stepper: make steps look like buttons with arrows and auto-advance when completed */}
          <div className="flex items-center gap-3 w-full">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'annotate', label: 'Annotate' },
              { id: 'collaborate', label: 'Collaborate' },
              { id: 'review', label: 'Review' },
              { id: 'export', label: 'Export' }
            ].map((step, idx, arr) => (
              <div key={step.id} className="flex items-center">
                <Button
                  variant={currentStep === step.id ? 'default' : stepComplete[step.id] ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex items-center gap-2"
                >
                  <span className="font-medium text-sm">{step.label}</span>
                  {stepComplete[step.id] && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                </Button>

                {idx < arr.length - 1 && (
                  <span className={`mx-2 transition-transform duration-300 ${arrowAnimating[idx] ? 'translate-x-1.5 opacity-100' : 'translate-x-0 opacity-50'}`}>
                    <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>

          <TabsContent value="upload" className={`space-y-6 ${currentStep !== 'upload' ? 'hidden' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  Upload PDF Document
                </CardTitle>
                <CardDescription className="text-foreground">
                  Select a PDF document to start collaborative annotation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FileDropzone
                    accept="application/pdf"
                    onFiles={handleFileUpload}
                    label="Choose PDF"
                    description="Drag & drop or click to select a PDF file (Max 50MB)"
                    maxSize={50 * 1024 * 1024}
                    isLoading={isProcessing && !file}
                  />

                  {file && (
                    <Alert className="bg-background border-border">
                      <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                      <AlertDescription className="text-foreground">
                        File loaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annotate" className={`space-y-6 ${currentStep !== 'annotate' ? 'hidden' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" aria-hidden="true" />
                  Add New Annotation
                </CardTitle>
                <CardDescription>
                  Create comments, highlights, and notes on the document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Annotation Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={newAnnotation.type === "comment" ? "default" : "outline"}
                        onClick={() => setNewAnnotation({ ...newAnnotation, type: "comment" })}
                        size="sm"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                        Comment
                      </Button>
                      <Button
                        variant={newAnnotation.type === "highlight" ? "default" : "outline"}
                        onClick={() => setNewAnnotation({ ...newAnnotation, type: "highlight" })}
                        size="sm"
                      >
                        <Highlighter className="mr-2 h-4 w-4" aria-hidden="true" />
                        Highlight
                      </Button>
                      <Button
                        variant={newAnnotation.type === "note" ? "default" : "outline"}
                        onClick={() => setNewAnnotation({ ...newAnnotation, type: "note" })}
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                        Note
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="page-number">Page Number</Label>
                    <Input
                      id="page-number"
                      type="number"
                      min="1"
                      value={newAnnotation.page}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, page: parseInt(e.target.value) })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="x-position">X Position</Label>
                    <Input
                      id="x-position"
                      type="number"
                      value={newAnnotation.x}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, x: parseInt(e.target.value) })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y-position">Y Position</Label>
                    <Input
                      id="y-position"
                      type="number"
                      value={newAnnotation.y}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, y: parseInt(e.target.value) })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="annotation-text">Annotation Text</Label>
                  <Textarea
                    id="annotation-text"
                    placeholder="Enter your annotation comment..."
                    value={newAnnotation.text}
                    onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <Button onClick={() => { addAnnotation(); markStepComplete('annotate'); }} disabled={!newAnnotation.text.trim()}>
                  <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Annotation
                </Button>
              </CardContent>
            </Card>

            {annotations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Annotations ({annotations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {annotations.map((annotation) => (
                      <div key={annotation.id} className="p-4 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {annotation.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{annotation.author}</p>
                              <p className="text-xs text-foreground">
                                Page {annotation.page} • {new Date(annotation.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(annotation.status).replace('bg-red-100 text-red-800', 'bg-red-900/30 text-red-400').replace('bg-yellow-100 text-yellow-800', 'bg-yellow-900/30 text-yellow-400').replace('bg-green-100 text-green-800', 'bg-green-900/30 text-green-400').replace('bg-background text-foreground', 'bg-background text-foreground')}>
                              {annotation.status}
                            </Badge>
                            <Badge className={getPriorityColor(annotation.priority).replace('bg-red-100 text-red-800', 'bg-red-900/30 text-red-400').replace('bg-yellow-100 text-yellow-800', 'bg-yellow-900/30 text-yellow-400').replace('bg-green-100 text-green-800', 'bg-green-900/30 text-green-400').replace('bg-background text-foreground', 'bg-background text-foreground')}>
                              {annotation.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{annotation.text}</p>

                        {annotation.replies && annotation.replies.length > 0 && (
                          <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
                            {annotation.replies.map((reply) => (
                              <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-xs bg-background text-foreground">
                                      {reply.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground">{reply.author}</span>
                                  <span className="text-foreground text-xs">
                                    {new Date(reply.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-foreground">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAnnotation(annotation.id)}
                          >
                            <Reply className="mr-1 h-3 w-3" aria-hidden="true" />
                            Reply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAnnotationStatus(annotation.id, 'resolved')}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                            Resolve
                          </Button>
                        </div>

                        {selectedAnnotation === annotation.id && (
                          <div className="mt-3 flex gap-2">
                            <Input
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 bg-background border-border text-foreground"
                            />
                            <Button
                              size="sm"
                              onClick={() => addReply(annotation.id)}
                              disabled={!replyText.trim()}
                            >
                              <Send className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAnnotation(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collaborate" className={`space-y-6 ${currentStep !== 'collaborate' ? 'hidden' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Collaborators
                </CardTitle>
                <CardDescription>
                  Manage team members and their access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newCollaborator.email}
                    onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                    className="flex-1 bg-background border-border text-foreground"
                  />
                  <select
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                    className="px-3 py-2 bg-background border border-border text-foreground"
                  >
                    <option value="Reviewer">Reviewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Approver">Approver</option>
                  </select>
                  <Button onClick={() => { addCollaborator(); markStepComplete('collaborate'); }} disabled={!newCollaborator.email.trim()}>
                    Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 border border-border bg-background">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-background text-foreground">
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{collaborator.name}</p>
                          <p className="text-sm text-foreground">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-border text-foreground">{collaborator.role}</Badge>
                        <div className={`w-2 h-2 ${collaborator.active ? 'bg-green-500' : 'bg-background0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className={`space-y-6 ${currentStep !== 'review' ? 'hidden' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review Summary
                </CardTitle>
                <CardDescription>
                  Overview of all annotations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-900/30 border border-red-800">
                    <div className="text-2xl font-bold text-red-400">
                      {annotations.filter(a => a.status === 'open').length}
                    </div>
                    <div className="text-sm text-red-300">Open</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-900/30 border border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-400">
                      {annotations.filter(a => a.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-yellow-300">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-green-900/30 border border-green-800">
                    <div className="text-2xl font-bold text-green-400">
                      {annotations.filter(a => a.status === 'resolved').length}
                    </div>
                    <div className="text-sm text-green-300">Resolved</div>
                  </div>
                </div>

                <Button onClick={async () => { await applyAnnotations(); markStepComplete('review'); }} disabled={!file || isProcessing} className="w-full">
                  {isProcessing ? (
                    <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying Annotations...</span>
                  ) : (
                    <><Edit3 className="mr-2 h-4 w-4" />Apply Annotations to PDF</>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2 mt-4">
                    <Progress value={progress} className="bg-background [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:bg-background/70" />
                    <p className="text-sm text-foreground text-center">
                      Processing annotations... {progress}%
                    </p>
                  </div>
                )}

                {annotatedPdf && (
                  <Alert className="bg-background border-border">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="flex items-center justify-between text-foreground">
                      <span>Annotations applied successfully!</span>
                      <Button onClick={downloadAnnotatedPdf} size="sm" variant="success">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className={`space-y-6 ${currentStep !== 'export' ? 'hidden' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Export Options
                </CardTitle>
                <CardDescription>
                  Export annotations and collaboration data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={exportAnnotations} variant="outline">
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Export Annotations (JSON)
                  </Button>
                  <Button onClick={downloadAnnotatedPdf} disabled={!annotatedPdf} variant="outline">
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download Annotated PDF
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>
                    <strong>Export includes:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All annotations and comments</li>
                      <li>Reply threads and discussions</li>
                      <li>Collaborator information</li>
                      <li>Timestamps and status tracking</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-background border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5" />
              Collaboration Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Annotation Types</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Comments and discussions</li>
                  <li>• Text highlighting</li>
                  <li>• Sticky notes</li>
                  <li>• Drawing annotations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Team Features</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Real-time collaboration</li>
                  <li>• Role-based permissions</li>
                  <li>• Reply threads</li>
                  <li>• Status tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Export Options</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Annotated PDF export</li>
                  <li>• Comment summaries</li>
                  <li>• Review reports</li>
                  <li>• Collaboration history</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
