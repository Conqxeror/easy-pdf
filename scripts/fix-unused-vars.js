#!/usr/bin/env node
/**
 * Unused Variable Fixer
 * Automatically fixes unused variable warnings by removing them or prefixing with underscore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixUnusedVariables() {
  console.log('🔧 Fixing unused variable warnings...\n');
  
  // Get ESLint output to find unused variables
  let lintOutput;
  try {
    execSync('npm run lint:strict', { stdio: 'pipe', cwd: process.cwd() });
    console.log('✅ No unused variables found!');
    return;
  } catch (error) {
    lintOutput = error.stderr.toString();
  }
  
  const lines = lintOutput.split('\n');
  const fixes = [];
  
  for (const line of lines) {
    // Parse ESLint error lines
    const match = line.match(/^(.+):(\d+):(\d+)\s+Error:\s+'([^']+)'\s+is\s+(defined but never used|assigned a value but never used)/);
    if (match) {
      const [, filePath, lineNum, colNum, varName, errorType] = match;
      fixes.push({
        file: filePath,
        line: parseInt(lineNum),
        column: parseInt(colNum),
        variable: varName,
        type: errorType
      });
    }
  }
  
  if (fixes.length === 0) {
    console.log('✅ No unused variables to fix!');
    return;
  }
  
  console.log(`📝 Found ${fixes.length} unused variables to fix...\n`);
  
  // Group fixes by file
  const fileGroups = {};
  fixes.forEach(fix => {
    if (!fileGroups[fix.file]) {
      fileGroups[fix.file] = [];
    }
    fileGroups[fix.file].push(fix);
  });
  
  let fixedCount = 0;
  
  for (const [filePath, fileFixes] of Object.entries(fileGroups)) {
    try {
      if (!fs.existsSync(filePath)) continue;
      
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      
      // Sort fixes by line number in reverse order to avoid line number shifts
      fileFixes.sort((a, b) => b.line - a.line);
      
      for (const fix of fileFixes) {
        const lineIndex = fix.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          
          // Handle different types of unused variables
          if (fix.variable === 'React' && line.includes('import React')) {
            // Don't remove React imports as they're needed for JSX
            continue;
          }
          
          // Handle function parameters - prefix with underscore
          if (line.includes(`${fix.variable}`) && (line.includes('=>') || line.includes('function'))) {
            if (!fix.variable.startsWith('_')) {
              lines[lineIndex] = line.replace(new RegExp(`\\b${fix.variable}\\b`, 'g'), `_${fix.variable}`);
              modified = true;
            }
          }
          // Handle destructuring assignments
          else if (line.includes(`${fix.variable}`) && line.includes('=')) {
            // Remove the variable from destructuring or assignment
            if (line.includes('{') && line.includes('}')) {
              // Destructuring case
              const regex = new RegExp(`\\s*,?\\s*${fix.variable}\\s*,?\\s*`, 'g');
              lines[lineIndex] = line.replace(regex, (match, offset, string) => {
                // Handle commas properly
                const before = string.substring(0, offset);
                const after = string.substring(offset + match.length);
                
                if (before.endsWith(',') && after.startsWith(',')) {
                  return ',';
                } else if (before.endsWith(',') || after.startsWith(',')) {
                  return '';
                } else {
                  return '';
                }
              });
              
              // Clean up empty destructuring
              if (lines[lineIndex].match(/\{\s*\}/)) {
                lines.splice(lineIndex, 1);
              }
              modified = true;
            } else {
              // Simple assignment - remove the entire line if it's just the assignment
              if (line.trim().match(new RegExp(`^(const|let|var)\\s+${fix.variable}\\s*=`))) {
                lines.splice(lineIndex, 1);
                modified = true;
              }
            }
          }
          // Handle import statements
          else if (line.includes('import') && line.includes(fix.variable)) {
            // Remove from import list
            const regex = new RegExp(`\\s*,?\\s*${fix.variable}\\s*,?\\s*`, 'g');
            lines[lineIndex] = line.replace(regex, (match, offset, string) => {
              const before = string.substring(0, offset);
              const after = string.substring(offset + match.length);
              
              if (before.endsWith(',') && after.startsWith(',')) {
                return ',';
              } else if (before.endsWith(',') || after.startsWith(',')) {
                return '';
              } else {
                return '';
              }
            });
            
            // Clean up empty imports
            if (lines[lineIndex].match(/import\s*\{\s*\}\s*from/)) {
              lines.splice(lineIndex, 1);
            }
            modified = true;
          }
        }
      }
      
      if (modified) {
        // Clean up any double empty lines
        const cleanedContent = lines.join('\n').replace(/\n\n\n+/g, '\n\n');
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)} (${fileFixes.length} variables)`);
        fixedCount++;
      }
      
    } catch (error) {
      console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`📁 Total variables processed: ${fixes.length}`);
}

if (require.main === module) {
  fixUnusedVariables();
}

module.exports = { fixUnusedVariables };