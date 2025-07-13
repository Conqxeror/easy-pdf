#!/usr/bin/env node
/**
 * Final Warning Eliminator
 * Fixes ALL remaining specific warnings based on exact lint output
 */

const fs = require('fs');
const path = require('path');

function fixAllRemainingWarnings() {
  console.log('🔧 Applying final fixes for all remaining warnings...\n');
  
  const fixes = [
    // Fix all currentCanvasScale references
    () => {
      const filePath = path.join(process.cwd(), 'src/app/form-filler/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/fontSize \* currentCanvasScale/g, 'fontSize * _currentCanvasScale');
      content = content.replace(/deltaCanvasX \/ currentCanvasScale/g, 'deltaCanvasX / _currentCanvasScale');
      content = content.replace(/deltaCanvasY \/ currentCanvasScale/g, 'deltaCanvasY / _currentCanvasScale');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed currentCanvasScale references in form-filler');
    },
    
    // Fix ClientLayout analytics parameter
    () => {
      const filePath = path.join(process.cwd(), 'src/app/ClientLayout.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/const handleRouteChange = \(url, \{ shallow \}, analytics\) => \{/g, 
                               'const handleRouteChange = (url, { shallow }, _analytics) => {');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed analytics parameter in ClientLayout');
    },
    
    // Remove unused imports
    () => {
      const files = [
        'src/app/jpg-to-pdf/page.js',
        'src/app/pdf-to-jpg/page.js'
      ];
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/import \{ Loader \} from "lucide-react";\n?/g, '');
          fs.writeFileSync(filePath, content);
          console.log(`✅ Removed Loader import from ${file}`);
        }
      });
    },
    
    // Fix invoice generator
    () => {
      const filePath = path.join(process.cwd(), 'src/app/invoice-generator/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/import React, \{ useState, useRef \} from "react";/g, 
                               'import React, { useState } from "react";');
      content = content.replace(/let tableStartY = yPosition;/g, 'let _tableStartY = yPosition;');
      content = content.replace(/const newPage = pdfDoc\.addPage\(\);/g, 'pdfDoc.addPage();');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed invoice generator issues');
    },
    
    // Fix OCR error variables
    () => {
      const filePath = path.join(process.cwd(), 'src/app/ocr/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/\.catch\(err => \{/g, '.catch(() => {');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed OCR error variables');
    },
    
    // Fix page-numbers
    () => {
      const filePath = path.join(process.cwd(), 'src/app/page-numbers/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/const \{ width: pageWidth, height: pageHeight \} = page\.getSize\(\);/g, 
                               'const { width: _pageWidth, height: _pageHeight } = page.getSize();');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed page-numbers unused variables');
    },
    
    // Fix pdf-to-jpg
    () => {
      const filePath = path.join(process.cwd(), 'src/app/pdf-to-jpg/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/\.catch\(err => \{/g, '.catch(() => {');
      content = content.replace(/\{images\.map\(\(image, index\) => \(/g, '{images.map((image, _index) => (');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed pdf-to-jpg issues');
    },
    
    // Fix portfolio creator
    () => {
      const filePath = path.join(process.cwd(), 'src/app/portfolio-creator/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/const newPage = pdfDoc\.addPage\(\);/g, 'pdfDoc.addPage();');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed portfolio creator');
    },
    
    // Remove unused imports
    () => {
      const filePath = path.join(process.cwd(), 'src/app/pricing/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/import \{ trackEvent \} from "@\/lib\/analytics";\n?/g, '');
      fs.writeFileSync(filePath, content);
      console.log('✅ Removed trackEvent import');
    },
    
    // Fix Card imports
    () => {
      const files = ['src/app/reorder/page.js', 'src/app/sign/page.js'];
      files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/import \{ Card, CardContent, CardHeader, CardTitle \} from "@\/components\/ui\/card";/g, 
                                   'import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";');
          fs.writeFileSync(filePath, content);
          console.log(`✅ Fixed Card import in ${file}`);
        }
      });
    },
    
    // Fix report generator
    () => {
      const filePath = path.join(process.cwd(), 'src/app/report-generator/page.js');
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/\{chartData\.map\(\(entry, index\) => \(/g, '{chartData.map((entry, _index) => (');
      fs.writeFileSync(filePath, content);
      console.log('✅ Fixed report generator');
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  fixes.forEach((fix, index) => {
    try {
      fix();
      successCount++;
    } catch (error) {
      console.log(`❌ Error in fix ${index + 1}: ${error.message}`);
      errorCount++;
    }
  });
  
  console.log(`\n📊 Final Summary:`);
  console.log(`✅ Successful fixes: ${successCount}`);
  console.log(`❌ Failed fixes: ${errorCount}`);
}

if (require.main === module) {
  fixAllRemainingWarnings();
}

module.exports = { fixAllRemainingWarnings };