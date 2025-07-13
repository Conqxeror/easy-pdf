#!/usr/bin/env node
/**
 * Duplicate React Import Fixer
 * Removes duplicate React imports that were accidentally added
 */

const fs = require('fs');
const path = require('path');

function fixDuplicateReactImports(dirPath) {
  const issues = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(item)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          
          // Find all React import lines (various patterns)
          const reactImportIndices = [];
          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('import React from "react"') || 
                trimmed.startsWith("import React from 'react'") ||
                trimmed.startsWith('import React, {') ||
                trimmed.startsWith("import React, {")) {
              reactImportIndices.push({ index, line: trimmed });
            }
          });
          
          // If we have multiple React imports, consolidate them
          if (reactImportIndices.length > 1) {
            // Find the most comprehensive import (with hooks/destructuring)
            let keepIndex = 0;
            let keepLine = reactImportIndices[0].line;
            
            for (let i = 1; i < reactImportIndices.length; i++) {
              const currentLine = reactImportIndices[i].line;
              // Prefer imports that include destructuring
              if (currentLine.includes('{') && !keepLine.includes('{')) {
                keepIndex = i;
                keepLine = currentLine;
              }
            }
            
            // Remove all React imports except the one we want to keep
            const indicesToRemove = [];
            for (let i = reactImportIndices.length - 1; i >= 0; i--) {
              if (i !== keepIndex) {
                indicesToRemove.push(reactImportIndices[i].index);
              }
            }
            
            // Remove lines in reverse order to maintain indices
            indicesToRemove.sort((a, b) => b - a);
            for (const index of indicesToRemove) {
              lines.splice(index, 1);
            }
            
            const newContent = lines.join('\n');
            fs.writeFileSync(fullPath, newContent, 'utf8');
            issues.push({
              file: fullPath,
              removed: indicesToRemove.length,
              kept: keepLine
            });
          }
        }
      }
    }
  }
  
  walk(dirPath);
  return issues;
}

function main() {
  console.log('🔧 Fixing duplicate React imports...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ No src directory found');
    process.exit(1);
  }
  
  const issues = fixDuplicateReactImports(srcPath);
  
  if (issues.length === 0) {
    console.log('✅ No duplicate React imports found!');
  } else {
    console.log(`📝 Fixed ${issues.length} files with duplicate React imports:\n`);
    
    issues.forEach(issue => {
      console.log(`✅ Fixed: ${path.relative(process.cwd(), issue.file)} (removed ${issue.removed} duplicates)`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Files fixed: ${issues.length}`);
    console.log(`📁 Total duplicates removed: ${issues.reduce((sum, issue) => sum + issue.removed, 0)}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixDuplicateReactImports };