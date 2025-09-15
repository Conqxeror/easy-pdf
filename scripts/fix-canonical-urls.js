const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../src/app');

// Helper function to recursively find all layout.js files
const findLayoutFiles = (dir) => {
  let layoutFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignore API directories and certain other paths
      if (file !== 'api' && file !== 'components' && file !== 'lib' && file !== 'styles') {
        layoutFiles = layoutFiles.concat(findLayoutFiles(filePath));
      }
    } else if (file === 'layout.js') {
      layoutFiles.push(filePath);
    }
  }

  return layoutFiles;
};

// Function to transform the content of a layout.js file
const transformLayoutFile = (filePath) => {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const toolName = path.basename(path.dirname(filePath));

  const oldUrl = `https://easy-pdf-murex.vercel.app/${toolName}`; 
  const newUrl = `https://easy-pdf-murex.vercel.app/${toolName}`; 

  if (fileContent.includes(oldUrl)) {
    fileContent = fileContent.replace(new RegExp(oldUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newUrl);
    fs.writeFileSync(filePath, fileContent);
    console.log(`Successfully transformed: ${filePath}`);
  }
};

// Main function to run the script
const run = () => {
  const allLayoutFiles = findLayoutFiles(appDir);
  const toolLayoutFiles = allLayoutFiles.filter(file => {
    const dir = path.dirname(file);
    const parentDir = path.basename(dir);
    // Exclude non-tool pages
    return !['.', 'about', 'categories', 'sponsors', 'tools', 'api'].includes(parentDir) && parentDir !== 'app';
  });

  for (const pageFile of toolLayoutFiles) {
    try {
      transformLayoutFile(pageFile);
    } catch (error) {
      console.error(`Error transforming ${pageFile}:`, error);
    }
  }
};

run();