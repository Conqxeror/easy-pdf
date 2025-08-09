// Common FAQ data for PDF tools
export const commonFAQs = {
  security: [
    {
      question: "Is it safe to use this PDF tool online?",
      answer: "Yes, absolutely! All processing happens entirely in your browser using client-side technology. Your files never leave your device or get uploaded to any server, ensuring complete privacy and security."
    },
    {
      question: "Do you store my PDF files?",
      answer: "No, we never store your files. All PDF processing is done locally in your browser, and your documents remain on your device at all times."
    }
  ],
  
  general: [
    {
      question: "Is this PDF tool free to use?",
      answer: "Yes, all our PDF tools are completely free to use with no hidden costs, registration requirements, or file limits."
    },
    {
      question: "What browsers are supported?",
      answer: "Our tools work on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience."
    },
    {
      question: "Is there a file size limit?",
      answer: "While we support files up to 50MB for optimal performance, the actual limit depends on your device's memory and processing power."
    }
  ],

  technical: [
    {
      question: "Why do PDF tools work in the browser?",
      answer: "We use advanced JavaScript libraries like PDF-lib to process PDFs entirely in your browser, eliminating the need for server uploads and ensuring your privacy."
    },
    {
      question: "Can I use these tools offline?",
      answer: "Once the page loads, most tools can work offline since all processing happens in your browser. However, you'll need an internet connection to initially load the application."
    }
  ]
}

// Tool-specific FAQs
export const toolSpecificFAQs = {
  merge: [
    {
      question: "How many PDF files can I merge at once?",
      answer: "You can merge as many PDF files as your browser can handle. We recommend staying under 20 files for optimal performance."
    },
    {
      question: "Can I change the order of PDFs before merging?",
      answer: "Yes! You can drag and drop the uploaded files to reorder them before merging. The final PDF will follow the order you set."
    },
    {
      question: "Will the merged PDF maintain the original quality?",
      answer: "Absolutely! Our merging process preserves the original quality, formatting, and metadata of your PDF files."
    }
  ],

  split: [
    {
      question: "Can I extract specific pages from a PDF?",
      answer: "Yes, you can select individual pages or page ranges to extract. You can also split every page into separate files."
    },
    {
      question: "What formats can I download the split files in?",
      answer: "Split pages are saved as individual PDF files. You can download them individually or as a ZIP file containing all pages."
    }
  ],

  compress: [
    {
      question: "How much can I reduce my PDF file size?",
      answer: "Compression results vary depending on your PDF content. Typically, you can achieve 30-70% size reduction while maintaining good quality."
    },
    {
      question: "Will compression affect PDF quality?",
      answer: "Our compression algorithm is designed to maintain visual quality while reducing file size. You can choose different compression levels based on your needs."
    }
  ],

  "jpg-to-pdf": [
    {
      question: "What image formats are supported?",
      answer: "We support JPG, PNG, GIF, BMP, and WebP image formats. You can mix different formats in a single PDF."
    },
    {
      question: "Can I adjust the page size and orientation?",
      answer: "Yes, you can choose from standard page sizes (A4, Letter, etc.) and set portrait or landscape orientation for your PDF."
    }
  ],

  

  "pdf-to-jpg": [
    {
      question: "What resolution will the JPG images be?",
      answer: "You can choose the output resolution. Higher resolutions produce better quality images but larger file sizes."
    },
    {
      question: "Can I convert specific pages only?",
      answer: "Yes, you can select which pages to convert to JPG images instead of converting the entire PDF."
    }
  ],

  protect: [
    {
      question: "What type of encryption do you use?",
      answer: "We use industry-standard AES encryption to password-protect your PDFs, ensuring strong security for your documents."
    },
    {
      question: "Can I set different permission levels?",
      answer: "Yes, you can control printing permissions, copying text, and editing capabilities when password-protecting your PDF."
    }
  ],

  unlock: [
    {
      question: "Can you unlock any password-protected PDF?",
      answer: "You need to know the correct password to unlock a PDF. We cannot crack or bypass unknown passwords as this would compromise security."
    },
    {
      question: "Will the unlocked PDF be identical to the original?",
      answer: "Yes, removing password protection doesn't change the content, formatting, or quality of your PDF."
    }
  ],

  watermark: [
    {
      question: "Can I use both text and image watermarks?",
      answer: "Yes, you can add either text watermarks with custom fonts and colors, or upload image watermarks like logos."
    },
    {
      question: "Can I control watermark transparency?",
      answer: "Absolutely! You can adjust the opacity, position, rotation, and size of your watermarks for the perfect look."
    }
  ],

  sign: [
    {
      question: "Are digital signatures legally valid?",
      answer: "Our tool creates visual signatures for document signing. For legally binding digital signatures, consult with legal professionals about your jurisdiction's requirements."
    },
    {
      question: "Can I save my signature for reuse?",
      answer: "For privacy reasons, signatures are not saved. You'll need to create your signature each time you use the tool."
    }
  ]
}

// Get FAQs for a specific tool
export const getFAQsForTool = (toolName) => {
  const toolFAQs = toolSpecificFAQs[toolName] || []
  const securityFAQs = commonFAQs.security
  const generalFAQs = commonFAQs.general.slice(0, 2) // First 2 general FAQs
  
  return [...toolFAQs, ...securityFAQs, ...generalFAQs]
}