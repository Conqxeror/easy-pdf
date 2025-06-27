import {
  FileText,
  ChevronDown,
  Combine,
  Spline,
  Shrink,
  FileImage,
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Eraser,
  ListOrdered,
  PlusCircle,
  FileCode,
  Search,
  Signature,
  FileBadge,
  FileType,
  FileTextIcon,
  Text,
  Minimize2,
  FileBadge2,
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
        icon: <FileCode className="w-4 h-4" />,
      },
      {
        name: "Word to PDF",
        href: "/word-to-pdf",
        icon: <FileType className="w-4 h-4" />,
      },
      {
        name: "PDF to Word",
        href: "/pdf-to-word",
        icon: <FileTextIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Organize & Edit",
    icon: <ListOrdered className="w-4 h-4" />,
    submenu: [
      {
        name: "Merge PDF",
        href: "/merge",
        icon: <Combine className="w-4 h-4" />,
      },
      {
        name: "Split PDF",
        href: "/split",
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
    name: "Optimize & Secure",
    icon: <Shrink className="w-4 h-4" />,
    submenu: [
      {
        name: "Compress PDF",
        href: "/compress",
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
    ],
  },
  {
    name: "Advanced Tools",
    icon: <FileBadge2 className="w-4 h-4" />,
    submenu: [
      { name: "OCR", href: "/ocr", icon: <Search className="w-4 h-4" /> },
      {
        name: "Sign/Annotate PDF",
        href: "/sign",
        icon: <Signature className="w-4 h-4" />,
      },
      {
        name: "PDF Form Filler",
        href: "/form-filler",
        icon: <Text className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Legal & AI Tools",
    icon: <FileBadge className="w-4 h-4" />,
    submenu: [
      {
        name: "Legal Document Analyzer",
        href: "/legal-analyzer",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
];
