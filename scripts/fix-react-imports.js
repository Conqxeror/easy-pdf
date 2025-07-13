#!/usr/bin/env node
/**
 * Automated React Import Fixer
 * Automatically adds React imports to files that need them
 */

const fs = require('fs');
const path = require('path');
const { scanDirectory, needsReactImport, hasReactImport } = require('./validate-react-imports.js');

function addReactImport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if React import is already present
    if (hasReactImport(content)) {
      return { success: false, reason: 'React already imported' };
    }
    
    // Check if React import is needed
    if (!needsReactImport(content)) {
      return { success: false, reason: 'React import not needed' };
    }
    
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the best place to insert the React import
    // Look for existing imports first
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines at the top
      if (line.startsWith('//') || line.startsWith('/*') || line === '') {
        continue;
      }
      
      // If we find an import, insert React import before it
      if (line.startsWith('import ')) {
        insertIndex = i;
        break;
      }
      
      // If we find any other code, insert at the beginning
      if (line !== '') {
        insertIndex = i;
        break;
      }
    }
    
    // Insert the React import
    lines.splice(insertIndex, 0, 'import React from "react";');
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return { success: true, reason: 'React import added' };
  } catch (error) {
    return { success: false, reason: `Error: ${error.message}` };
  }
}

function main() {
  console.log('🔧 Fixing React imports in detected files...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ No src directory found');
    process.exit(1);
  }
  
  // Get all files that need React imports
  const issues = scanDirectory(srcPath);
  
  if (issues.length === 0) {
    console.log('✅ No files need React import fixes!');
    process.exit(0);
  }
  
  let fixedCount = 0;
  let errorCount = 0;
  
  console.log(`📝 Found ${issues.length} files that need React imports. Fixing...\n`);
  
  issues.forEach(issue => {
    const result = addReactImport(issue.file);
    
    if (result.success) {
      console.log(`✅ Fixed: ${path.relative(process.cwd(), issue.file)}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${path.relative(process.cwd(), issue.file)} (${result.reason})`);
      if (result.reason.startsWith('Error:')) {
        errorCount++;
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Total files processed: ${issues.length}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 React imports have been added! Run validation again to confirm.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { addReactImport };