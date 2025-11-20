/**
 * Script to update all tool layout files to use centralized SEO helper
 * 
 * This script will:
 * 1. Find all layout.js files in src/app/*/ directories
 * 2. Replace the old metadata pattern with the new centralized helper
 * 
 * Run manually for each tool or automate via Node.js
 */

import { toolsData } from '../src/lib/toolData.js';
import fs from 'fs';
import path from 'path';

const tools = toolsData;

console.log(`Found ${tools.length} tools to process`);

tools.forEach(tool => {
  const toolPath = tool.href.replace('/', '');
  const layoutPath = path.join(process.cwd(), 'src', 'app', toolPath, 'layout.js');
  
  if (fs.existsSync(layoutPath)) {
    console.log(`Processing: ${toolPath}`);
    
    const newContent = `import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('${tool.href}');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      {structuredData.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
`;
    
    fs.writeFileSync(layoutPath, newContent, 'utf8');
    console.log(`✓ Updated: ${layoutPath}`);
  } else {
    console.log(`✗ Not found: ${layoutPath}`);
  }
});

console.log('Migration complete!');
