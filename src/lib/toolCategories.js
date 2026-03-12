import React from "react";
import {
  FileText,
  Code2,
  Combine,
  Spline,
  FileImage,
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Eraser,
  ListOrdered,
  PlusCircle,
  Search,
  Signature,
  FileBadge,
  FileTextIcon,
  Text,
  Minimize2,
  FileBadge2,
  QrCode,
  Calculator,
  Award,
  ArchiveRestore,
  Files,
  Music2,
  User,
  BarChart3,
  Settings,
  Bookmark,
  Table,
  Layers,
  CheckCircle,
  Shield,
  EyeOff,
  GitCompare,
  MessageSquare
} from "lucide-react";

export const toolCategories = [
  {
    name: "Convert & Create",
    icon: <FileTextIcon className="w-4 h-4" />,
    submenu: [
      {
        name: "JPG to PDF",
        href: "/jpg-to-pdf",
        icon: <FileImage className="w-4 h-4" />,
      },
      {
        name: "PDF to JPG",
        href: "/pdf-to-jpg",
        icon: <FileImage className="w-4 h-4" />,
      },
      {
        name: "HTML to PDF",
        href: "/html-to-pdf",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "MP4 to MP3",
        href: "/mp4-to-mp3",
        icon: <Music2 className="w-4 h-4" />,
      },
      {
        name: "ZIP Extractor",
        href: "/zip-extractor",
        icon: <ArchiveRestore className="w-4 h-4" />,
      },
      {
        name: "CSV ↔ JSON",
        href: "/csv-json-converter",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "Text Case Converter",
        href: "/text-case-converter",
        icon: <Text className="w-4 h-4" />,
      },
      {
        name: "URL Encoder / Decoder",
        href: "/url-encoder",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "Base64 Encoder",
        href: "/base64-encoder",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "HTML ↔ Markdown",
        href: "/html-markdown-converter",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "JSON ↔ XML",
        href: "/json-xml-converter",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "Text Diff Checker",
        href: "/text-diff-checker",
        icon: <GitCompare className="w-4 h-4" />,
      },
      {
        name: "Regex Tester",
        href: "/regex-tester",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "UUID Generator",
        href: "/uuid-generator",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "Hash Generator",
        href: "/hash-generator",
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        name: "HEIC to JPG",
        href: "/heic-to-jpg",
        icon: <FileImage className="w-4 h-4" />,
      },
      {
        name: "DOCX to PDF",
        href: "/docx-to-pdf",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "DOCX to Text",
        href: "/docx-to-text",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "Image Converter",
        href: "/image-converter",
        icon: <FileImage className="w-4 h-4" />,
      },
      {
        name: "ZIP Creator",
        href: "/zip-creator",
        icon: <Files className="w-4 h-4" />,
      },
      {
        name: "TAR / GZIP Extractor",
        href: "/tar-extractor",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "Video to GIF",
        href: "/video-to-gif",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "WebM ↔ MP4",
        href: "/webm-to-mp4",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "Video Compressor",
        href: "/video-compress",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "Trim & Merge",
        href: "/video-trim",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "QR Code Generator",
        href: "/qr-generator",
        icon: <QrCode className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Organize & Edit",
    icon: <ListOrdered className="w-4 h-4" />,
    submenu: [
      {
        name: "Merge PDF",
        href: "/pdf/merge",
        icon: <Combine className="w-4 h-4" />,
      },
      {
        name: "Split PDF",
        href: "/pdf/split",
        icon: <Spline className="w-4 h-4" />,
      },
      {
        name: "Reorder PDF Pages",
        href: "/reorder",
        icon: <ListOrdered className="w-4 h-4" />,
      },
      {
        name: "Delete PDF Pages",
        href: "/delete-pages",
        icon: <Eraser className="w-4 h-4" />,
      },
      {
        name: "Rotate PDF",
        href: "/rotate",
        icon: <RotateCw className="w-4 h-4" />,
      },
      {
        name: "Organize PDF",
        href: "/organize",
        icon: <ListOrdered className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Security & Privacy",
    icon: <Lock className="w-4 h-4" />,
    submenu: [
      {
        name: "Compress PDF",
        href: "/pdf/compress",
        icon: <Minimize2 className="w-4 h-4" />,
      },
      {
        name: "Protect PDF",
        href: "/protect",
        icon: <Lock className="w-4 h-4" />,
      },
      {
        name: "Unlock PDF",
        href: "/unlock",
        icon: <Unlock className="w-4 h-4" />,
      },
      {
        name: "Watermark PDF",
        href: "/watermark",
        icon: <Stamp className="w-4 h-4" />,
      },
      {
        name: "Add Page Numbers",
        href: "/page-numbers",
        icon: <PlusCircle className="w-4 h-4" />,
      },
      {
        name: "PDF Redaction",
        href: "/pdf-redaction",
        icon: <Eraser className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Forms & Documents",
    icon: <Text className="w-4 h-4" />,
    submenu: [
      {
        name: "PDF Form Filler",
        href: "/form-filler",
        icon: <Text className="w-4 h-4" />,
      },
      {
        name: "PDF Form Creator",
        href: "/pdf-form-creator",
        icon: <PlusCircle className="w-4 h-4" />,
      },
      {
        name: "Sign/Annotate PDF",
        href: "/sign",
        icon: <Signature className="w-4 h-4" />,
      },
      {
        name: "Digital Signature",
        href: "/pdf-digital-signature",
        icon: <Signature className="w-4 h-4" />,
      },
      {
        name: "Annotation Collaboration",
        href: "/pdf-annotation-collaboration",
        icon: <Text className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Business Tools",
    icon: <Calculator className="w-4 h-4" />,
    submenu: [
      {
        name: "Invoice Generator",
        href: "/invoice-generator",
        icon: <Calculator className="w-4 h-4" />,
      },
      {
        name: "Certificate Generator",
        href: "/certificate-generator",
        icon: <Award className="w-4 h-4" />,
      },
      {
        name: "Report Generator",
        href: "/report-generator",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        name: "Portfolio Creator",
        href: "/portfolio-creator",
        icon: <User className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "AI & Analysis",
    icon: <Search className="w-4 h-4" />,
    submenu: [
      {
        name: "OCR (Text Recognition)",
        href: "/ocr",
        icon: <Search className="w-4 h-4" />
      },
      {
        name: "Advanced OCR",
        href: "/advanced-ocr",
        icon: <Search className="w-4 h-4" />,
      },
      {
        name: "Legal Document Analyzer",
        href: "/legal-analyzer",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        name: "Medical Document Analyzer",
        href: "/medical-analyzer",
        icon: <FileBadge className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Advanced PDF Tools",
    icon: <FileBadge2 className="w-4 h-4" />,
    submenu: [
      {
        name: "PDF Metadata Editor",
        href: "/pdf-metadata-editor",
        icon: <Settings className="w-4 h-4" />,
      },
      {
        name: "PDF Bookmark Manager",
        href: "/pdf-bookmark-manager",
        icon: <Bookmark className="w-4 h-4" />,
      },
      {
        name: "PDF Table Extractor",
        href: "/pdf-table-extractor",
        icon: <Table className="w-4 h-4" />,
      },
      {
        name: "PDF Accessibility Checker",
        href: "/pdf-accessibility-checker",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      {
        name: "PDF Version Comparison",
        href: "/pdf-version-comparison",
        icon: <GitCompare className="w-4 h-4" />,
      },
      {
        name: "PDF Batch Processor",
        href: "/pdf-batch-processor",
        icon: <Layers className="w-4 h-4" />,
      },
      {
        name: "PDF Annotation Collaboration",
        href: "/pdf-annotation-collaboration",
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        name: "PDF Digital Signature",
        href: "/pdf-digital-signature",
        icon: <Shield className="w-4 h-4" />,
      },
      {
        name: "PDF Redaction Tool",
        href: "/pdf-redaction",
        icon: <EyeOff className="w-4 h-4" />,
      },
    ],
  },
];