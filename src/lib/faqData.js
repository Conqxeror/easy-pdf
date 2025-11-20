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

  "docx-to-pdf": [
    {
      question: "Does formatting stay intact?",
      answer: "Core text, headings, and simple tables are preserved by the mammoth → jsPDF pipeline. Extremely complex layouts may need additional tweaking, and we plan to add a PagedJS-assisted mode for better fidelity."
    },
    {
      question: "Is there a file size limit?",
      answer: "For reliable in-browser conversion we recommend DOCX files under roughly 25MB. Larger documents can exhaust browser memory, so consider splitting them first."
    },
    {
      question: "Are my documents uploaded?",
      answer: "No. Every conversion step runs locally in your browser so your Word files never hit a remote server."
    }
  ],

  "docx-to-text": [
    {
      question: "Will formatting be preserved?",
      answer: "This tool extracts plain text only. If you need layout or styling, use DOCX → PDF or DOCX → HTML instead."
    },
    {
      question: "Is my document uploaded anywhere?",
      answer: "All parsing happens locally using Mammoth, so your DOCX stays on your device."
    }
  ],

  "mp4-to-mp3": [
    {
      question: "Is there a file size limit?",
      answer: "For stability we cap in-browser conversions at about 200MB per video. This keeps ffmpeg.wasm responsive on typical laptops."
    },
    {
      question: "Do my videos get uploaded?",
      answer: "No. The ffmpeg WebAssembly core runs entirely in your browser tab, so media never leaves your device."
    },
    {
      question: "What audio quality do you export?",
      answer: "We default to 192 kbps MP3 using LAME for a good balance of size and fidelity. Future updates will expose more presets."
    }
  ],

  "zip-extractor": [
    {
      question: "Is there a size limit?",
      answer: "Archives up to ~200MB work best in browsers without running out of memory. Heavier workloads are better suited for desktop utilities."
    },
    {
      question: "Are my files uploaded to a server?",
      answer: "No. JSZip parses everything in-memory inside your browser, so closing the tab clears the archive."
    },
    {
      question: "Can I download everything at once?",
      answer: "Yes. Use the Download All option to trigger sequential saves for every file after extraction."
    }
  ],

  "csv-json-converter": [
    {
      question: "Does this handle quoted fields?",
      answer: "Yes. The parser supports quoted values and commas inside those quotes for most common CSV exports."
    },
    {
      question: "Is there a row or size limit?",
      answer: "For inline conversion we suggest staying under about 2MB (~10k rows). Larger datasets can exceed browser memory."
    },
    {
      question: "Can I convert multiple files at once?",
      answer: "Drag one CSV or JSON file at a time today. Batch conversion is on the roadmap once the core flow stabilizes."
    }
  ],

  "txt-to-pdf": [
    {
      question: "How do I convert text to PDF?",
      answer: "Paste or upload your text, adjust the layout options (page size, orientation, font size), then click Convert to PDF to render it locally."
    },
    {
      question: "Can I customize formatting?",
      answer: "Yes. Choose from multiple page formats, switch between portrait and landscape, tweak font size, and optionally add headers and footers."
    },
    {
      question: "Is my text uploaded?",
      answer: "Everything renders inside your browser with jsPDF, so your content never leaves your machine."
    }
  ],

  "heic-to-jpg": [
    {
      question: "Do you upload my photos?",
      answer: "No. HEIC conversion happens completely inside your browser via heic2any, keeping photos private."
    },
    {
      question: "Is there a file size limit?",
      answer: "For smooth performance we suggest individual HEIC files under roughly 100MB."
    },
    {
      question: "Can I keep transparency?",
      answer: "JPGs do not support transparency, but you can switch the output to PNG inside the tool to preserve alpha channels."
    }
  ],

  "text-case-converter": [
    {
      question: "Will this overwrite my original text?",
      answer: "The input stays untouched until you click \"Apply to editor\" on a result card, so you can experiment safely."
    },
    {
      question: "Can it handle Unicode characters?",
      answer: "Yes. We use Unicode-aware splitting, so accented letters and non-Latin scripts remain intact."
    },
    {
      question: "Which cases are supported?",
      answer: "Uppercase, lowercase, sentence case, title case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE are all included."
    }
  ],

  "url-encoder": [
    {
      question: "Why do spaces sometimes become plus signs?",
      answer: "Query parameters often encode spaces as +. We normalize this so decoding restores the original spacing automatically."
    },
    {
      question: "Can I decode third-party URLs safely?",
      answer: "Yes. Everything runs locally, so you can paste encoded URLs or payloads without exposing them to a server."
    },
    {
      question: "Does this support bulk editing?",
      answer: "Use multi-line mode to paste entire query strings. Each line stays intact so you can edit values before re-encoding."
    }
  ],

  "base64-encoder": [
    {
      question: "What file size works best?",
      answer: "We recommend files under 15MB so the browser can read and encode them without exhausting memory."
    },
    {
      question: "Does Base64 encoding keep my data secure?",
      answer: "No. Base64 only changes the representation. It is not encryption, but it is useful for embedding binary data in text formats."
    },
    {
      question: "Are files uploaded anywhere?",
      answer: "Never. Everything stays inside your browser tab and disappears when you refresh or close it."
    }
  ],

  "html-markdown-converter": [
    {
      question: "Do you sanitize generated HTML?",
      answer: "Yes. We sanitize the preview to strip dangerous scripts while preserving useful attributes like classes, inline styles, and link targets so the markup remains practical."
    },
    {
      question: "Can I keep custom components?",
      answer: "Paste JSX-like snippets or CMS shortcodes and they will remain intact. Only unsupported HTML tags are removed during sanitization to keep the live preview safe."
    },
    {
      question: "Is any of my content uploaded?",
      answer: "Never. Conversions use marked and Turndown entirely in your browser, and clearing the tab wipes the data."
    }
  ],

  "json-xml-converter": [
    {
      question: "Will attributes survive a round trip?",
      answer: "Yes. We keep XML attributes using the @_{attribute} notation so you can safely convert back to XML without losing metadata."
    },
    {
      question: "Can I prettify minified payloads?",
      answer: "Both directions format the output automatically, so even minified JSON or single-line XML becomes human-readable instantly."
    },
    {
      question: "What happens to empty nodes?",
      answer: "Empty nodes stay in place (using self-closing tags) so APIs that depend on them continue to work."
    }
  ],

  "text-diff-checker": [
    {
      question: "Which diff mode should I use?",
      answer: "Words works best for marketing copy, lines is ideal for markdown or config files, and characters helps you zoom into punctuation or emoji tweaks."
    },
    {
      question: "Can I ignore casing or spaces?",
      answer: "Yes. Toggle Ignore Case or Collapse Whitespace to reduce noise from capitalization or formatting-only edits."
    },
    {
      question: "Can I export the diff?",
      answer: "Use the Copy or Download buttons to share a plain-text report in docs, tickets, or chat threads."
    }
  ],

  "regex-tester": [
    {
      question: "Can I test named groups?",
      answer: "Yes. Named groups are listed in the capture table as long as you use the Unicode flag when required."
    },
    {
      question: "Why do you stop after 400 matches?",
      answer: "To keep the browser responsive we cap the loop so runaway patterns or zero-length matches cannot freeze the tab."
    },
    {
      question: "Is my sample text uploaded?",
      answer: "No. Everything you type is evaluated locally in your browser and cleared when you close the tab."
    }
  ],

  "uuid-generator": [
    {
      question: "Which UUID version should I use?",
      answer: "v4 is purely random, v7 is time-ordered for better database inserts, and v1 includes MAC/timestamp info for legacy compatibility."
    },
    {
      question: "Can I export the IDs?",
      answer: "Yes. Copy them straight to your clipboard or download a .txt file for scripts and migrations."
    },
    {
      question: "Are these UUIDs generated securely?",
      answer: "Yes. We rely on Web Crypto's randomness plus the uuid library, and nothing leaves your browser."
    }
  ],

  "hash-generator": [
    {
      question: "Which algorithms do you support?",
      answer: "MD5, SHA-1, SHA-256, and SHA-512 are available, and you can toggle each one depending on your workflow."
    },
    {
      question: "Can I hash large files?",
      answer: "Files up to about 25 MB work well in a browser tab. For bigger payloads we recommend a desktop utility or CLI."
    },
    {
      question: "Is salting supported?",
      answer: "Yes. Add an optional salt that prepends to your text before hashing to verify secrets safely."
    }
  ],

  "html-to-pdf": [
    {
      question: "Can I include external CSS or fonts?",
      answer: "For privacy, we only render the markup you paste. Inline your CSS and use data URLs for custom assets. External resources that allow CORS may load, but embedding is the safest path."
    },
    {
      question: "Does the converter keep my code?",
      answer: "No. The editor state lives entirely in your browser. Once you refresh or close the tab the content disappears."
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
  ],

  "pdf-metadata-editor": [
    {
      question: "Will editing metadata change the PDF content?",
      answer: "No. We only modify the document properties stored in the file header. The actual pages, text, and layout remain untouched."
    },
    {
      question: "Can I scrub sensitive information?",
      answer: "Yes. Use the Scrub Personal Info action to clear the author, creator, producer, and keyword fields in one click before sharing the file."
    },
    {
      question: "What happens to my data?",
      answer: "All parsing and rewriting runs locally using pdf-lib. Your PDF never leaves the browser, and object URLs are revoked right after download."
    }
  ],

  "pdf-version-comparison": [
    {
      question: "What differences can the tool detect?",
      answer: "The diff highlights text edits, additions, deletions, formatting tweaks, image swaps, and metadata deltas so you can review every change."
    },
    {
      question: "Can I export the results?",
      answer: "Yes. After running a comparison you can download a structured JSON report with document stats, discovered differences, and timestamps for your audit trail."
    },
    {
      question: "Do my PDFs leave the browser?",
      answer: "No. Both versions are parsed locally via pdf-lib and canvas diffing, so nothing is uploaded to a server."
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