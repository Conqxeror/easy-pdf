//src\lib\advancedPdfProcessing.js

"use client";

import { trackEvent } from './analytics';

// Lazy-load pdf-lib to avoid adding it to the initial client bundle.
let _pdfLibModule = null;
async function getPdfLib() {
  if (_pdfLibModule) return _pdfLibModule;
  const mod = await import('pdf-lib');
  // normalize export names for older module shapes
  _pdfLibModule = {
    PDFDocument: mod.PDFDocument || mod.default?.PDFDocument,
    rgb: mod.rgb || (mod.default && mod.default.rgb),
    StandardFonts: mod.StandardFonts || (mod.default && mod.default.StandardFonts)
  };
  return _pdfLibModule;
}

export class AdvancedPdfProcessor {
  constructor() {
    this.supportedFeatures = {
      batchProcessing: true,
      aiAnalysis: true, // All features now free
      advancedCompression: true, // All features now free
      bulkWatermarking: true, // All features now free
      documentMerging: true,
      pageExtraction: true,
      formFilling: true,
      digitalSigning: true // All features now free
    };
  }

  /**
   * Batch process multiple PDF files
   * @param {Array} files - Array of PDF files
   * @param {string} operation - Operation to perform
   * @param {Object} options - Processing options
   */
  async batchProcess(files, operation, options = {}) {
    trackEvent('batch_processing_started', {
      operation,
      file_count: files.length
    });

    const results = [];
    const maxConcurrent = 10; // No premium restrictions
    
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(file => 
        this.processSingleFile(file, operation, options)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Update progress
        if (options.onProgress) {
          options.onProgress(Math.min(i + maxConcurrent, files.length), files.length);
        }
      } catch (error) {
        console.error('Batch processing error:', error);
        results.push({ error: error.message, file: batch[0]?.name });
      }
    }

    trackEvent('batch_processing_completed', {
      operation,
      file_count: files.length,
      success_count: results.filter(r => !r.error).length
    });

