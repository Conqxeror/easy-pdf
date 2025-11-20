const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function createDocx(path) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [ new TextRun({ text: 'E2E sample docx title', bold: true }) ] }),
          new Paragraph('This is a generated docx file used for Playwright e2e tests.'),
          new Paragraph('Contains a basic table below:'),
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path, buffer);
}

if (require.main === module) {
  try {
    fs.mkdirSync('tests/fixtures', { recursive: true });
    createDocx('tests/fixtures/sample.docx').then(() => console.log('DOCX created'));
  } catch (err) {
    console.error('Failed to create docx fixture', err);
    process.exit(1);
  }
}

module.exports = { createDocx };