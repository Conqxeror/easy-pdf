const fs = require('fs');
const path = require('path');

const toolDataPath = path.join(__dirname, '../src/lib/toolData.js');
const toolDataJsonPath = path.join(__dirname, '../src/lib/toolData.json');

// Read the JS file
const content = fs.readFileSync(toolDataPath, 'utf8');

// Extract the array content using regex
// This is a bit fragile but works if the format is consistent
const match = content.match(/export const toolsData = (\[[\s\S]*?\]);/);

if (!match) {
    console.error('Could not find toolsData array in src/lib/toolData.js');
    // Debug: print first 500 chars
    console.log(content.substring(0, 500));
    process.exit(1);
}

let arrayContent = match[1];
console.log('Found array content length:', arrayContent.length);


// Remove imports and JSX
// 1. Remove icon: <...> lines
arrayContent = arrayContent.replace(/icon:\s*<[^>]+(\/>|>\s*<\/[^>]+>)/g, 'icon: null');
// 2. Remove icon: <...> with attributes that might span lines or have nested braces? 
// The above regex is simple. Let's try to be safer by just replacing the icon property line.
// Assuming "icon:" is at the start of the line (after whitespace)
arrayContent = arrayContent.replace(/^\s*icon:.*$/gm, '    "icon": null,');

// 3. Convert keys to quoted keys - SKIPPED for manual parsing
// arrayContent = arrayContent.replace(/(\s)(\w+):/g, '$1"$2":');

// 4. Fix trailing commas if any (JSON doesn't like them) - actually JSON.parse might fail.
// Let's use eval? No, unsafe.
// Let's try to clean it up enough to be valid JSON.
// Remove comments
arrayContent = arrayContent.replace(/\/\/.*$/gm, '');

// Replace single quotes with double quotes for strings
arrayContent = arrayContent.replace(/'/g, '"');

// Fix the "icon": null, which might have a trailing comma issue if it's the last item
// But usually it's not.

try {
    // We need to be careful about the "icon" replacement.
    // Let's try a different approach: Execute the file? No, it has imports.
    
    // Let's use a more robust regex approach to extract objects.
    // Or just manually construct the JSON from the regex matches of properties.
    
    // Actually, let's just use the existing toolData.json as a base and update it?
    // No, we want to overwrite it.
    
    // Let's try to parse the array content as a JS object using Function constructor?
    // We need to mock the icon variable names if they are used.
    // But the icon values are JSX, e.g. <Files ... />.
    
    // Let's go with the regex extraction of properties.
    const tools = [];
    // Match objects between { and }, assuming they are top level in the array
    // This regex is tricky for nested braces.
    // Let's split by "}," which is a common delimiter in this file structure
    const items = arrayContent.split('},');
    
    items.forEach(item => {
        const tool = {};
        
        // Extract properties
        const props = ['href', 'title', 'description', 'keywords', 'seoTitle', 'seoDescription', 'features', 'relatedTools', 'category', 'ogTitle', 'ogSubtitle'];
        
        props.forEach(prop => {
            // Regex for string properties: prop: "value" or prop: 'value'
            // We need to handle multiline strings or different quoting
            const strRegex = new RegExp(`${prop}:\\s*["']([^"']+)["']`);
            const strMatch = item.match(strRegex);
            if (strMatch) {
                tool[prop] = strMatch[1];
            }
            
            // Regex for array properties: prop: ["a", "b"]
            if (prop === 'keywords' || prop === 'features' || prop === 'relatedTools') {
                 const arrRegex = new RegExp(`${prop}:\\s*\\[([\\s\\S]*?)\\]`);
                 const arrMatch = item.match(arrRegex);
                 if (arrMatch) {
                     const items = arrMatch[1].match(/["']([^"']+)["']/g);
                     if (items) {
                         tool[prop] = items.map(i => i.replace(/['"]/g, ''));
                     } else {
                         tool[prop] = [];
                     }
                 }
            }
        });
        
        if (tool.href) {
            tools.push(tool);
        }
    });
    
    fs.writeFileSync(toolDataJsonPath, JSON.stringify(tools, null, 2));
    console.log(`Successfully synced ${tools.length} tools to toolData.json`);
    
} catch (e) {
    console.error('Error parsing toolData.js:', e);
    process.exit(1);
}
