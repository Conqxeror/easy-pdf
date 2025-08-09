// Script to update all tool layouts with enhanced SEO
const fs = require('fs');
const path = require('path');

const toolLayouts = [
  {
    path: 'src/app/compress/layout.js',
    title: 'Compress PDF Online – Easy PDF Tool',
    description: 'Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor with multiple quality levels.',
    keywords: [
      'Compress PDF', 'PDF compressor', 'Reduce PDF size', 'Shrink PDF', 'Optimize PDF',
      'Free PDF compression', 'Client-side PDF', 'Privacy PDF tool', 'No upload PDF compressor',
      'PDF optimization', 'File size reduction', 'Document compression'
    ],
    toolName: 'PDF Compressor',
    url: '/compress',
    features: [
      'Multiple compression levels',
      'Quality preservation', 
      'Batch processing',
      'Size preview',
      'Instant compression',
      'No quality loss'
    ]
  },
  {
    path: 'src/app/split/layout.js',
    title: 'Split PDF Online – Easy PDF Tool',
    description: 'Split PDF files into separate documents or extract specific pages. Free online tool with secure browser-based processing. No uploads required.',
    keywords: [
      'Split PDF', 'Extract PDF pages', 'Separate PDF', 'Divide PDF', 'PDF splitter',
      'Page extraction', 'PDF page separator', 'Document splitter', 'Free PDF split'
    ],
    toolName: 'PDF Splitter',
    url: '/split',
    features: [
      'Extract specific pages',
      'Split by page ranges',
      'Preview before splitting',
      'Download as ZIP',
      'Batch splitting',
      'Custom page selection'
    ]
  },
  {
    path: 'src/app/jpg-to-pdf/layout.js',
    title: 'JPG to PDF Converter – Easy PDF Tool',
    description: 'Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing. No uploads, instant conversion.',
    keywords: [
      'JPG to PDF', 'PNG to PDF', 'Image to PDF', 'Convert images', 'Photo to PDF',
      'Image converter', 'Picture to PDF', 'Free image converter', 'Batch image conversion'
    ],
    toolName: 'Image to PDF Converter',
    url: '/jpg-to-pdf',
    features: [
      'Multiple image formats',
      'Batch conversion',
      'Custom page sizes',
      'Image ordering',
      'Quality preservation',
      'Instant conversion'
    ]
  },
  
  {
    path: 'src/app/pdf-to-jpg/layout.js',
    title: 'PDF to JPG Converter – Easy PDF Tool',
    description: 'Convert PDF pages to high-quality JPG images. Free online tool with customizable quality settings and batch processing. Secure browser-based conversion.',
    keywords: [
      'PDF to JPG', 'PDF to PNG', 'Convert PDF to image', 'PDF to photo', 'Extract images',
      'PDF image converter', 'Document to image', 'Free PDF converter'
    ],
    toolName: 'PDF to Image Converter',
    url: '/pdf-to-jpg',
    features: [
      'High-quality output',
      'Custom resolution',
      'Batch processing',
      'Multiple formats',
      'Quality control',
      'Instant conversion'
    ]
  }
];

function generateLayoutContent(tool) {
  return `import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "${tool.title}",
  description: "${tool.description}",
  keywords: ${JSON.stringify(tool.keywords, null, 4)},
  canonicalUrl: "https://easy-pdf-murex.vercel.app${tool.url}",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "${tool.toolName}",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "${tool.toolName}", url: "https://easy-pdf-murex.vercel.app${tool.url}" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "${tool.title}",
  description: "${tool.description}",
  url: "${tool.url}",
  features: ${JSON.stringify(tool.features, null, 4)},
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "${tool.toolName}", url: "https://easy-pdf-murex.vercel.app${tool.url}" }
  ]
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

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

// Update each tool layout
toolLayouts.forEach(tool => {
  const fullPath = path.join(__dirname, '..', tool.path);
  const content = generateLayoutContent(tool);
  
  try {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${tool.path}`);
  } catch (error) {
    console.error(`❌ Failed to update ${tool.path}:`, error.message);
  }
});

console.log('🎉 All tool layouts updated with enhanced SEO!');