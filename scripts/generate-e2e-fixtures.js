const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
const requiredFixtures = [
  'sample.docx',
  'sample.html',
  'sample.jpg',
  'sample.png',
  'sample1.pdf',
  'sample2.pdf',
];

fs.mkdirSync(fixturesDir, { recursive: true });

const missing = requiredFixtures.filter((name) => !fs.existsSync(path.join(fixturesDir, name)));

if (missing.length > 0) {
  console.error(`Missing required E2E fixtures: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`E2E fixtures ready in ${fixturesDir}`);