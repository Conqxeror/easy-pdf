const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(walk(res));
    } else {
      results.push(res);
    }
  });
  return results;
}

const appDir = path.resolve(__dirname, '..', 'src', 'app');
if (!fs.existsSync(appDir)) {
  console.error('src/app not found');
  process.exit(2);
}

const allFiles = walk(appDir);
const pageFiles = allFiles.filter((f) => f.endsWith(path.join('page.js')) || f.endsWith('page.js'));

const compliant = [];
const nonCompliant = [];

pageFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (/import\s+.*ToolPageLayout/.test(content) || content.includes('<ToolPageLayout')) {
      compliant.push(path.relative(process.cwd(), file));
    } else {
      nonCompliant.push(path.relative(process.cwd(), file));
    }
  } catch (err) {
    console.error('Error reading', file, err.message);
  }
});

console.log('Compliant (use ToolPageLayout):', compliant.length);
compliant.forEach((p) => console.log('  ', p));
console.log('\nNon-compliant (missing ToolPageLayout):', nonCompliant.length);
nonCompliant.forEach((p) => console.log('  ', p));

// Exit with code 0
process.exit(0);
