#!/usr/bin/env node
/**
 * React Import Validator
 * Scans JavaScript/TypeScript files for React usage without proper imports
 */

const fs = require('fs');
const path = require('path');
// const { execSync } = require('child_process'); // Not used in current implementation

function needsReactImport(content) {
  // Check for JSX usage (tags that start with uppercase or common HTML tags in JSX context)
  const jsxPatterns = [
    /<[A-Z][a-zA-Z0-9]*/, // Components starting with uppercase
    /<div[>\s\/]/, /<span[>\s\/]/, /<p[>\s\/]/, /<h[1-6][>\s\/]/, /<ul[>\s\/]/, /<li[>\s\/]/, /<a[>\s\/]/, 
    /<button[>\s\/]/, /<input[>\s\/]/, /<form[>\s\/]/, /<img[>\s\/]/, /<section[>\s\/]/, /<nav[>\s\/]/,
    /<header[>\s\/]/, /<footer[>\s\/]/, /<main[>\s\/]/, /<aside[>\s\/]/, /<article[>\s\/]/,
    /<table[>\s\/]/, /<tr[>\s\/]/, /<td[>\s\/]/, /<th[>\s\/]/, /<thead[>\s\/]/, /<tbody[>\s\/]/,
    /<select[>\s\/]/, /<option[>\s\/]/, /<textarea[>\s\/]/, /<label[>\s\/]/, /<svg[>\s\/]/,
    /<path[>\s\/]/, /<circle[>\s\/]/, /<rect[>\s\/]/, /<line[>\s\/]/, /<g[>\s\/]/,
    // Self-closing tags
    /<[a-zA-Z][a-zA-Z0-9]*\s+[^>]*\/>/,
    // JSX fragments
    /<>/,
    /<\/>/
  ];
  
  // Check for React hooks usage
  const reactHookPatterns = [
    /useState\s*\(/,
    /useEffect\s*\(/,
    /useContext\s*\(/,
    /useReducer\s*\(/,
    /useCallback\s*\(/,
    /useMemo\s*\(/,
    /useRef\s*\(/,
    /useImperativeHandle\s*\(/,
    /useLayoutEffect\s*\(/,
    /useDebugValue\s*\(/
  ];
  
  // Check for React.createElement usage
  const reactCreateElementPattern = /React\.createElement\s*\(/;
  
  return jsxPatterns.some(pattern => pattern.test(content)) || 
         reactHookPatterns.some(pattern => pattern.test(content)) ||
         reactCreateElementPattern.test(content);
}

function hasReactImport(content) {
  const reactImportPatterns = [
    /import\s+React\s+from\s+['"]react['"]/,
    /import\s+React\s*,\s*\{[^}]*\}\s+from\s+['"]react['"]/,  // import React, { ... } from 'react'
    /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/,
    /import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"]/,
    /const\s+React\s*=\s*require\s*\(\s*['"]react['"]\s*\)/
  ];
  
  return reactImportPatterns.some(pattern => pattern.test(content));
}

function isNextJsAppRouterFile(filePath) {
  // Check if file is in Next.js App Router structure
  const normalizedPath = filePath.replace(/\\/g, '/');
  return normalizedPath.includes('/src/app/') || 
         normalizedPath.includes('/app/') ||
         normalizedPath.includes('/src/components/') ||
         normalizedPath.includes('/components/');
}

function hasNextJsConfig() {
  // Check if this is a Next.js project with automatic JSX transformation
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const nextConfigMjsPath = path.join(process.cwd(), 'next.config.mjs');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigMjsPath)) {
      return true;
    }
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.dependencies && packageJson.dependencies.next;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const needsReact = needsReactImport(content);
    const hasReact = hasReactImport(content);
    
    // Skip validation for Next.js App Router files if automatic JSX is enabled
    if (needsReact && !hasReact) {
      if (hasNextJsConfig() && isNextJsAppRouterFile(filePath)) {
        // Next.js 13+ with App Router has automatic JSX transformation
        return null;
      }
      
      return {
        file: filePath,
        issues: ['React usage detected without proper import']
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return null;
  }
}

function scanDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const issues = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (!['node_modules', '.next', '.git'].includes(item)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const issue = scanFile(fullPath);
          if (issue) {
            issues.push(issue);
          }
        }
      }
    }
  }
  
  walk(dirPath);
  return issues;
}

function main() {
  console.log('🔍 Scanning for React import issues...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ No src directory found');
    process.exit(1);
  }
  
  const issues = scanDirectory(srcPath);
  
  if (issues.length === 0) {
    console.log('✅ No React import issues found!');
    process.exit(0);
  }
  
  console.log(`❌ Found ${issues.length} React import issue(s):\n`);
  
  issues.forEach(issue => {
    console.log(`📁 ${issue.file}`);
    issue.issues.forEach(msg => {
      console.log(`   ⚠️  ${msg}`);
    });
    console.log('');
  });
  
  console.log('💡 Tip: Make sure to import React in files that use JSX or React APIs');
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory, needsReactImport, hasReactImport };