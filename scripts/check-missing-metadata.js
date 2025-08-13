// Script to identify pages missing metadata
const fs = require('fs');
const path = require('path');

// Get all page files
function getPageFiles(dir, pages = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getPageFiles(filePath, pages);
    } else if (file === 'page.js' || file === 'page.jsx') {
      pages.push(filePath);
    }
  });
  
  return pages;
}

// Get corresponding layout file for a page
function getLayoutFile(pageFilePath) {
  const dir = path.dirname(pageFilePath);
  const layoutPath = path.join(dir, 'layout.js');
  if (fs.existsSync(layoutPath)) {
    return layoutPath;
  }
  return null;
}

// Check if a file has metadata
function hasMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for metadata export
    return content.includes('export const metadata =') || 
           content.includes('import { generateEnhancedMetadata') ||
           content.includes('generateEnhancedMetadata({');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

// Get project root
const projectRoot = path.join(__dirname, '..');

// Get all page files
const pageFiles = getPageFiles(path.join(projectRoot, 'src', 'app'));

console.log(`Total page files found: ${pageFiles.length}`);

let pagesWithNoMetadata = 0;

// Check each page and its layout
pageFiles.forEach(pageFile => {
  const hasPageMetadata = hasMetadata(pageFile);
  const layoutFile = getLayoutFile(pageFile);
  const hasLayoutMetadata = layoutFile ? hasMetadata(layoutFile) : false;
  
  if (!hasPageMetadata && !hasLayoutMetadata) {
    console.log(`Missing metadata: ${pageFile.replace(projectRoot, '')}`);
    pagesWithNoMetadata++;
  }
});

console.log(`
Pages with no metadata at all: ${pagesWithNoMetadata}`);
console.log(`Total pages: ${pageFiles.length}`);
if (pageFiles.length > 0) {
  const coverage = ((pageFiles.length - pagesWithNoMetadata) / pageFiles.length * 100);
  console.log(`Coverage: ${coverage.toFixed(2)}%`);
}