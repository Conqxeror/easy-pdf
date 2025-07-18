"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Unused
import { Textarea } from '@/components/ui/textarea';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Unused
import { Upload, Download, FileBadge2, Type, CheckSquare, Circle, ChevronDown, PenTool, Trash2, Plus, Eye } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib'; // Removed unused PDF form components

export default function PDFFormCreator() {
  const [templateFile, setTemplateFile] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formTitle, setFormTitle] = useState('New Form');

  const fieldTypes = [
    { id: 'text', name: 'Text Field', icon: Type },
    { id: 'checkbox', name: 'Checkbox', icon: CheckSquare },
    { id: 'radio', name: 'Radio Button', icon: Circle },
    { id: 'dropdown', name: 'Dropdown', icon: ChevronDown },
    { id: 'signature', name: 'Signature', icon: PenTool }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setTemplateFile(file);
      // Reset form fields when new template is loaded
      setFormFields([]);
      setSelectedField(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      name: `field_${formFields.length + 1}`,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      x: 50,
      y: 50,
      width: type === 'checkbox' || type === 'radio' ? 20 : 150,
      height: type === 'checkbox' || type === 'radio' ? 20 : 30,
      required: false,
      placeholder: type === 'text' ? 'Enter text...' : '',
      options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : [],
      multiline: false,
      fontSize: 12
    };
    setFormFields([...formFields, newField]);
    setSelectedField(newField);
  };

  const updateField = (id, updates) => {
    setFormFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
    if (selectedField && selectedField.id === id) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (id) => {
    setFormFields(fields => fields.filter(field => field.id !== id));
    if (selectedField && selectedField.id === id) {
      setSelectedField(null);
    }
  };

  const createFormPDF = async () => {
    setIsCreating(true);
    try {
      let pdfDoc;
      
      if (templateFile) {
        // Use existing PDF as template
        const arrayBuffer = await templateFile.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } else {
        // Create new PDF
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Standard letter size
        
        // Add title
        page.drawText(formTitle, {
          x: 50,
          y: 750,
          size: 20,
          color: rgb(0, 0, 0)
        });
      }

      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Add form fields
      formFields.forEach(field => {
        const { name, type, x, y, width, height, required, placeholder, options, multiline, fontSize } = field;

        switch (type) {
          case 'text':
            const textField = form.createTextField(name);
            textField.setText(placeholder);
            textField.setFontSize(fontSize);
            if (multiline) {
              textField.enableMultiline();
            }
            if (required) {
              textField.enableRequired();
            }
            textField.addToPage(firstPage, {
              x,
              y: firstPage.getHeight() - y - height,
              width,
              height
            });
            break;

          case 'checkbox':
            const checkBox = form.createCheckBox(name);
            if (required) {
              checkBox.enableRequired();
            }
            checkBox.addToPage(firstPage, {
              x,
              y: firstPage.getHeight() - y - height,
              width,
              height
            });
            break;

          case 'radio':
            const radioGroup = form.createRadioGroup(name);
            options.forEach((option, index) => {
              radioGroup.addOptionToPage(option, firstPage, {
                x: x + (index * 30),
                y: firstPage.getHeight() - y - height,
                width,
                height
              });
            });
            if (required) {
              radioGroup.enableRequired();
            }
            break;

          case 'dropdown':
            const dropdown = form.createDropdown(name);
            dropdown.addOptions(options);
            dropdown.select(options[0]);
            if (required) {
              dropdown.enableRequired();
            }
            dropdown.addToPage(firstPage, {
              x,
              y: firstPage.getHeight() - y - height,
              width,
              height
            });
            break;

          case 'signature':
            // Note: PDF-lib doesn't have built-in signature fields
            // We'll create a text field as placeholder
            const sigField = form.createTextField(name + '_signature');
            sigField.setText('Signature: ___________________');
            sigField.setFontSize(fontSize);
            if (required) {
              sigField.enableRequired();
            }
            sigField.addToPage(firstPage, {
              x,
              y: firstPage.getHeight() - y - height,
              width,
              height
            });
            break;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formTitle.replace(/\s+/g, '_')}_form.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating form PDF:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const createBlankForm = () => {
    setTemplateFile(null);
    setFormFields([]);
    setSelectedField(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileBadge2 className="h-8 w-8" />
          PDF Form Creator
        </h1>
        <p className="text-muted-foreground">
          Create interactive PDF forms with various field types. Start with a blank form or use an existing PDF as template.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Tools */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formTitle">Form Title</Label>
                <Input
                  id="formTitle"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={createBlankForm} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Blank Form
                </Button>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">
                    {isDragActive ? 'Drop PDF template here' : 'Upload PDF Template'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {fieldTypes.map(fieldType => {
                  const Icon = fieldType.icon;
                  return (
                    <Button
                      key={fieldType.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addField(fieldType.id)}
                      className="flex flex-col h-16 p-2"
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{fieldType.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {selectedField && (
            <Card>
              <CardHeader>
                <CardTitle>Field Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Field Name</Label>
                  <Input
                    value={selectedField.name}
                    onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={selectedField.width}
                      onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={selectedField.height}
                      onChange={(e) => updateField(selectedField.id, { height: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {selectedField.type === 'text' && (
                  <>
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={selectedField.placeholder}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="multiline"
                        checked={selectedField.multiline}
                        onChange={(e) => updateField(selectedField.id, { multiline: e.target.checked })}
                      />
                      <Label htmlFor="multiline">Multiline</Label>
                    </div>
                  </>
                )}

                {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
                  <div>
                    <Label>Options (one per line)</Label>
                    <Textarea
                      value={selectedField.options.join('\n')}
                      onChange={(e) => updateField(selectedField.id, { 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteField(selectedField.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Field
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Form Builder */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Form Designer</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit Mode' : 'Preview'}
                  </Button>
                  <Button
                    onClick={createFormPDF}
                    disabled={formFields.length === 0 || isCreating}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Download Form'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <div className="relative w-full h-full border-2 border-dashed border-gray-300 rounded-lg overflow-auto">
                {templateFile ? (
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">
                      PDF Template: {templateFile.name}
                    </p>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Click &quot;Add Field&quot; buttons to add form elements
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-white">
                    {/* Simulated PDF page */}
                    <div className="absolute inset-4 bg-white shadow-lg">
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{formTitle}</h2>
                        
                        {/* Render form fields */}
                        {formFields.map(field => (
                          <div
                            key={field.id}
                            className={`absolute border-2 cursor-pointer ${
                              selectedField?.id === field.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            style={{
                              left: field.x,
                              top: field.y + 60, // Offset for title
                              width: field.width,
                              height: field.height
                            }}
                            onClick={() => setSelectedField(field)}
                          >
                            {field.type === 'text' && (
                              <input
                                type="text"
                                placeholder={field.placeholder}
                                className="w-full h-full px-2 text-sm border-none outline-none bg-transparent"
                                disabled={!previewMode}
                              />
                            )}
                            {field.type === 'checkbox' && (
                              <input
                                type="checkbox"
                                className="w-full h-full"
                                disabled={!previewMode}
                              />
                            )}
                            {field.type === 'dropdown' && (
                              <select className="w-full h-full px-2 text-sm border-none outline-none bg-transparent" disabled={!previewMode}>
                                {field.options.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                            {field.type === 'signature' && (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                Signature
                              </div>
                            )}
                            {!previewMode && (
                              <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                {field.label}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {formFields.length === 0 && (
                          <div className="text-center text-muted-foreground mt-8">
                            <FileBadge2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Add form fields using the tools on the left</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileBadge2 className="h-4 w-4" />
            <span>All form creation happens locally in your browser. Your files never leave your device.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}