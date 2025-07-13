#!/usr/bin/env node
/**
 * FINAL TARGETED FIXES - Specific Remaining Issues
 */

const fs = require('fs');
const path = require('path');

function applyTargetedFixes() {
  console.log('🎯 APPLYING TARGETED FIXES for remaining issues...\n');
  
  const fixes = [
    // Portfolio creator
    {
      file: 'src/app/portfolio-creator/page.js',
      search: 'const newPage = pdfDoc.addPage();',
      replace: 'pdfDoc.addPage();',
      description: 'Remove unused newPage variable'
    },
    
    // Pricing
    {
      file: 'src/app/pricing/page.js',
      search: 'import { trackEvent } from "@/lib/analytics";',
      replace: '// import { trackEvent } from "@/lib/analytics"; // Not used',
      description: 'Comment out unused trackEvent import'
    },
    
    // Reorder
    {
      file: 'src/app/reorder/page.js',
      search: 'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
      replace: 'import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
      description: 'Remove unused Card import'
    },
    
    // Report generator
    {
      file: 'src/app/report-generator/page.js',
      search: '{chartData.map((entry, index) => (',
      replace: '{chartData.map((entry, _index) => (',
      description: 'Fix unused index parameter'
    },
    
    // Sign page
    {
      file: 'src/app/sign/page.js',
      search: 'import { rgb } from "pdf-lib";',
      replace: '// import { rgb } from "pdf-lib"; // Not used',
      description: 'Comment out unused rgb import'
    },
    
    {
      file: 'src/app/sign/page.js',
      search: 'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
      replace: 'import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
      description: 'Remove unused Card import'
    }
  ];
  
  let successCount = 0;
  
  fixes.forEach(fix => {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${fix.file}: ${fix.description}`);
        successCount++;
      } else {
        console.log(`ℹ️  ${fix.file}: Pattern not found or already fixed`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${fix.file}: ${error.message}`);
    }
  });
  
  console.log(`\n✅ Successfully applied ${successCount} targeted fixes`);
}

if (require.main === module) {
  applyTargetedFixes();
}

module.exports = { applyTargetedFixes };