// Script to enhance SEO across all pages
const fs = require('fs');
const path = require('path');

// Tool data for SEO enhancement
const tools = [
  {
    path: 'merge',
    title: 'Merge PDF Online – Easy PDF Tool',
    description: 'Combine multiple PDF files into one seamlessly. Free online PDF merger with 100% client-side processing. Fast, secure, and privacy-first.',
    keywords: [
      'Merge PDF', 'Combine PDF', 'PDF merger', 'Join PDF', 'PDF tools', 
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF merger', 
      'Free PDF merger', 'Secure PDF merge', 'Browser PDF merge', 
      'Offline PDF merge', 'PDF combiner', 'Document merger'
    ],
    toolName: 'PDF Merger',
    features: [
      'Drag & drop multiple files',
      'Reorder before merging',
      'No file size limits',
      '100% secure processing'
    ]
  },
  {
    path: 'split',
    title: 'Split PDF Online – Easy PDF Tool',
    description: 'Extract specific pages or split a PDF into multiple files. Free online tool with secure browser-based processing.',
    keywords: [
      'Split PDF', 'Extract PDF pages', 'Separate PDF', 'Divide PDF', 'PDF splitter',
      'Page extraction', 'PDF page separator', 'Document splitter', 'Free PDF split'
    ],
    toolName: 'PDF Splitter',
    features: [
      'Extract specific pages',
      'Split by page ranges',
      'Preview before splitting',
      'Download as ZIP'
    ]
  },
  {
    path: 'compress',
    title: 'Compress PDF Online – Easy PDF Tool',
    description: 'Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor with multiple quality levels.',
    keywords: [
      'Compress PDF', 'PDF compressor', 'Reduce PDF size', 'Shrink PDF', 'Optimize PDF',
      'Free PDF compression', 'Client-side PDF', 'Privacy PDF tool', 'No upload PDF compressor',
      'PDF optimization', 'File size reduction', 'Document compression'
    ],
    toolName: 'PDF Compressor',
    features: [
      'Multiple compression levels',
      'Quality preservation',
      'Batch processing',
      'Size preview'
    ]
  },
  {
    path: 'jpg-to-pdf',
    title: 'JPG to PDF Converter – Easy PDF Tool',
    description: 'Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing.',
    keywords: [
      'JPG to PDF', 'PNG to PDF', 'Image to PDF', 'Convert images', 'Photo to PDF',
      'Image converter', 'Picture to PDF', 'Free image converter', 'Batch image conversion'
    ],
    toolName: 'Image to PDF Converter',
    features: [
      'Multiple image formats',
      'Batch conversion',
      'Custom page sizes',
      'Image ordering'
    ]
  },
  {
    path: 'pdf-to-jpg',
    title: 'PDF to JPG Converter – Easy PDF Tool',
    description: 'Convert PDF pages into high-quality JPG image files. Free online tool with customizable quality settings and batch processing.',
    keywords: [
      'PDF to JPG', 'PDF to PNG', 'Convert PDF to image', 'PDF to photo', 'Extract images',
      'PDF image converter', 'Document to image', 'Free PDF converter'
    ],
    toolName: 'PDF to Image Converter',
    features: [
      'High-quality output',
      'Custom resolution',
      'Batch processing',
      'Multiple formats'
    ]
  },
  {
    path: 'rotate',
    title: 'Rotate PDF Pages Online – Easy PDF Tool',
    description: 'Rotate PDF pages to the correct orientation (90, 180, 270 degrees). Free online PDF rotation tool with secure browser-based processing.',
    keywords: [
      'Rotate PDF', 'Fix PDF orientation', 'Turn PDF pages', 'PDF rotation', 'Flip PDF',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF rotate', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Rotator',
    features: [
      'Multiple rotation angles',
      'Page-specific rotation',
      'Batch rotation',
      'Preview changes'
    ]
  },
  {
    path: 'watermark',
    title: 'Watermark PDF Online – Easy PDF Tool',
    description: 'Add custom text or image watermarks to your PDF documents. Free online watermarking tool with position control and opacity adjustment.',
    keywords: [
      'Watermark PDF', 'Add watermark', 'PDF branding', 'Document protection', 'PDF stamp',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF watermark', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Watermarker',
    features: [
      'Text & image watermarks',
      'Custom positioning',
      'Opacity control',
      'Rotation options'
    ]
  },
  {
    path: 'protect',
    title: 'Protect PDF (Add Password) – Easy PDF Tool',
    description: 'Encrypt your PDFs with a password for enhanced security. Free online PDF protection tool with user permissions and print restrictions.',
    keywords: [
      'Protect PDF', 'Password PDF', 'Encrypt PDF', 'Secure PDF', 'PDF security',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF protect', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Protector',
    features: [
      'Password encryption',
      'User permissions',
      'Print restrictions',
      'Copy protection'
    ]
  },
  {
    path: 'unlock',
    title: 'Unlock PDF (Remove Password) – Easy PDF Tool',
    description: 'Remove password protection from your PDF files. Free online PDF unlocker with secure browser-based processing.',
    keywords: [
      'Unlock PDF', 'Remove PDF password', 'Decrypt PDF', 'PDF password remover', 'Open protected PDF',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF unlock', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Unlocker',
    features: [
      'Password removal',
      'Quick processing',
      'Secure unlocking',
      'No data retention'
    ]
  },
  {
    path: 'delete-pages',
    title: 'Delete PDF Pages Online – Easy PDF Tool',
    description: 'Remove unwanted pages from your PDF document easily. Free online tool to extract specific pages or delete page ranges.',
    keywords: [
      'Delete PDF pages', 'Remove PDF pages', 'Extract PDF pages', 'PDF page removal', 'Trim PDF',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF delete', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Page Deleter',
    features: [
      'Select specific pages',
      'Page range deletion',
      'Preview before deletion',
      'Instant processing'
    ]
  },
  {
    path: 'reorder',
    title: 'Reorder PDF Pages Online – Easy PDF Tool',
    description: 'Rearrange the order of pages within your PDF document. Free online PDF page reordering tool with drag-and-drop interface.',
    keywords: [
      'Reorder PDF pages', 'Rearrange PDF', 'Organize PDF pages', 'PDF page order', 'Sort PDF pages',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF reorder', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Page Reorderer',
    features: [
      'Drag & drop interface',
      'Visual page preview',
      'Instant reordering',
      'Download organized PDF'
    ]
  },
  {
    path: 'organize',
    title: 'Organize PDF Online – Easy PDF Tool',
    description: 'Combine reordering and deletion to organize your PDF pages. Complete suite of PDF organization tools with visual interface.',
    keywords: [
      'Organize PDF', 'PDF organizer', 'Manage PDF pages', 'PDF page management', 'Restructure PDF',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF organize', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Organizer',
    features: [
      'Page reordering',
      'Page deletion',
      'Visual management',
      'Complete organization'
    ]
  },
  {
    path: 'page-numbers',
    title: 'Add Page Numbers to PDF – Easy PDF Tool',
    description: 'Insert customizable page numbers, headers, or footers into your PDF. Free online tool with header/footer options and custom numbering.',
    keywords: [
      'Add page numbers', 'PDF page numbers', 'Number PDF pages', 'PDF headers footers', 'Paginate PDF',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF numbering', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Page Number Tool',
    features: [
      'Custom numbering formats',
      'Header & footer options',
      'Position control',
      'Font customization'
    ]
  },
  {
    path: 'ocr',
    title: 'OCR (Text Recognition) PDF – Easy PDF Tool',
    description: 'Extract editable text from scanned PDFs and images. Free online OCR tool with multiple language support and high accuracy.',
    keywords: [
      'OCR PDF', 'Extract text', 'PDF text recognition', 'Scan to text', 'PDF OCR online',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF OCR', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF OCR Tool',
    features: [
      'Text extraction',
      'Multiple languages',
      'Image processing',
      'Editable output'
    ]
  },
  {
    path: 'sign',
    title: 'Sign / Annotate PDF Online – Easy PDF Tool',
    description: 'Draw, type, or upload your signature and place it on your PDF. Free online PDF signing tool with drawing and typing options.',
    keywords: [
      'Sign PDF', 'PDF signature', 'Annotate PDF', 'Digital signature', 'PDF signing tool',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF sign', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Signature Tool',
    features: [
      'Digital signatures',
      'Drawing tools',
      'Text annotations',
      'Signature placement'
    ]
  },
  {
    path: 'form-filler',
    title: 'PDF Form Filler Online – Easy PDF Tool',
    description: 'Add text, checkmarks, or other inputs to any PDF form. Free online PDF form completion tool with save functionality.',
    keywords: [
      'Fill PDF form', 'PDF form filler', 'Complete PDF forms', 'PDF input', 'Form completion',
      'Client-side PDF', 'Privacy PDF tool', 'No upload PDF form', 'Wali Mohammad Kadri'
    ],
    toolName: 'PDF Form Filler',
    features: [
      'Form field detection',
      'Text input',
      'Checkbox support',
      'Form saving'
    ]
  },
  {
    path: 'legal-analyzer',
    title: 'Legal Document Analyzer – Easy PDF Tool',
    description: 'AI-powered tool for legal document review and clause extraction. Free online legal document analysis tool with risk assessment.',
    keywords: [
      'Legal document analyzer', 'Contract review', 'Legal AI', 'Document analysis', 'Clause extraction',
      'AI document processing', 'Legal analysis', 'Contract analysis', 'Document review'
    ],
    toolName: 'Legal Document Analyzer',
    features: [
      'AI-powered analysis',
      'Clause extraction',
      'Risk assessment',
      'Legal insights'
    ]
  },
  {
    path: 'medical-analyzer',
    title: 'Medical Document Analyzer – Easy PDF Tool',
    description: 'AI-powered tool for medical document review and key information extraction. Free online medical document analysis tool.',
    keywords: [
      'Medical document analyzer', 'Medical AI', 'Health document review', 'Medical analysis', 'Patient document',
      'AI medical analysis', 'Patient data extraction', 'Diagnosis identification', 'Health insights'
    ],
    toolName: 'Medical Document Analyzer',
    features: [
      'Medical AI analysis',
      'Patient data extraction',
      'Diagnosis identification',
      'Health insights'
    ]
  }
];

// Advanced tools
const advancedTools = [
  {
    path: 'tools/pdf-metadata-editor',
    title: 'PDF Metadata Editor - Edit PDF Properties Online',
    description: 'Edit PDF metadata including title, author, subject, keywords, and creation dates. Free online tool with secure browser-based processing.',
    keywords: [
      'PDF metadata editor', 'edit PDF properties', 'PDF title editor', 'PDF author editor',
      'PDF subject editor', 'PDF keywords editor', 'document metadata', 'PDF information editor',
      'free metadata editor', 'browser PDF metadata', 'client-side metadata editing'
    ],
    toolName: 'PDF Metadata Editor',
    features: [
      'Edit title, author, subject',
      'Modify keywords and creation date',
      'Preserve document structure',
      'Client-side processing'
    ]
  },
  {
    path: 'tools/pdf-bookmark-manager',
    title: 'PDF Bookmark Manager - Organize PDF Navigation',
    description: 'Add, edit, and organize PDF bookmarks and navigation structure. Improve document navigation and user experience.',
    keywords: [
      'PDF bookmarks', 'PDF navigation', 'bookmark manager', 'PDF outline', 'document navigation',
      'PDF table of contents', 'bookmark editor', 'navigation structure', 'PDF organization',
      'document outline', 'bookmark creation', 'PDF structure'
    ],
    toolName: 'PDF Bookmark Manager',
    features: [
      'Add custom bookmarks',
      'Edit existing bookmarks',
      'Organize bookmark hierarchy',
      'Export bookmark list'
    ]
  },
  {
    path: 'tools/pdf-table-extractor',
    title: 'PDF Table Extractor - Extract Tables to CSV/Excel',
    description: 'Extract and export tables from PDF documents to CSV, Excel, or JSON format. Advanced table detection and data extraction.',
    keywords: [
      'PDF table extraction', 'extract tables from PDF', 'PDF to CSV', 'PDF to Excel', 'table data extraction',
      'PDF data mining', 'table converter', 'data extraction tool', 'PDF table parser', 'structured data extraction',
      'tabular data export', 'PDF data export'
    ],
    toolName: 'PDF Table Extractor',
    features: [
      'Extract tables automatically',
      'Export to CSV/Excel/JSON',
      'Preview extracted data',
      'Handle complex table structures'
    ]
  },
  {
    path: 'tools/pdf-batch-processor',
    title: 'PDF Batch Processor - Bulk PDF Operations',
    description: 'Process multiple PDF files at once with various operations like merge, split, compress. Efficient bulk PDF processing tool.',
    keywords: [
      'PDF batch processing', 'bulk PDF operations', 'mass PDF processing', 'batch converter',
      'bulk merge PDF', 'batch compression', 'mass watermarking', 'automated PDF processing',
      'bulk PDF tools', 'batch operations', 'multiple file processing', 'PDF automation'
    ],
    toolName: 'PDF Batch Processor',
    features: [
      'Batch merge multiple PDFs',
      'Bulk compression',
      'Mass watermarking',
      'Batch operations'
    ]
  },
  {
    path: 'tools/pdf-form-creator',
    title: 'PDF Form Creator - Create Interactive PDF Forms',
    description: 'Create interactive PDF forms with various field types including text, checkboxes, and signatures. Professional form builder.',
    keywords: [
      'PDF form creator', 'interactive PDF forms', 'form builder', 'PDF form designer',
      'fillable PDF forms', 'form creation tool', 'PDF form generator', 'interactive forms',
      'form fields', 'PDF form development', 'custom forms', 'professional forms'
    ],
    toolName: 'PDF Form Creator',
    features: [
      'Text input fields',
      'Checkboxes and radio buttons',
      'Dropdown menus',
      'Signature fields'
    ]
  },
  {
    path: 'tools/advanced-ocr',
    title: 'Advanced OCR with AI - Smart Text Recognition',
    description: 'Extract text from PDFs and images with AI-powered enhancement and formatting. Multi-language support and high accuracy.',
    keywords: [
      'advanced OCR', 'AI text recognition', 'smart OCR', 'text extraction', 'AI-powered OCR',
      'multi-language OCR', 'intelligent text recognition', 'OCR enhancement', 'document digitization',
      'text mining', 'AI document processing', 'smart text extraction'
    ],
    toolName: 'Advanced OCR with AI',
    features: [
      'AI-enhanced text extraction',
      'Multiple language support',
      'Format preservation',
      'Confidence scoring'
    ]
  },
  {
    path: 'tools/pdf-accessibility-checker',
    title: 'PDF Accessibility Checker - WCAG Compliance Tool',
    description: 'Check PDF documents for accessibility compliance and WCAG standards. Ensure your PDFs are accessible to all users.',
    keywords: [
      'PDF accessibility', 'WCAG compliance', 'accessibility checker', 'document accessibility',
      'screen reader compatibility', 'inclusive design', 'accessibility audit', 'PDF compliance',
      'disability access', 'universal design', 'accessibility testing', 'barrier-free documents'
    ],
    toolName: 'PDF Accessibility Checker',
    features: [
      'WCAG compliance check',
      'Alt text validation',
      'Reading order analysis',
      'Color contrast testing',
      'Screen reader compatibility',
      'Accessibility reporting'
    ]
  },
  {
    path: 'tools/pdf-digital-signature',
    title: 'PDF Digital Signature - Add Legal Digital Signatures',
    description: 'Add legally binding digital signatures to PDF documents with certificate management and validation. Secure, compliant, and browser-based.',
    keywords: [
      'PDF digital signature', 'digital certificate', 'electronic signature', 'PDF signing',
      'legal signature', 'document authentication', 'signature validation', 'certificate management',
      'secure signing', 'digital notary', 'PDF security', 'document integrity'
    ],
    toolName: 'PDF Digital Signature',
    features: [
      'Digital certificates',
      'Signature validation',
      'Timestamp authority',
      'Legal compliance'
    ]
  },
  {
    path: 'tools/pdf-redaction',
    title: 'PDF Redaction Tool - Remove Sensitive Information',
    description: 'Permanently remove sensitive information from PDF documents with secure redaction and verification. GDPR compliant and privacy-focused.',
    keywords: [
      'PDF redaction', 'remove sensitive data', 'document privacy', 'data protection',
      'GDPR compliance', 'information removal', 'document sanitization', 'privacy tool',
      'secure redaction', 'content removal', 'document security', 'data anonymization'
    ],
    toolName: 'PDF Redaction Tool',
    features: [
      'Content removal',
      'Metadata cleaning',
      'Visual verification',
      'Secure deletion'
    ]
  },
  {
    path: 'tools/pdf-version-comparison',
    title: 'PDF Version Comparison - Document Diff Tool',
    description: 'Compare different versions of PDF documents with visual diff highlighting. Track changes and identify differences between document versions.',
    keywords: [
      'PDF comparison', 'document diff', 'version control', 'change tracking',
      'document comparison', 'PDF diff tool', 'version tracking', 'change detection',
      'document versioning', 'file comparison', 'revision tracking', 'document analysis'
    ],
    toolName: 'PDF Version Comparison',
    features: [
      'Visual diff',
      'Text comparison',
      'Layout changes',
      'Version tracking'
    ]
  },
  {
    path: 'tools/pdf-annotation-collaboration',
    title: 'PDF Annotation Collaboration - Team Review Tool',
    description: 'Collaborate on PDF annotations with team members and export shared comments. Perfect for document review workflows.',
    keywords: [
      'PDF collaboration', 'document review', 'team annotations', 'collaborative editing',
      'PDF comments', 'document workflow', 'review process', 'annotation sharing',
      'team collaboration', 'document feedback', 'collaborative review', 'shared annotations'
    ],
    toolName: 'PDF Annotation Collaboration',
    features: [
      'Team annotations',
      'Comment threads',
      'Export annotations',
      'Review workflows'
    ]
  }
];

// Business tools
const businessTools = [
  {
    path: 'invoice-generator',
    title: 'PDF Invoice Generator - Create Professional Invoices Online',
    description: 'Create professional invoices with GST support, multiple currencies, and customizable templates. Free online invoice maker for businesses.',
    keywords: [
      'PDF invoice generator', 'create invoice', 'invoice maker', 'business invoice', 'GST invoice',
      'professional invoice', 'invoice template', 'business billing', 'invoice creation', 'GST billing'
    ],
    toolName: 'PDF Invoice Generator',
    features: [
      'Professional invoice templates',
      'GST and tax calculations',
      'Multiple currency support',
      'Client and company management'
    ]
  },
  {
    path: 'qr-generator',
    title: 'QR Code Generator - Create QR Codes for PDF Online',
    description: 'Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF with customizable size and quality.',
    keywords: [
      'QR code generator', 'QR code maker', 'wifi QR code', 'vcard QR code', 'url QR code',
      'QR code PDF', 'barcode generator', 'QR code creator', 'dynamic QR code'
    ],
    toolName: 'QR Code Generator',
    features: [
      'Multiple QR code types',
      'Customizable size and quality',
      'WiFi and vCard support',
      'PNG and PDF export'
    ]
  },
  {
    path: 'certificate-generator',
    title: 'Certificate Generator - Create Professional Certificates PDF',
    description: 'Generate professional certificates for courses, training, achievements with customizable templates and styling options.',
    keywords: [
      'certificate generator', 'certificate maker', 'course certificate', 'training certificate',
      'achievement certificate', 'certificate template', 'professional certificate', 'digital certificate'
    ],
    toolName: 'Certificate Generator',
    features: [
      'Multiple certificate templates',
      'Customizable colors and styles',
      'Professional layouts',
      'Automatic certificate IDs'
    ]
  },
  {
    path: 'portfolio-creator',
    title: 'Portfolio Creator - Create Professional PDF Portfolios',
    description: 'Create professional PDF portfolios with customizable sections for experience, education, skills, and projects.',
    keywords: [
      'portfolio creator', 'PDF portfolio', 'professional portfolio', 'resume builder', 'cv maker',
      'portfolio generator', 'career portfolio', 'professional cv'
    ],
    toolName: 'Portfolio Creator',
    features: [
      'Professional portfolio templates',
      'Multiple customizable sections',
      'Experience and education tracking',
      'Skills and projects showcase'
    ]
  },
  {
    path: 'report-generator',
    title: 'Report Generator - Create Professional Business Reports PDF',
    description: 'Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.',
    keywords: [
      'report generator', 'business report', 'PDF report', 'professional report', 'report maker',
      'business analysis', 'report template', 'professional reporting'
    ],
    toolName: 'Report Generator',
    features: [
      'Multiple report templates',
      'Key metrics dashboard',
      'Customizable sections',
      'Professional formatting'
    ]
  }
];

// Function to generate layout content
function generateLayoutContent(tool) {
  return `import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "${tool.title}",
  description: "${tool.description}",
  keywords: ${JSON.stringify(tool.keywords, null, 2)},
  canonicalUrl: "https://easy-pdf-murex.vercel.app/${tool.path}",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "${tool.toolName}",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "${tool.toolName}", url: "https://easy-pdf-murex.vercel.app/${tool.path}" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "${tool.toolName}",
  description: "${tool.description}",
  url: "/${tool.path}",
  features: ${JSON.stringify(tool.features, null, 2)},
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "${tool.toolName}", url: "https://easy-pdf-murex.vercel.app/${tool.path}" }
  ]
});

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
`;
}

// Update tool layouts
[...tools, ...advancedTools, ...businessTools].forEach(tool => {
  const layoutPath = path.join(__dirname, '..', 'src', 'app', tool.path, 'layout.js');
  const content = generateLayoutContent(tool);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(layoutPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(layoutPath, content, 'utf8');
    console.log(`✅ Updated layout for ${tool.path}`);
  } catch (error) {
    console.error(`❌ Failed to update layout for ${tool.path}:`, error.message);
  }
});

console.log('🎉 All tool layouts updated with enhanced SEO!');