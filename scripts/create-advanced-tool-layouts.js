// Script to create layout files for all missing tool pages
const fs = require('fs');
const path = require('path');

const advancedTools = [
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
      'Legal compliance',
      'Certificate management',
      'Secure signing process'
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
      'Secure deletion',
      'GDPR compliance',
      'Privacy protection'
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
      'Version tracking',
      'Change highlighting',
      'Detailed reports'
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
      'Review workflows',
      'Collaborative editing',
      'Shared feedback'
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
      'Batch operations',
      'Automated processing',
      'Multiple file handling'
    ]
  },
  {
    path: 'tools/pdf-table-extractor',
    title: 'PDF Table Extractor - Extract Tables to CSV/Excel',
    description: 'Extract and export tables from PDF documents to CSV, Excel, or JSON format. Advanced table detection and data extraction.',
    keywords: [
      'PDF table extraction', 'extract tables from PDF', 'PDF to CSV', 'PDF to Excel',
      'table data extraction', 'PDF data mining', 'table converter', 'data extraction tool',
      'PDF table parser', 'structured data extraction', 'tabular data export', 'PDF data export'
    ],
    toolName: 'PDF Table Extractor',
    features: [
      'Extract tables automatically',
      'Export to CSV/Excel/JSON',
      'Preview extracted data',
      'Handle complex table structures',
      'Data formatting options',
      'Batch table extraction'
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
      'Signature fields',
      'Form validation',
      'Professional templates'
    ]
  },
  {
    path: 'tools/pdf-bookmark-manager',
    title: 'PDF Bookmark Manager - Organize PDF Navigation',
    description: 'Add, edit, and organize PDF bookmarks and navigation structure. Improve document navigation and user experience.',
    keywords: [
      'PDF bookmarks', 'PDF navigation', 'bookmark manager', 'PDF outline',
      'document navigation', 'PDF table of contents', 'bookmark editor', 'navigation structure',
      'PDF organization', 'document outline', 'bookmark creation', 'PDF structure'
    ],
    toolName: 'PDF Bookmark Manager',
    features: [
      'Add custom bookmarks',
      'Edit existing bookmarks',
      'Organize bookmark hierarchy',
      'Export bookmark list',
      'Navigation optimization',
      'Structural organization'
    ]
  },
  {
    path: 'tools/advanced-ocr',
    title: 'Advanced OCR with AI - Smart Text Recognition',
    description: 'Extract text from PDFs and images with AI-powered enhancement and formatting. Multi-language support and high accuracy.',
    keywords: [
      'advanced OCR', 'AI text recognition', 'smart OCR', 'text extraction',
      'AI-powered OCR', 'multi-language OCR', 'intelligent text recognition', 'OCR enhancement',
      'document digitization', 'text mining', 'AI document processing', 'smart text extraction'
    ],
    toolName: 'Advanced OCR with AI',
    features: [
      'AI-enhanced text extraction',
      'Multiple language support',
      'Format preservation',
      'Confidence scoring',
      'Smart text recognition',
      'High accuracy processing'
    ]
  }
];

function generateLayoutContent(tool) {
  return `import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "${tool.title}",
  description: "${tool.description}",
  keywords: ${JSON.stringify(tool.keywords, null, 4)},
  canonicalUrl: "https://easy-pdf-murex.vercel.app/${tool.path}",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "${tool.toolName}",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Tools", url: "https://easy-pdf-murex.vercel.app/#tools" },
    { name: "${tool.toolName}", url: "https://easy-pdf-murex.vercel.app/${tool.path}" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "${tool.toolName}",
  description: "${tool.description}",
  url: "/${tool.path}",
  features: ${JSON.stringify(tool.features, null, 4)},
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Tools", url: "https://easy-pdf-murex.vercel.app/#tools" },
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

// Create layout files for all advanced tools
advancedTools.forEach(tool => {
  const layoutPath = path.join(__dirname, '..', 'src', 'app', tool.path, 'layout.js');
  const content = generateLayoutContent(tool);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(layoutPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(layoutPath, content, 'utf8');
    console.log(`✅ Created layout for ${tool.path}`);
  } catch (error) {
    console.error(`❌ Failed to create layout for ${tool.path}:`, error.message);
  }
});

console.log('🎉 All advanced tool layouts created with enhanced SEO!');