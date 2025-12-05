const fs = require('fs');
const path = require('path');

const toolDataPath = path.join(__dirname, '../src/lib/toolData.json');
const swPath = path.join(__dirname, '../public/sw.js');

const tools = JSON.parse(fs.readFileSync(toolDataPath, 'utf8'));
const toolHrefs = tools.map(t => t.href);

// Add some other critical pages
const allPages = [
    ...toolHrefs,
    '/about',
    '/tools',
    '/security',
    '/sponsors'
];

// Format as JS array string
const pagesString = JSON.stringify(allPages, null, 2);

let swContent = fs.readFileSync(swPath, 'utf8');

// Replace TOOL_PAGES array
// Regex to find const TOOL_PAGES = [ ... ];
const regex = /const TOOL_PAGES = \[([\s\S]*?)\];/;

if (regex.test(swContent)) {
    swContent = swContent.replace(regex, `const TOOL_PAGES = ${pagesString};`);
    fs.writeFileSync(swPath, swContent);
    console.log(`Updated sw.js with ${allPages.length} pages.`);
} else {
    console.error('Could not find TOOL_PAGES in sw.js');
}
