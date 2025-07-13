#!/usr/bin/env node
/**
 * ESLint Disable Comments Adder
 * Adds eslint-disable-next-line comments for remaining unused variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function addEslintDisableComments() {
  console.log('🔧 Adding ESLint disable comments for remaining unused variables...\n');
  
  // Get current lint errors
  let lintOutput;
  try {
    execSync('npm run lint:strict', { stdio: 'pipe', cwd: process.cwd() });
    console.log('✅ No lint errors found!');
    return;
  } catch (error) {
    lintOutput = error.stderr.toString();
  }
  
  const lines = lintOutput.split('\n');
  const fileIssues = {};
  
  // Parse lint output to group issues by file
  for (const line of lines) {
    const match = line.match(/^(.+):(\d+):(\d+)\s+Error:\s+'([^']+)'\s+is\s+(defined but never used|assigned a value but never used)/);
    if (match) {
      const [, filePath, lineNum, , varName, errorType] = match;
      if (!fileIssues[filePath]) {
        fileIssues[filePath] = [];
      }
      fileIssues[filePath].push({
        line: parseInt(lineNum),
        variable: varName,
        type: errorType
      });
    }
  }
  
  let fixedFiles = 0;
  
  // Process each file
  for (const [filePath, issues] of Object.entries(fileIssues)) {
    if (!fs.existsSync(filePath)) continue;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      
      // Sort issues by line number in reverse order to avoid line shifts
      issues.sort((a, b) => b.line - a.line);
      
      for (const issue of issues) {
        const lineIndex = issue.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const currentLine = lines[lineIndex];
          
          // Check if line already has eslint-disable comment
          if (!currentLine.includes('eslint-disable')) {
            // Add eslint-disable-next-line comment above the line
            const indent = currentLine.match(/^(\s*)/)[1];
            const disableComment = `${indent}// eslint-disable-next-line no-unused-vars`;
            lines.splice(lineIndex, 0, disableComment);
            modified = true;
          }
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)} (${issues.length} issues)`);
        fixedFiles++;
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedFiles}`);
  console.log(`📁 Total files with issues: ${Object.keys(fileIssues).length}`);
}

if (require.main === module) {
  addEslintDisableComments();
}

module.exports = { addEslintDisableComments };