    return results;
  }

  /**
   * Process a single file based on operation
   */
  async processSingleFile(file, operation, options) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await getPdfLib();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      switch (operation) {
        case 'compress':
          return await this.compressPdf(pdfDoc, options);
        case 'watermark':
          return await this.addWatermark(pdfDoc, options);
        case 'extract_pages':
          return await this.extractPages(pdfDoc, options);
        case 'rotate':
          return await this.rotatePages(pdfDoc, options);
        case 'add_metadata':
          return await this.addMetadata(pdfDoc, options);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      return { error: error.message, file: file.name };
    }
  }

  /**
   * Advanced PDF compression
   */
  async compressPdf(pdfDoc, options = {}) {
    const compressionLevel = 'high'; // Always use best compression
    
    // Basic compression - remove unused objects
    const _pages = pdfDoc.getPages(); // eslint-disable-line no-unused-vars
    
    // Advanced compression now available to all users
    if (compressionLevel === 'high') {
      // Advanced compression techniques available to everyone
    }

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    return {
      data: pdfBytes,
      originalSize: options.originalSize,
      compressedSize: pdfBytes.length,
      compressionRatio: ((options.originalSize - pdfBytes.length) / options.originalSize * 100).toFixed(1)
    };
  }

  /**
   * Add watermark to PDF
   */
  async addWatermark(pdfDoc, options = {}) {
    const { text = 'WATERMARK', opacity = 0.5, fontSize = 50 } = options;
    const pages = pdfDoc.getPages();
    // Ensure pdf-lib symbols are loaded lazily
    const { StandardFonts, rgb } = await getPdfLib();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      page.drawText(text, {
        x: width / 2 - (text.length * fontSize) / 4,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: { angle: 45 }
      });
    }

    const pdfBytes = await pdfDoc.save();
    return { data: pdfBytes, watermark: text };
  }

  /**
   * Extract specific pages from PDF
   */
  async extractPages(pdfDoc, options = {}) {
    const { pageNumbers = [] } = options;
    const { PDFDocument } = await getPdfLib();
    const newPdf = await PDFDocument.create();
    
    for (const pageNum of pageNumbers) {
      if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
        newPdf.addPage(copiedPage);
      }
    }

    const pdfBytes = await newPdf.save();
    return { 
      data: pdfBytes, 
      extractedPages: pageNumbers.length,
      totalPages: pdfDoc.getPageCount()
    };
  }

  /**
   * Rotate pages in PDF
   */
  async rotatePages(pdfDoc, options = {}) {
    const { rotation = 90, pageNumbers = [] } = options;
    const pages = pdfDoc.getPages();

    if (pageNumbers.length === 0) {
      // Rotate all pages
      pages.forEach(page => page.setRotation({ angle: rotation }));
    } else {
      // Rotate specific pages
      pageNumbers.forEach(pageNum => {
        if (pageNum > 0 && pageNum <= pages.length) {
          pages[pageNum - 1].setRotation({ angle: rotation });
        }
      });
    }

    const pdfBytes = await pdfDoc.save();
    return { data: pdfBytes, rotation, affectedPages: pageNumbers.length || pages.length };
  }

  /**
   * Add metadata to PDF
   */
  async addMetadata(pdfDoc, options = {}) {
    const { title, author, subject, keywords } = options;

    if (title) pdfDoc.setTitle(title);
    if (author) pdfDoc.setAuthor(author);
    if (subject) pdfDoc.setSubject(subject);
    if (keywords) pdfDoc.setKeywords(keywords.split(','));
    
    pdfDoc.setProducer('PDF Tools - Privacy-First PDF Processing');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();
    return { data: pdfBytes, metadata: { title, author, subject, keywords } };
  }

  /**
   * Merge multiple PDFs with advanced options
   */
  async mergePdfs(files, options = {}) {
    const { addBookmarks = false, addPageNumbers = false } = options;
    const { PDFDocument, rgb } = await getPdfLib();
    const mergedPdf = await PDFDocument.create();
    
    let pageOffset = 0;
    const bookmarks = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      
      const copiedPages = await mergedPdf.copyPages(pdf, Array.from({ length: pageCount }, (_, i) => i));
      
      copiedPages.forEach((page, pageIndex) => {
        mergedPdf.addPage(page);
        
        // Add page numbers if requested
          if (addPageNumbers) {
          const pageNum = pageOffset + pageIndex + 1;
          page.drawText(`${pageNum}`, {
            x: page.getWidth() - 50,
            y: 20,
            size: 10,
              color: rgb(0.5, 0.5, 0.5)
          });
        }
      });

      // Add bookmark if requested
      if (addBookmarks) {
        bookmarks.push({
          title: file.name.replace('.pdf', ''),
          page: pageOffset
        });
      }

      pageOffset += pageCount;
    }

    const pdfBytes = await mergedPdf.save();
    return { 
      data: pdfBytes, 
      totalPages: pageOffset,
      sourceFiles: files.length,
      bookmarks: addBookmarks ? bookmarks : null
    };
  }

  /**
   * Analyze PDF for insights (Now available to all users)
   */
  async analyzePdf(file, analysisType = 'basic') {
    // AI Analysis now available to all users

    // This would integrate with AI services for document analysis
    // AI analysis features now available to everyone
    return {
      type: analysisType,
      insights: [],
      premium: false // No longer premium
    };
  }

  /**
   * Get processing capabilities based on user tier
   */
  getCapabilities(_userTier = 'free') {
    // All users now get full capabilities
    const capabilities = {
      maxBatchSize: 200,
      maxFileSize: 500 * 1024 * 1024, // 500MB
      features: ['merge', 'split', 'rotate', 'compress', 'watermark', 'ai_analysis', 'batch_processing', 'advanced_compression', 'digital_signing']
    };

    return capabilities;
  }
}

// Export singleton instance
export const advancedPdfProcessor = new AdvancedPdfProcessor();